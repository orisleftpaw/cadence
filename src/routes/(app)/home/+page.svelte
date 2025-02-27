<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="container mx-auto py-4">
	<h1 class="text-xl font-bold">Hello, {page.data.user.id}!</h1>
</div>
