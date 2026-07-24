<style>
    span {
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        color: var(--inline-code-color);
        background-color: var(--inline-code-bgcolor);
        border-radius: 5px;
        padding: 2px 8px;
        white-space: nowrap;
    }
</style>

<script lang="ts">
    let { code }: { code: string } = $props();
</script>

<span>{code}</span>