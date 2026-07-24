<style>
    .table {
        margin: 2rem;
        max-width: 40rem;
    }
</style>

<script lang="ts">
    import { BitonicMerge } from "$lib/bitonic-merge";
    import { TimingTable } from "$lib/timing-table";
    import Blog from "../../components/blog.svelte";
    import CodeBlock from "../../components/code-block.svelte";
    import CodeIndent from "../../components/code-indent.svelte";
    import CodeInline from "../../components/code-inline.svelte";
    import CodeLine from "../../components/code-line.svelte";

    let table_sorted: HTMLElement;
    let vectorized_randomNet7: HTMLElement;
    let vectorized_randomNet8: HTMLElement;
    let vectorized_lastNet7: HTMLElement;
    let vectorized_lastNet8: HTMLElement;
    let bitonic_random: HTMLElement;
    let bitonic_same: HTMLElement;
    let bitonic_tiny: HTMLElement;
    let bitonic_stair: HTMLElement;
    let bitonic_concat: HTMLElement;

    $effect(() => {
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.sorted_randomIntegers);
            
            table_sorted.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.vector_randomIntegers_net7);
            
            vectorized_randomNet7.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.vector_randomIntegers_net8);
            
            vectorized_randomNet8.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.vector_lastOfA_isLessThan_firstOfB_net7);
            
            vectorized_lastNet7.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.vector_lastOfA_isLessThan_firstOfB_net8);
            
            vectorized_lastNet8.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.final_randomIntegers);
            
            bitonic_random.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.final_stairSteps);
            
            bitonic_stair.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.final_concatenated);
            
            bitonic_concat.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.final_sameInput);
            
            bitonic_same.appendChild(table.element);
        })();
        (() => {
            const table = TimingTable.buildTable();
            table.update(BitonicMerge.final_tiny);
            
            bitonic_tiny.appendChild(table.element);
        })();
    });

</script>

<Blog>
    <h2>About fast merge algorithms</h2>
    
    <p>There's surprisingly little information on the internet about how to merge two sorted arrays. Yes, there are probably thousands of research papers about sorting, including merge sort, but what if you want to just merge two arrays? Sorting is often in place and assumes that the arrays similar in size, which wasn't suitable for my specific use case. <a href="https://dirtyhandscoding.wordpress.com/2017/08/02/vectorizing-stdmerge-with-vpermd-from-avx2-and-lookup-table/">I did however find this C++ approach</a>. It's an impressive solution that uses AVX2 and lookup tables to reduce execution time down to about 40%. Let's start at the same baseline see if we can get lower than that.</p>
    <p>The following samples are in C#, not C++, and therefore not comparable. A direct comparison would be interesting but this blog post is quite long already.</p>
    <h3>A Baseline</h3>
    <p>Let's take a look at the trivial algorithm first. We start at zero for all indices, compare two elements each iteration and write the smaller one to the result array. Increment either <CodeInline code="idxA" /> or <CodeInline code="idxB" />, always increment the result index. Repeat until one input has no more elements left. Copy the raminder of the other array.</p>
    
    <!-- svelte-ignore attribute_quoted -->
    <CodeBlock>
        <CodeLine code="static void MergeScalar<T, TComparer> {'{'}" />
        <CodeIndent>
            <CodeLine code="Span<T> a," />
            <CodeLine code="Span<T> b," />
            <CodeLine code="Span<T> result," />
            <CodeLine code="TComparer comparer)" />
            <CodeLine code="where TComparer : IComparer<T>" />
        </CodeIndent>
        <CodeLine />
        <CodeIndent>
            <CodeLine code="if (a.Length + b.Length > result.Length) throw new ArgumentException({'"'}...{'"'});" />
            <CodeLine />
            <CodeLine code="var idxA = 0;" />
            <CodeLine code="var idxB = 0;" />
            <CodeLine code="var idxR = 0;" />
            <CodeLine />
            <CodeLine code="while (idxA < a.Length && idxB < b.Length)" />
            <CodeLine code="{'{'}" />
            <CodeIndent>
                <CodeLine code="var c = comparer.Compare(a[idxA], b[idxB]);" />
                <CodeLine />
                <CodeLine code="if (c <= 0)" />
                <CodeLine code="{'{'}" />
                <CodeIndent>
                    <CodeLine code="result[idxR] = a[idxA];" />
                    <CodeLine code="idxA++;" />
                </CodeIndent>
                <CodeLine code="{'}'}" />
                <CodeLine code="else" />
                <CodeLine code="{'{'}" />
                <CodeIndent>
                    <CodeLine code="result[idxR] = a[idxB];" />
                    <CodeLine code="idxB++;" />
                </CodeIndent>
                <CodeLine code="{'}'}" />
                <CodeLine code="idxR++;" />
                <CodeLine />
                <CodeLine code="if (c <= 0)" />
                <CodeLine code="{'{'}" />
                <CodeIndent>
                    <CodeLine code="a.Slice(idxA).CopyTo(result.Slice(idxR));" />
                </CodeIndent>
                <CodeLine code="{'}'}" />
                <CodeLine code="else" />
                <CodeLine code="{'{'}" />
                <CodeIndent>
                    <CodeLine code="b.Slice(idxB).CopyTo(result.Slice(idxR));" />
                </CodeIndent>
                <CodeLine code="{'}'}" />
            </CodeIndent>
            <CodeLine code="{'}'}" />
        </CodeIndent>
        <CodeLine code="{'}'}" />
    
    </CodeBlock>

    <p>Not too difficult. But is it even worth to write a merge algorithm in 2024 when you could just concatenate two arrays and sort them? Quicksort and all its variations are probably the most researched and optimized topic in computer science.</p>
    <div class="table" bind:this={table_sorted}></div>

    <p>Neat! While the results aren't too surprising, it's nice to see a simple but specialized algorithm beat the optimized but lazy method. Can we do better?</p>
    <h3>Branchless SIMD Merge</h3>
    <p>I'm quite proud of this one. I don't claim to be the first who found it but I came up with it completely on my own. It's an extension of the scalar version, which exploits the possibility that the larger array contains more elements clumped together. The code from this point on is specific to integers but should be simple to extend to any data type that supports vectorization.</p>
    <p>The base structure is similar to the scalar one, except that we operate on raw pointers, which is required by <CodeInline code="Vector256.Load" /> and should also eliminate a couple of bounds checks.</p>

    <CodeBlock>
        <CodeLine code="static void MergeVectorized(Span<int> a, Span<int> b, Span<int> result)" />
        <CodeLine code="{'{'}" />
        <CodeIndent>
            <CodeLine code="if (a.Length + b.Length > result.Length) throw new ArgumentException({'"'}...{'"'});" />
            <CodeLine code="if (a.Length < b.Length)" />
            <CodeLine code="{'{'}" />
            <CodeIndent>
                <CodeLine code="MergeVectorized(b, a, result);" />
                <CodeLine code="return;" />
            </CodeIndent>
            <CodeLine code="{'}'}" />
            <CodeLine code="var idxA = 0;" />
            <CodeLine code="var idxB = 0;" />
            <CodeLine code="var idxR = 0;" />
            <CodeLine code="var countVec = Vector256<int>.Count;" />
            <CodeLine code="unsafe" />
            <CodeLine code="{'{'}" />
            <CodeIndent>
                <CodeLine code="fixed (int* ptrA = a)" />
                <CodeLine code="fixed (int* ptrB = b)" />
                <CodeLine code="fixed (int* ptrR = result)" />
                <CodeLine code="{'{'}" />
                <CodeIndent>
                    <CodeLine code="while ((idxA + countVec) < a.Length && idxB < b.Length)" />
                    <CodeLine code="{'{'}" />
                    <CodeIndent>
                        <CodeLine code="// ... see next section ..." />
                    </CodeIndent>
                    <CodeLine code="{'}'}" />
                    </CodeIndent>
                <CodeLine code="{'}'}" />
            </CodeIndent>
            <CodeLine code="{'}'}" />
            <CodeLine code="MergeScalar(" />
            <CodeIndent>
                <CodeLine code="a.Slice(idxA)," />
                <CodeLine code="b.Slice(idxB)," />
                <CodeLine code="result.Slice(idxR)," />
                <CodeLine code="...);" />
            </CodeIndent>
        </CodeIndent>
        <CodeLine code="{'}'}" />
    </CodeBlock>

    <p>Now to the interesting part. We load eight elements from the first argument into a SIMD register and broadcast a single element from the second argument into a second register. As an example, <CodeInline code="vecA" /> might contain <CodeInline code="[1, 2, 3, 5, 6, 7, 8, 9]" /> and <CodeInline code="vecB" /> <CodeInline code="[4, 4, 4, 4, 4, 4, 4, 4]" /> (<CodeInline code="4" /> is missing in <CodeInline code="vecA" />).</p>
    <p>Compare both lanes, <CodeInline code="[-1, -1, -1, 0, 0, 0, 0, 0]" />, and select the elements based on that comparison: <CodeInline code="[1, 2, 3, 4, 4, 4, 4, 4]" />. This part is unconditionally written to <CodeInline code="result" />.</p>
    <p>The comparison result is then used again to figure out how much work we actually did. <CodeInline code="vecCmp.ExtractMostSignificantBits()" /> would result in <CodeInline code="11100000" /> here and <CodeInline code="PopCount(11100000)" /> in <CodeInline code="3" />. <CodeInline code="incrementB" /> is always one, except when all elements in <CodeInline code="vecA" /> were less than <CodeInline code="vecB" />.</p>

    <CodeBlock>
        <CodeLine code="var vecA = Vector256.Load(ptrA + idxA);" />
        <CodeLine code="var vecB = Vector256.Create(*(ptrB + idxB));" />
        <CodeLine />
        <CodeLine code="var vecCmp = Vector256.LessThan(vecA, vecB);" />
        <CodeLine code="vecA = Vector256.ConditionalSelect(vecCmp, vecA, vecB);" />
        <CodeLine code="vecA.Store(ptrR + idxR);" />
        <CodeLine />
        <CodeLine code="var cmp = vecCmp.ExtractMostSignificantBits();" />
        <CodeLine code="var storeB = BitOperations.PopCount(cmp);" />
        <CodeLine code="var incrementB = 1 - (int)(cmp &lt;&lt; 7);" />
        <CodeLine />
        <CodeLine code="idxA += storeB;" />
        <CodeLine code="idxB += incrementB;" />
        <CodeLine code="idxR += storeB + incrementB;" />
    </CodeBlock>

    <div class="table" bind:this={vectorized_randomNet7}></div>

    <p>Same ratio as the other blog post with a lot less code. They're different compilers, even programming languages, but the ratio is similar and that should be a good indicator, right? Oh, look! .NET 8 was released.</p>

    <div class="table" bind:this={vectorized_randomNet8}></div>

    <p>These are the measurments from my desktop machine. My laptop's results are 15% closer because the scalar code allows the CPU to boost higher. Looks like my assumption was wrong.</p> 
        
    <p>There's also the case where both arrays could just be concatenated because the elemnts of one are strictly less than the other's. Depending on which is which, we hit the worst case, which went from tolerable to poor.</p>

    <div class="table" bind:this={vectorized_lastNet7}></div>
    <div class="table" bind:this={vectorized_lastNet8}></div>

    <h3>Bitonic Merge</h3>
    <p>Back to the drawing board. I knew that Bitonic sorters were an option but it took me some time to wrap my head around it. At least we can skip half of the algorithm because we're only interested in the merge part.</p>
    <p>My first implementation was 4 times slower than the scalar variant. Bitonic merge takes an ascending and a descending sequence and computes the mininmum/maximum between both. This results in two new sequences where the all elements of the min sequence are less than all elements of the other. This principle is then applied recursively to half of each sequence, until there's nothing left to compare. The algorithm only works with input lengths that are a power of two but many of the comparisons can be done in parallel.</p>
    <p>At one point it just clicked and everything fell into place but until that moment it wasn't intuitive at all. I would recommend to just write the algorithm yourself, if you're interested, with one unit test for every shuffle. And if you ever meet someone who doesn't believe in unit tests, make them implement this thing.</p>

    <CodeBlock>
            <CodeLine code="var vecA = Load(ptrA + idxA);" />
            <CodeLine code="var vecB = Load(ptrB + idxB);" />
            <CodeLine code="var copyVecA = vecA;" />
            <CodeLine code="vecB = Shuffle(vecB, Create(7, 6, 5, 4, 3, 2, 1, 0));" />
            <CodeLine />
            <CodeLine code="vecA = Min(vecA, vecB);" />
            <CodeLine code="var incrementA = BitOperations.PopCount(" />
            <CodeIndent>
                <CodeLine code="Equals<int>(vecA, copyVecA).ExtractMostSignificantBits());" />
            </CodeIndent>
            <CodeLine code="vecA = CompareAndSwap128(vecA);" />
            <CodeLine code="vecA = Shuffle(vecA, Create(0, 1, 4, 5, 2, 3, 6, 7));" />
            <CodeLine code="vecA = CompareAndSwap128(vecA);" />
            <CodeLine code="vecA = Shuffle(vecA, Create(0, 2, 4, 6, 1, 3, 5, 7));" />
            <CodeLine code="vecA = CompareAndSwap128(vecA);" />
            <CodeLine code="vecA = Shuffle(vecA, Create(0, 4, 2, 6, 1, 5, 3, 7));" />
            <CodeLine />
            <CodeLine code="vecA.Store(ptrR + idxR);" />
            <CodeLine />
            <CodeLine code="idxA += incrementA;" />
            <CodeLine code="idxB += countVec - incrementA;" />
            <CodeLine code="idxR += countVec;" />
    </CodeBlock>
    <CodeBlock>
            <CodeLine code="[MethodImpl(MethodImplOptions.AggressiveInlining)]" />
            <CodeLine code="public static Vector256<int>; CompareAndSwap128(Vector256<int> vec)" />
            <CodeLine code="{'{'}" />
            <CodeIndent>
                <CodeLine code="var lower = Vector128.Min(vec.GetLower(), vec.GetUpper());" />
                <CodeLine code="var upper = Vector128.Max(vec.GetLower(), vec.GetUpper());" />
                <CodeLine />
                <CodeLine code="return Create(lower, upper);" />
            </CodeIndent>
            <CodeLine code="{'}'}" />
    </CodeBlock>

    <p>Except for the shuffles, this only uses <CodeInline code="Vector256" /> at the very start. I hesitated to improve this further. Using two full lanes requires more shuffles and <CodeInline code="ConditionalSelect" />, so doubling the amount of data without AVX-512 support may not be worth it. Luckily, sometimes, you don't have to build a 100% correct solution to benchmark it, you just need the right instruction count. The results were promising, so I did it properly. It's ugly and long but doesn't introduce any new concepts.</p>

    <CodeBlock>
        <CodeLine code="vecA = Load(ptrA + idxA);" />
        <CodeLine code="vecB = Load(ptrA + countVec + idxA);" />
        <CodeLine code="vecC = Load(ptrB + countVec + idxB);" />
        <CodeLine code="vecD = Load(ptrB + idxB);" />
        <CodeLine code="copyVecA = vecA;" />
        <CodeLine code="copyVecB = vecB;" />
        <CodeLine code="vecC = Shuffle(vecC, Create(7, 6, 5, 4, 3, 2, 1, 0));" />
        <CodeLine code="vecD = Shuffle(vecD, Create(7, 6, 5, 4, 3, 2, 1, 0));" />
        <br>
        <CodeLine code="vecA = Min(vecA, vecC);" />
        <CodeLine code="vecB = Min(vecB, vecD);" />
        <CodeLine code="var incrementA = // same as above with both vecA/vecB and copyVecA/copyVecB" />
        <br>
        <CodeLine code="vecC = Min(vecA, vecB);" />
        <CodeLine code="vecD = Max(vecA, vecB);" />
        <br>
        <CodeLine code="vecA = ConditionalSelect(Create(-1, -1, -1, -1, 0, 0, 0, 0), vecC, vecD);" />
        <CodeLine code="vecB = ConditionalSelect(Create(-1, -1, -1, -1, 0, 0, 0, 0), vecD, vecC);" />
        <CodeLine code="vecB = Shuffle(vecB, Create(4, 5, 6, 7, 0, 1, 2, 3));" />
        <br>
        <CodeLine code="vecC = Min(vecA, vecB);" />
        <CodeLine code="vecD = Max(vecA, vecB);" />
        <CodeLine code="// ... and so on..." />
    </CodeBlock>

    <h3>Final Benchmarks</h3>
    <p>Desktop Ryzen 7 5700, .NET 8</p>

    <div class="table" bind:this={bitonic_random}></div>
    <div class="table" bind:this={bitonic_same}></div>
    <div class="table" bind:this={bitonic_tiny}></div>
    <div class="table" bind:this={bitonic_stair}></div>
    <div class="table" bind:this={bitonic_concat}></div>

    <h3>Conclusion</h3>
    <p>Remember just concatenating and sorting the array at the beginning of this post? The final solution is not only a hundred times more complex, it's also that much faster, which I'd call a win. Although there are probably still a few unoptimized spots left, I'm happy with the results. If someone wants to take it further, there's always <a href="https://inria.hal.science/hal-01512970v1/document">AVX-512 support</a>. Happy coding!</p>
</Blog>