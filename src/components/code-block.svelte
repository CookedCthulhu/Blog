<style>
    div {
        margin: 1.0rem 5.0rem 2.0rem 0.5rem;
        border: 1px solid var(--phthalo-green);
        border-radius: 1rem;
        padding: 1rem;
        overflow: auto;
        white-space: nowrap;
    }
</style>

<script lang="ts">
    let { children } = $props();
</script>

<div>
    {@render children()}
</div>