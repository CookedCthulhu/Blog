<script lang="ts">
	import '../styles/default-reset.css';
	import '../styles/default-variables.css';
	import '../styles/default-main.css';
	let { children } = $props();
</script>

<svelte:head>
</svelte:head>

{@render children()}
