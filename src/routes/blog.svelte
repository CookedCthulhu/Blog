<style>
    div {
        max-width: 1000px;
        margin: 1.0rem 5.0rem 2.0rem calc(50% - 500px);
        border: 1px solid var(--phthalo-green);
        border-radius: 1rem;
        box-shadow: 0 0 5rem black;
        padding: 1rem;
    }
</style>

<script lang="ts">
    import type { Snippet } from "svelte";

    let { children, skipHome }: { children: Snippet, skipHome?: boolean } = $props();
</script>

<div>
    {#if !skipHome}
        <a href="/">{'<'} Home</a>
        <br>
    {/if}
    {@render children()}
</div>