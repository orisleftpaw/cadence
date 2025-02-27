<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/Input.svelte';

	let { form } = $props();
	let state = $state('login');

	function registerHandler({ cancel, formData }: { cancel: Function; formData: FormData }) {
		if (formData.get('cpassword') !== formData.get('password')) {
			form = { error: 'Passwords do not match.' };
			return cancel();
		}

		formData.delete('cpassword');
	}

	function toggleForm() {
		form = null;
		state = state === 'login' ? 'register' : 'login';
	}
</script>

<div class="container mx-auto py-4">
	<div class="mb-4">
		<h1 class="text-xl font-bold text-white">cadence proof-of-concept</h1>
	</div>

	{#snippet error(msg: string)}
		<div class="rounded-md bg-red-600 px-1 py-1 text-xs text-white">
			<p>{msg}</p>
		</div>
	{/snippet}

	{#if form?.fieldErrors || form?.error}
		<div class="mb-2 flex w-64 flex-col gap-1">
			{#if form?.error}
				{@render error(form.error)}
			{/if}
			{#each form?.fieldErrors?.username || [] as msg}
				{@render error(msg)}
			{/each}
			{#each form?.fieldErrors?.password || [] as msg}
				{@render error(msg)}
			{/each}
		</div>
	{/if}

	{#if state === 'login'}
		<form class="flex w-64 flex-col gap-2" method="POST" action="?/login" use:enhance>
			<Input type="username" id="username" placeholder="Username"></Input>
			<Input type="password" id="password" placeholder="Password"></Input>
			<button class="w-full rounded-md bg-blue-500 py-2 leading-4 text-white">Login</button>
		</form>
		<button class="mt-2 text-sm text-zinc-400" onclick={toggleForm}>need an account?</button>
	{:else}
		<form
			class="flex w-64 flex-col gap-2"
			method="POST"
			action="?/register"
			use:enhance={registerHandler}
		>
			<Input type="username" id="username" placeholder="Username"></Input>
			<Input type="password" id="password" placeholder="Password"></Input>
			<Input type="password" id="cpassword" placeholder="Confirm Password"></Input>
			<button class="w-full rounded-md bg-blue-500 py-2 leading-4 text-white">Register</button>
		</form>
		<button class="mt-2 text-sm" onclick={toggleForm}>have an account?</button>
	{/if}
</div>
