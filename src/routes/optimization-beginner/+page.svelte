<script>
    import Blog from "../../components/blog.svelte";
    import CodeBlock from "../../components/code-block.svelte";
    import CodeIndent from "../../components/code-indent.svelte";
    import CodeInline from "../../components/code-inline.svelte";
    import CodeLine from "../../components/code-line.svelte";
</script>


<!-- svelte-ignore attribute_quoted -->

<Blog>
    <h2>Basic optimization is a skill issue</h2>
    <p>Here's how you get software to run smoothly: decent management, which does not over-promise and under-deliver. Find a few developers who want to learn evey day and take pride in writing good code. Mindset matters more than experience after 5 years in the industry. Don't assign tasks to people they don't want to do - especially if they're in conflict with their actual work. Need a good design? Ask a designer. Listen to the designer. Don't have all requirements yet? Get a requirements engineer. Get a tester. That's about it.</p>
    <p>So, where's the performance part? It's a metric about the health of your team, one of many. A healthy project will not have performance issues because the code is good enough to be adjusted without major issues, the requirements clear enough and the road map generous enough to allow for fixes, should problems arise.</p>

    <h3>Noob traps</h3>
    <p>Let's start with the things I've seen time and time again when people wanted to improve performance. They all have a few things in common: they do indeed help a little, they're what most people do first if something is too slow, they only get introduced if things are slow, and they reduce code quality because it's a bandaid placed on top of a rotten base.</p>
    <p>1. Multithreading. It infects your code base because now everything must assume that 2+ threads can access it. It takes ressources away from your system, ressources which might be needed elsewhere. Maintenance is much, much more complicated. Most people don't know the difference between concurrency and parallelism, what a work efficient algorithm is or anything beyond "locks help". And the expected speedup? 3x? A daring 16x?</p>
    <p>2. Caching. To some people every performance problem looks like a nail and this is their hammer. Messes with your benchmarks, doesn't work when you need it the most. Always comes with overhead. The worst kinds need manual refreshes after every deployment.</p>
    <p>3. "If edge case is true then skip work". Also messes with your benchmarks, complicates your code base and has a high chance to get thrown away because a new feature request makes it no longer applicable. Doesn't help your worst case.</p>

    <h3>Who told you to stop learning?</h3>
    <p>Know the pitfalls of your tech stack. There is no reason to jump into advanced stuff if you're making beginner mistakes that everyone else already avoids.</p>
    <p>Learn the fundamentals: imperative, functional, OOP, algorithms, data structures, design patterns and math. Who told you to stop learning after university? Read blog posts and scientific papers. Dig deep, learn the stuff you care about and enjoy, even if it doesn't map one-to-one to your job. Do not just use libraries, learn their core ideas and how they work under the hood. Narrow minds kill quality more than anything else.</p>
    <p>Get familiar with the profilers available to you. Figure out what works for you. Have fun just exploring.</p>
    <p>Do not use AI to make your life easier. If modern, high level code is awkward/tedious to type, you should stop and think why it's behaving that way. Does it not map well to the rest of your architecture? Did you write the same stuff three times already? Are you missing concepts or data structures, which would solve this? All of those are subtle signs that something is not right. Don't ignore them.</p>
    <p>Probably all of your problems have been solved by someone else already. So in the rare case you have to tackle something that is actually difficult, take a bit of time and do your research. The implementation is faster and less error prone if you know what to do, are aware of all edge cases, ups- and downsides. And even if something fails, it's simpler to fix code that has a link to Wikipedia on top of the file.</p>

    <h3>Generally good patterns</h3>
    <p>Split business logic and abstract utility. Business is messy and complicated and you shouldn't make it worse. So extract the things you can extract and make those fast. You're probably reusing the same datastructures over and over again (hash maps and arrays), so why don't you specialize those to your needs? Tables/grids can be row major, column major or in z-order. They can also contain accelleration structures. That's how databases work and they were not written with your business logic in mind either.</p>
    <p>Functional programming works if done properly, so does imperative. What I see most of the time is a weird mix of functional-when-convenient and imperative-when-convenient where you combine the advantages of neither with the downsides of both. Start functional but actually enforce its rules. No mutations, no logging, no database calls - no side effects in pure functions and no pure-impure mixes except at well defined boundaries.</p>
    <p>Provide options. I have seen way too many ad-hoc <CodeInline code="O(n^2)" /> <CodeInline code="distinct()" /> functions when someone could've just taken the time to write a helper once backed by a hash map. I have also seen way too many <CodeInline code="applyFoo(foo: Foo)" /> methods without their often much faster and easier to read counterpart <CodeInline code="applyFoos(foos: Foo[])" />. Prefer the latter if you want to write only one. On the other hand, if your language likes to allocate everything except primitives on the heap, math heavy stuff benefits from e.g. splitting <CodeInline code="projectPoint2d()" /> into <CodeInline code="projectX()" /> and <CodeInline code="projectY()" />. Provide all three. Hot loops might run twice as fast.</p>

    <h3>Data is everything</h3>
    <p>Instruction count rarely plays a role. Some might say "it absolutely does" but: the goal of this post is not to make your program fast. It's to make it run less like a snail.</p>
    <p>Execution time scales proportionally to the amount of data you touch. There are two metrics for this: asymptotic complexity (how your algorithm scales with large inputs) and constant factors (how long one step takes). The latter might not sound like a data problem but think of your CPU as a chef who wants to chop onions. You can give your chef more demanding instructions, to chop finely and with care, but they will roll their eyes just the same when unload a bucket of potatoes with one onion onto their cutting board.</p>
    <p>An actual real world example: <CodeInline code="log(n)" /> has an upper bound: your PC is a 64 bit system. More than <CodeInline code="2^64" /> bytes are not addressible. Actually, it's <CodeInline code="2^45" />: only the lower 48 bits are used today and the lowest 3 bits are less than one byte, therefore irrelevant. Meaning, an algorithm of complexity <CodeInline code="O(n * log(n))" /> is at worst <CodeInline code="O(n * 45)" />. RAM access costs a modern system roughly 200 clock cycles, an addition less than one. Modern CPUs are very good at hiding those latencies but still, a hypothetical linear algorithm which cache-misses every single element is <CodeInline code="O(n * 200)" />.</p>

    <h3>Optimizations and readability</h3>
    <p>Code almost always improves if you care for it, no matter the reason.</p>
    <p>A more concrete example: My project's charting engine has a purely functional interface and only does full updates, even if it's just mouse movement. A full change detection cycle for up to 100k elements, and the user doesn't notice because it's fast. That must be awful to maintain, right? No, the opposite: there is no branching logic, it always follows the same path. Modern hardware is extremely fast but our perception of what's fast or even possible is far, far removed from any reasonable baseline.</p>

    <p>So, what should you do?</p>


    <h3>Only two things matter</h3>
    <p>Asymptotic time complexity and constant factors.</p>
    <p>Asymptotic complexity answers the question how your algorithm scales if you add more data. If 10 elements take 100 steps to execute, how many steps do 20 elements need? 200? 10000?</p>
    <p>Get a feel for it. Rewrite suboptimal procedures. Most of the time the issues are obvious and just mean replacing linear searches with hash maps.</p>
    <p>What happens when you don't understand time complexity? I actually found the following in our code base:</p>
    <CodeBlock>
        <CodeLine code="public getElement(element)" />
        <CodeLine code="{'{'}" />
        <CodeIndent>
            <CodeLine code="const map = new Map(searchSpace);" />
            <CodeLine code="return map.get(element);" />
        </CodeIndent>
        <CodeLine code="{'}'}" />
    </CodeBlock>

    <p>Most people, even seniors, would say that constant factors don't matter. Let's do a bit of naive math. A simple add operation takes around one CPU cycle to complete but only if everything is already in a register. RAM access costs 200 cycles - it slows down the operation by a factor of 200. How much worse is <CodeInline code="O(n * log(n))" /> compared to just <CodeInline code="O(n)" />? You might say there's no limit but you computer's address space is 64 bits... actually, it's 48 bits, the rest is reserved. The lower 3 bits also don't count because a byte is the smallest addressible element. That's a slow down of 45 at worst.</p>
    <p>Your CPU includes a lot of engineering to hide memory access, even in your "everything is a pointer to a random place in memory because everything is garbage collected" app. But to say it doesn't matter is wrong. Even in JavaScript I noticed a 2x speedup of a hot loop just because I managed to remove an allocation. And if that's not good enough for you, think about starting N + 1 database queries instead of pulling everything in one batch. It's the same problem as above, the question just changed from "does the data live in my CPU?" to "does the data live in my system?".</p>

    <h3>Provide options</h3>

    <p>If your language does not provide a way to avoid heap allocations, provide methods to split up the work. Most languages do not allocate primitives on the heap.</p>
    <CodeBlock>
        <CodeLine code="function transformPoint(p: Point): Point;" />
        <CodeLine code="// These are probably used internally for transformPoint" />
        <CodeLine code="// and are completely safe to be public. No need to hide them." />
        <CodeLine code="function transformX(p: Point): number;" />
        <CodeLine code="function transformY(p: Point): number;" />
    </CodeBlock>

    <p>Maybe your code must be highly dynamic, like in the following case: a brush that draws on a canvas. There many different blending algorithms and the user can select a new one at any time. You can still provide a batch API.</p>
    <CodeBlock>
        <CodeLine code="class BasicBrush : Brush" />
        <CodeLine code="{'{'}" />
        <CodeIndent>
            <CodeLine code="// Inlining will not help if it's called dynamically through an interface" />
            <CodeLine code="// but it will help the blendLine method below." />
            <CodeLine code="[MethodImpl(MethodImplOptions.AggressiveInlining)]" />
            <CodeLine code="public Pixel blend(canvasColor: Pixel, strength: float)" />
            <CodeLine code="{'{'}" />
            <CodeIndent>
                <CodeLine code="// ..." />
            </CodeIndent>
            <CodeLine code="{'}'}" />
            <CodeLine code="public Pixel blendLine(target: Span<Pixel>, strength: float)" />
            <CodeLine code="{'{'}" />
            <CodeIndent>
                <CodeLine code="for (var i = 0; i < target.length; i++)" />
                <CodeLine code="{'{'}" />
                <CodeIndent>
                    <CodeLine code="target[i] = this.blend(target[i], strength);" />
                </CodeIndent>
                <CodeLine code="{'}'}" />
            </CodeIndent>
            <CodeLine code="{'}'}" />
        </CodeIndent>
        <CodeLine code="{'}'}" />
    </CodeBlock>

    <p>Abstract. You do not have to use the default array class just because you need an array. If you provide something that looks like an array, people will use it like an array. What you do inside there is up to you. From a few <CodeInline code="findElement" /> utility functions that are backed by hash maps, AoS to SoA transformations, to Morton curves... you can get away with a lot of things as long as you don't scare your consumers.</p>
</Blog>