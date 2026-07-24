<style>
    .main {
        max-width: 1000px;
        margin: 1.0rem 5.0rem 2.0rem max(1rem, calc(50% - 500px));
        border: 1px solid var(--phthalo-green);
        border-radius: 1rem;
        box-shadow: 0 0 5rem black;
        padding: 1.5rem;
        
    }
    .glass {
        backdrop-filter: blur(5px) hue-rotate(20deg) brightness(70%);
        padding: 1.5rem 3rem;
    }
    .glass-edge {
        height: 3px;
        margin-bottom: -1px;
        backdrop-filter: blur(10px) hue-rotate(40deg) brightness(180%);
        background-color: #FFFFFF08;
    }
    .footer {
        position: sticky;
        bottom: 0;
        overflow: hidden;
        height: 4rem;
    }
    .footer>div {
        transform: rotate(1.5deg);
        transform-origin: top left;
    }
</style>

<script lang="ts">
    import type { Snippet } from "svelte";

    let { children, skipHome }: { children: Snippet, skipHome?: boolean } = $props();
</script>

<div class="main">
    {@render children()}
</div>

{#if !skipHome}
    <div class="footer">
        <div>
            <div class="glass-edge"></div>
            
            <div class="glass">
                <a href="/">{'<'} Home</a>
                <br>
            </div>
        </div>
    </div>
{/if}