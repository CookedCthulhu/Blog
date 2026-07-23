<style>
    .table {
        margin: 2rem;
        max-width: 40rem;
    }
</style>

<script lang="ts">
    import { BitonicMerge } from "$lib/bitonic-merge";
    import { TimingTable } from "$lib/timing-table";
    import Blog from "../blog.svelte";
    import CodeBlock from "../code-block.svelte";
    import CodeIndent from "../code-indent.svelte";
    import CodeInline from "../code-inline.svelte";
    import CodeLine from "../code-line.svelte";

    let table_sorted: HTMLElement;
    let vectorized_randomNet7: HTMLElement;
    let vectorized_randomNet8: HTMLElement;
    let vectorized_lastNet7: HTMLElement;
    let vectorized_lastNet8: HTMLElement;

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

    <div class="table" bind:this={vectorized_randomNet7}></div>
    <div class="table" bind:this={vectorized_randomNet8}></div>
    <div class="table" bind:this={vectorized_lastNet7}></div>
    <div class="table" bind:this={vectorized_lastNet8}></div>
</Blog>