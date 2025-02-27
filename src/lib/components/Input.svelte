<script lang="ts">
	let { type = 'text', id, placeholder } = $props();
</script>

<input
	class="w-full rounded-md bg-zinc-700 px-2 py-1 outline outline-2 outline-zinc-600"
	{type}
	name={id}
	{id}
	{placeholder}
/>
