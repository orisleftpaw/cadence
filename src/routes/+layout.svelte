<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>cadence</title>
</svelte:head>

{@render children()}
