# A stupid but effective merge vertorization

I was looking for a fast algorithm that merges two sorted arrays. I don't claim to be the first who found this algorithm, I'm probably not, but I also didn't find anything similar during my Google searches. I did however find [this approach](https://dirtyhandscoding.wordpress.com/2017/08/02/vectorizing-stdmerge-with-vpermd-from-avx2-and-lookup-table/). It's an impressive solution that reaches a ratio of 0.41 - 0.49 between the trivial algorithm and the final, heavily optimized one.

## A Baseline

Is it even worth to write a merge algorithm in 2024 when you could just concatenate two arrays and sort them? Quicksort and all its variations are probably the most researched and optimized topic in computer science. The following benchmark serves as a rough baseline. It copies the two arrays with random but sorted numbers to a fixed size buffer and then sorts the buffer.

All benchmarks were done with a Ryzen 7 PRO 6850H (8 cores, 16 threads), BenchmarkDotNet and NET 7.

```
| n    | Method | Mean       | Error    | StdDev   |
| ---- | ------ | ---------- | -------- | -------  |
| 1000 | Sorted |   21050 ns |   198 ns |   185 ns |
| 100k | Sorted | 6938859 ns | 76125 ns | 71208 ns |
```

## Naive but clean

We start at zero for both input arrays, compare both elements and write the smaller one to the result array. Increment either `idxA` or `idxB`, always increment the result index. Repeat until one input has no more elements left. Copy the raminder of the other array.

```c#
static void MergeScalar<T, TComparer>(
    Span<T> a, 
    Span<T> b, 
    Span<T> result, 
    TComparer comparer) 
    where TComparer : IComparer<T>
{
    // ... bounds checks ...

    var idxA = 0;
    var idxB = 0;
    var idxR = 0;

    while (idxA < a.Length && idxB < b.Length)
    {
        var c = comparer.Compare(a[idxA], b[idxB]);

        if (c <= 0)
        {
            result[idxR] = a[idxA];
            idxA++;
        }
        else
        {
            result[idxR] = b[idxB];
            idxB++;
        }

        idxR++;
    }

    if (idxA < a.Length)
    {
        a.Slice(idxA).CopyTo(result.Slice(idxR));
    }
    else if (idxB < b.Length)
    {
        b.Slice(idxB).CopyTo(result.Slice(idxR));
    }
}
```

How does it compare to just sorting two arrays?

```
| n    | Method | Mean       | Error    | StdDev   | Ratio |
| ---- | ------ | ---------- | -------- | -------  | ----- |
| 1000 | Sorted |   21050 ns |   198 ns |   185 ns |  1.00 |
| 1000 | Scalar |    5757 ns |    85 ns |    80 ns |  0.25 |

| n    | Method | Mean       | Error    | StdDev   | Ratio |
| ---- | ------ | ---------- | -------- | -------  | ----- |
| 100k | Sorted | 6938859 ns | 76125 ns | 71208 ns |  1.00 |
| 100k | Scalar |  992127 ns | 12221 ns | 11432 ns |  0.14 |

```

Neat! While the results aren't too surprising, it's nice to see a simple but specialized algorithm beat the optimized but lazy method. Can we do better?

## Branchless SIMD merge

The following snippets only support integers but it should be simple to extend the code to any data type that supports vectorization.

The first part is very similar to the scalar version. It introduces a new variable, `countVec`, which is the amount of integers a 256 bit SIMD lane can hold. It should always be 8. We also swap the input if `a` is less than `b`, so that `b` is always the smaller of the two arrays.

Next we ignore all safety measures from the .NET run time by converting our `Span`s to raw pointers. This is required by `Vector256.Load` and my preferred, semi-safe method `MemoryMarshal.Cast` is not possible here.

After we're done with the loop, any leftovers get cleaned up by the scalar algorithm.

```c#
static void MergeVectorized(Span<int> a, Span<int> b, Span<int> result)
{
    // ... bounds checks ...

    if (a.Length < b.Length)
    {
        MergeVectorized(b, a, result);
        return;
    }
    var idxA = 0;
    var idxB = 0;
    var idxR = 0;
    var countVec = Vector256<int>.Count;

    unsafe
    {
        fixed (int* ptrA = a)
        fixed (int* ptrB = b)
        fixed (int* ptrR = result)
        {
            while ((idxA + countVec) < a.Length && idxB < b.Length)
            {
                // ...
            }
        }
    }

    MergeScalar(
        a.Slice(idxA),
        b.Slice(idxB),
        result.Slice(idxR),
        ...);
}

```

Now to the interesting part. We load eight elements from the first argument into a SIMD register and broadcast a single element from the second argument into a second register. As an example, `vecA` might contain `[1, 2, 3, 5, 6, 7, 8, 9]` and `vecB` `[4, 4, 4, 4, 4, 4, 4, 4]` (`4` is missing in `vecA`). 

The next step is to compare both, which results in all bits set to 1 if the condition evalutes to true: `[-1, -1, -1, 0, 0, 0, 0, 0]`. `ConditionalSelect` combines masks and combines two registers: `[1, 2, 3, 4, 4, 4, 4, 4]`.

The lower half is dedicated to figuring out how much work we actually did correctly. 

```c#
var vecA = Vector256.Load(ptrA + idxA);
var vecB = Vector256.Create(*(ptrB + idxB));

var vecCmp = Vector256.LessThan(vecA, vecB);
vecA = Vector256.ConditionalSelect(vecCmp, vecA, vecB);
vecA.Store(ptrR + idxR);

var cmp = vecCmp.ExtractMostSignificantBits();
var storeB = BitOperations.PopCount(cmp);
var incrementB = 1 - (int)(cmp >> 7);

idxA += storeB;
idxB += incrementB;
idxR += storeB + incrementB;
```

## More Benchmarks

[A] Two arrays with random numbers:

```
| Method | n       | Mean         | Error     | StdDev    | Ratio |
|------- |-------- |-------------:|----------:|----------:|------:|
| Scalar | 16384   |    152.42 us |  0.789 us |  0.616 us |  1.00 |
| Vector | 16384   |     65.86 us |  0.101 us |  0.079 us |  0.43 |
|        |         |              |           |           |       |
| Scalar | 262144  |  2,588.85 us |  4.400 us |  3.900 us |  1.00 |
| Vector | 262144  |  1,050.50 us |  4.399 us |  3.900 us |  0.41 |
|        |         |              |           |           |       |
| Scalar | 4194304 | 40,061.75 us | 53.044 us | 44.294 us |  1.00 |
| Vector | 4194304 | 16,837.66 us | 21.199 us | 18.792 us |  0.42 |
```

[B] Both inputs are exactly the same:

```
| Method | n       | Mean         | Error     | StdDev    | Ratio |
|------- |-------- |-------------:|----------:|----------:|------:|
| Scalar | 16384   |     84.07 us |  0.478 us |  0.424 us |  1.00 |
| Vector | 16384   |     64.76 us |  0.090 us |  0.075 us |  0.77 |
|        |         |              |           |           |       |
| Scalar | 262144  |  1,376.61 us | 13.836 us | 12.265 us |  1.00 |
| Vector | 262144  |  1,034.87 us |  1.869 us |  1.459 us |  0.75 |
|        |         |              |           |           |       |
| Scalar | 4194304 | 21,779.89 us | 27.444 us | 22.917 us |  1.00 |
| Vector | 4194304 | 16,609.06 us | 41.860 us | 39.156 us |  0.76 |
```

[C] Second argument is tiny (3 elements):

```
| Method | n       | Mean          | Error      | StdDev     | Ratio |
|------- |-------- |--------------:|-----------:|-----------:|------:|
| Scalar | 16384   |     40.548 us |  0.0345 us |  0.0288 us |  1.00 |
| Vector | 16384   |      9.088 us |  0.0446 us |  0.0417 us |  0.22 |
|        |         |               |            |            |       |
| Scalar | 262144  |    645.688 us |  1.3082 us |  1.1597 us |  1.00 |
| Vector | 262144  |    230.679 us |  1.3135 us |  1.1644 us |  0.36 |
|        |         |               |            |            |       |
| Scalar | 4194304 | 10,206.869 us | 24.1288 us | 21.3896 us |  1.00 |
| Vector | 4194304 |  2,396.282 us |  3.3706 us |  2.6316 us |  0.23 |
```

[D] Alternating stair steps:

```
| Method | n       | Mean         | Error      | StdDev     | Ratio |
|------- |-------- |-------------:|-----------:|-----------:|------:|
| Scalar | 16384   |     90.65 us |   1.421 us |   1.329 us |  1.00 |
| Vector | 16384   |     63.26 us |   0.179 us |   0.167 us |  0.70 |
|        |         |              |            |            |       |
| Scalar | 262144  |  1,493.50 us |  17.780 us |  16.631 us |  1.00 |
| Vector | 262144  |  1,008.88 us |   2.819 us |   2.499 us |  0.68 |
|        |         |              |            |            |       |
| Scalar | 4194304 | 24,242.74 us | 482.982 us | 661.112 us |  1.00 |
| Vector | 4194304 | 16,225.63 us |  82.407 us |  77.084 us |  0.66 |
```

[E] Last element of A is less than first element of B:

```
| Method         | n       | Mean          | Error       | StdDev     | Ratio |
|--------------- |-------- |--------------:|------------:|-----------:|------:|
| Scalar         | 16384   |     47.704 us |   0.0479 us |  0.0374 us |  1.00 |
| Vector         | 16384   |      9.154 us |   0.1031 us |  0.0964 us |  0.19 |
| VectorReversed | 16384   |     67.769 us |   0.4316 us |  0.3604 us |  1.42 |
|                |         |               |             |            |       |
| Scalar         | 262144  |    714.516 us |   2.1171 us |  1.8768 us |  1.00 |
| Vector         | 262144  |    148.442 us |   0.1481 us |  0.1313 us |  0.21 |
| VectorReversed | 262144  |  1,046.653 us |   2.5201 us |  2.3573 us |  1.47 |
|                |         |               |             |            |       |
| Scalar         | 4194304 | 10,242.852 us |  33.5074 us | 26.1604 us |  1.00 |
| Vector         | 4194304 |  3,180.322 us |   7.3414 us |  6.5080 us |  0.31 |
| VectorReversed | 4194304 | 17,352.224 us | 105.9156 us | 88.4443 us |  1.69 |
```

`VectorReversed` in Benchmark E is the worst case, where both inputs are exactly the same length, vectorization does nothing and it's trivial for the branch predictor to optimize the scalar algorithm. As you can see, we're paying with 42% to 69% increased run time. Benchmark B, merging two identical arrays, is another case that should be trivial for the branch predictor. The vectorized version can store two elements per iteration, and with an assumed overhead of roughly 50%, we should finish in about 75% of the time, compared to the scalar version. Which we do. 
