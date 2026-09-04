<script>
    import Blog from "../../components/blog.svelte";
    import CodeInline from "../../components/code-inline.svelte";

</script>

<Blog>
    <h2>It's 2026. The web still sucks</h2>

    <p>"Because it's old and carries a lot of legacy baggage! The new stuff is great.". Let's talk about the new stuff. The following list is my own experience and not exhaustive.</p>

    <h3>{'<'}dialog{'>'}</h3>

    <p><CodeInline code="z-index" /> has been an issue for a long time. Or rather, different elements from different libraries fighting for z-supremacy has been an issue for a long time. It doesn't help that (as far as I know) a maximum z-value is not defined anywhere. So you can increase it indefinitely, until your client's browser decides you can't.</p>
    <p>Luckily there's now <CodeInline code="<dialog>" /> and <CodeInline code="dialog.showModal()" />, which solve the issue once and forall. How? By putting the element in it's own separated space, which sits on top of all other HTML elements, <CodeInline code="z-index" /> turned off. There are also a few additional features, not relevant here. Before you rejoice, take a step back. Isn't this the same as <CodeInline code="z-index: infinity" />? Yes. The issue isn't resolved, it's just moved somewhere else. You might say "then don't use it". You will. Because the library you installed is using it and your tooltips no longer work with their modals.</p>
    <p>So you render your tooltips into the top-layer, too. And your busy box.</p>

    <p>But what if your project isn't ass? What if you had a working solution (like pre-defined containers with pre-defined ordering), and used that for your tooltips, loading spinners, modals and toasts? And your job mostly consist of disabling unreasonable z indices? Then <CodeInline code="showModal()" /> will ruin your day. Because it's as JS function you can't disable it via CSS. You have to crawl through the DOM tree, close the offender and then re-open it via <CodeInline code="show()" />. Maybe you're lucky and your UI library was abandoned, which saves you from end-to-end testing the glue code on every <CodeInline code="npm install" />.</p>


    <h3>ResizeObserver</h3>

    <p>Don't use <CodeInline code="getBoundingClientRect()" />. Use <CodeInline code="ResizeObserver" /> instead. The former causes a rerender, the latter doesn't, is much more efficient and also reports an element's dimensions. Except it doesn't. Not in every case. An observer which doesn't always observe is... useless.</p>


    <h3>The beginner experience</h3>

    <p>Imagine you're a beginner and want to learn a bit of JS. Maybe the new WebGPU? Games are cool. So you install TypeScript because types are great. React, Vue, Angular? Never heard of that. Not interested.</p>
    <p>The experience is great but your <CodeInline code=".ts" /> file could be smaller. So you decide to split it. Luckily there's <CodeInline code="import" /> and <CodeInline code="export" />. Your code stops working. CORS. Have fun spending an evening figuring out what that even means. Or switch to any other programming language and avoid the issue.</p>


    <h3>ES modules are poor at best</h3>

    <p>Apart from the beginner experience mentioned above, modules come with many other issues. Namespaces don't exist, everything is exported globally. Sure, you can group them in an <CodeInline code="index.ts" /> file and import everything from there via <CodeInline code="import * as Foo from '...';" />. Have you actually tried enforcing that in a large project? Retroctively?</p>
    <p>Maybe your code base is clean and your <CodeInline code="index" /> files up to date. Every folder has one, up to root. So now you can call <CodeInline code="Root.Nested.Foo.bar()" /> in <CodeInline code="Root.Nested.Baz" />. Except you can't because that will give you the same error message as a circular import: <CodeInline code="undefined is not a function" />. Yes, circular imports with terrible error messages are a thing, too.</p>
    
    <p>Alternatives: pretend it's 1980 and prefix everything with your "namespace". Make a class with only static methods (doesn't work for types, no nesting). Pack everything in an object and export only that (similar issues).</p>
    <p>There is one TypeScript-exclusive feature which is a lot less painful to use: <CodeInline code="namespace" />. Also has issues. Maybe it wouldn't if its development hadn't stopped in 2014.</p>

</Blog>