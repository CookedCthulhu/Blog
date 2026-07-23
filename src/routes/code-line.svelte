<style>
    p {
        font-family: 'Courier New', Courier, monospace;
        line-height: 110%;
    }
</style>

<script lang="ts">
    let { code }: { code?: string | undefined } = $props();
</script>

<p>{code}</p>