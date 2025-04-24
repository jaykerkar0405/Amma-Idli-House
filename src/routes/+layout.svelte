<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	const unprotectedRoutes = ['/', '/auth'];

	let { children } = $props();
	let session = authClient.useSession();

	$effect(() => {
		if ($session.isPending || $session.isRefetching) return;
		if (!unprotectedRoutes.includes(page.url.pathname) && !$session.data) {
			toast.error('You need to be logged in to access this page.');
			goto('/auth');
		}
	});
</script>

<Toaster />
{@render children()}
