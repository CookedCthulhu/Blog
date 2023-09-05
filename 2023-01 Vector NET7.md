
# Vectorization has come a long way in .NET

Vectorization, or Single Instruction Multiple Data (SIMD), is the art of performing the same operation simultaneously on a small block of different pieces of data. While many compilers do support some kind of auto-vectorization, it's often fragile and even small changes can break everything. But SIMD code written by hand is difficult to read and has to be implemented multiple times for multiple platforms, with fallbacks if the customer's CPU doesn't support it.

Over the Christmas holidays I had the chance to revisit and port a personal project from .NET 6 to .NET 7 and gave vectorization a second look. I don't think the above statement is 100% true anymore. In some way, it turned out to be the opposite. Let me give you an example, a `Color` struct with two methods: `Equals` as an example for an operator and `AlphaBlend`, which is a simple textbook implementation of layering two pixels on top of each other.

```c#
[StructLayout(LayoutKind.Sequential)]
public readonly struct Color
{
    // Alpha aka opacity
    public float A { get; }
    // Red
    public float R { get; }
    // Green
    public float G { get; }
    // Blue
    public float B { get; }

    // constructor omitted

    public Color AlphaBlend(Color top) => new(
        top.A + A * (1 - top.A),
        top.R + R * (1 - top.A),
        top.G + G * (1 - top.A),
        top.B + B * (1 - top.A));

    public bool Equals(Color other) => 
           A == other.A
        && R == other.R
        && G == other.G
        && B == other.B;
}

```

While both methods are four lines long, the actual logic is only one line, repeated four times. As the name suggests, Single Instruction Multiple Data is meant for these kinds of tasks.

## C#'s Vector in the past

C# provides four different types that help us with vectorization: `Vector64<T>`, `Vector128<T>`, `Vector256<T>` and `Vector<T>`. `Vector<T>` has an unspecified size and will use one of the other three types internally. The others are fixed size, as their name suggests, but can be split in different ways. One `Vector128` can hold two 64 bit `long`, four 32 bit `int` or eight 16 bit `short`. Floating point numbers are supported as well but custom structs will fail at runtime.

I did implement a vectorized version of `AlphaBlend` prior to C# 11 for performance and curiosity. It wasn't pretty. `Color` is a struct of four 32 bit `float`s, which is 128 bit in total, the same size as `Vector128<float>`. To perform operations on a `Vector128`, you had to use the functions defined in the `Sse`/`Avx` static classes. These will fail at runtime if the host's CPU doesn't support them and it's up to you to cover the possibility.

```c#
// Don't destroy the performance gains before doing the actual calculation.
public Vector128<float> Vec128 => Unsafe.As<ColorF32, Vector128<float>>(ref Unsafe.AsRef(in this));

public Color AlphaBlend(Color top) 
{
    if (Sse.IsSupported)
    {
        var vResult = Sse.Multiply(Vec128, Vector128.Create(1.0f - top.A));
        vResult = Sse.Add(vResult, top.Vec128);
        return new(vResult);
    }
    else
    {
        return new(
            a: top.A + A * (1 - top.A),
            r: top.R + R * (1 - top.A),
            g: top.G + G * (1 - top.A),
            b: top.B + B * (1 - top.A));
    }
}

```

Are those unsafe casts safe? The unit tests pass but I'm not sure I would risk it in production. It doesn't support ARM CPUs and looks a lot scarier in languages that only provide cryptic names or have to fall back to metaprogramming to eliminate the if-else branch. At least C#'s JIT is smart enough to detect such simple patterns at runtime and rewrite the function without branches (depending on what the host's CPU supports).

## C# 11's Vector

With C# 11 you don't have to write the code above anymore because the `Vector` classes have their own operators and utility functions now! It's a small change that has a massive impact on readability and maintainability. The vectorized version is now on par with the scalar version in terms of readability, and even a little shorter. Since it was so easy to make the entire class vectorized, I also changed the ARGB values to be of type `Vector128<float>` internally and provide getters instead, which yielded additional performance improvements. The `Unsafe` methods seem to not be zero cost like I thought initially. Generic Math (also new in C# 11, not shown here) was a breeze to implement.

```c#
public readonly struct Color
{
    private readonly Vector128<float> argb;

    public Vector128<float> Vector => argb;
    // Alpha
    public float A => argb.GetElement(0);
    // Red
    public float R => argb.GetElement(1);
    // Green
    public float G => argb.GetElement(2);
    // Blue
    public float B => argb.GetElement(3);

    // constructor omitted

    public Color AlphaBlend(Color top) => new(Vector * Vector128.Create(1.0f - top.A) + top.Vector);

    public bool Equals(Color other) => Vector == other.Vector;
}

```

Are there still functions that cannot be implemented this way? Would it be even faster to `MemoryMarhsal.Cast` an array of colors to a `Vector256<float>`? Of course. But the next time you write a simple container of homogenous data, stop and think for a second if you could express it as a `Vector` internally. Maybe someone will thank you for your extra care someday, or at least learn something new while looking through your source code.
