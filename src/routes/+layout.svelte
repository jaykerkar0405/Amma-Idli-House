<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { useSession } from '$lib/auth-client';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
	const session = useSession();
	let isLoading: boolean = $state(true);
	const unprotectedRoutes = ['/', '/auth'];
	const isAuthenticated = () => !!$session.data?.user?.id;
	console.log('isAuthenticated', isAuthenticated());

	$effect(() => {
		if ($session.isPending || $session.isRefetching) return;
		if ($session.isPending) {
			isLoading = true;
			return;
		}

		isLoading = false;

		const needsAuth = !unprotectedRoutes.includes(page.url.pathname);
		if (!isAuthenticated() && needsAuth) {
			goto('/auth');
		}
	});
</script>

<Toaster />

{#if isLoading}
	<div class="flex h-screen items-center justify-center">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else}
	{@render children()}
{/if}
