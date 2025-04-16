<script lang="ts">
	import { goto, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { cartStore } from '$lib/stores/cart.svelte';
	import type { Prisma } from '@prisma/client';
	import { Plus, ShoppingCart } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	// Extract methods from cart store
	const { addToCart, getCartItemsCount } = cartStore;

	// Check if URL has a tab parameter
	let activeTab = $state($page.url.searchParams.get('tab') || 'orders');
	let userOrders = $state<Prisma.OrderGetPayload<{ include: { products: true } }>[]>([]);
	let isLoading = $state(false);

	// Update URL when tab changes
	function handleTabChange(tab: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('tab', tab);
		pushState(url.toString(), {});
		activeTab = tab;

		// If switching to orders tab, fetch orders
		if (tab === 'orders' || tab === 'history') {
			fetchUserOrders();
		}
	}

	// Fetch user orders from API
	async function fetchUserOrders() {
		if (!$page.data.user) return;

		isLoading = true;
		try {
			const response = await fetch(`/api/orders/user?userId=${$page.data.user.id}`);
			const data = await response.json();

			if (data.success) {
				userOrders = data.orders;
			} else {
				toast.error('Failed to load orders');
			}
		} catch (error) {
			console.error('Error fetching orders:', error);
			toast.error('Failed to load orders');
		} finally {
			isLoading = false;
		}
	}

	// Load orders on page load
	onMount(() => {
		if (activeTab === 'orders' || activeTab === 'history') {
			fetchUserOrders();
		}
	});

	// Menu items
	const menuItems = [
		{
			id: 'idli',
			name: 'Idli',
			description: 'Soft steamed rice cakes',
			variants: [
				{ size: '2 pcs', price: '₹40' },
				{ size: '4 pcs', price: '₹70' },
				{ size: '6 pcs', price: '₹100' }
			],
			image: 'https://placehold.co/300x200?text=Idli'
		},
		{
			id: 'coffee',
			name: 'Coffee',
			description: 'South Indian filter coffee',
			variants: [
				{ size: 'Small', price: '₹20' },
				{ size: 'Regular', price: '₹30' },
				{ size: 'Large', price: '₹40' }
			],
			image: 'https://placehold.co/300x200?text=Coffee'
		},
		{
			id: 'tea',
			name: 'Tea',
			description: 'Classic Indian masala chai',
			variants: [
				{ size: 'Small', price: '₹15' },
				{ size: 'Regular', price: '₹25' },
				{ size: 'Large', price: '₹35' }
			],
			image: 'https://placehold.co/300x200?text=Tea'
		}
	];

	// Selected variant for each menu item
	const selectedVariants = $state<Record<string, string>>({});

	function getStatusColor(status: string) {
		switch (status) {
			case 'preparing':
			case 'PENDING':
				return 'bg-yellow-500 hover:bg-yellow-600';
			case 'ready':
			case 'COMPLETED':
				return 'bg-green-500 hover:bg-green-600';
			case 'CANCELLED':
				return 'bg-red-500 hover:bg-red-600';
			default:
				return 'bg-gray-500 hover:bg-gray-600';
		}
	}

	function handleAddToCart(item: (typeof menuItems)[0]) {
		const selectedSize = selectedVariants[item.id] || item.variants[0].size;
		const selectedVariant = item.variants.find((v) => v.size === selectedSize);

		if (!selectedVariant) {
			toast.error('Please select a size');
			return;
		}

		addToCart({
			id: item.id,
			name: item.name,
			size: selectedVariant.size,
			price: selectedVariant.price,
			quantity: 1,
			imageUrl: item.image
		});

		toast.success(`Added ${item.name} (${selectedVariant.size}) to cart`);
	}
</script>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Amma Idli House Dashboard</h1>
		<Button variant="outline" class="flex items-center gap-2" onclick={() => goto('/cart')}>
			<ShoppingCart class="h-4 w-4" />
			<span>Cart ({getCartItemsCount()})</span>
		</Button>
	</div>

	<Tabs value={activeTab} onValueChange={handleTabChange} class="w-full">
		<TabsList class="grid w-full max-w-md grid-cols-3">
			<TabsTrigger value="orders">Current Orders</TabsTrigger>
			<TabsTrigger value="history">Order History</TabsTrigger>
			<TabsTrigger value="menu">Menu</TabsTrigger>
		</TabsList>

		<TabsContent value="orders" class="mt-6 space-y-4">
			<div class="text-2xl font-semibold">Current Orders</div>

			{#if isLoading}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center">Loading orders...</p>
					</CardContent>
				</Card>
			{:else if userOrders.filter((order) => order.status === 'PENDING').length > 0}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each userOrders.filter((order) => order.status === 'PENDING') as order}
						<Card>
							<CardHeader>
								<CardTitle class="flex justify-between">
									<span>Order #{order.id.slice(0, 8)}</span>
									<Badge class={getStatusColor(order.status)}>{order.status}</Badge>
								</CardTitle>
								<CardDescription>{new Date(order.createdAt).toLocaleString()}</CardDescription>
							</CardHeader>
							<CardContent>
								<ul class="list-disc pl-5">
									{#each order.products as product}
										<li>{product.name} (₹{product.price})</li>
									{/each}
								</ul>
							</CardContent>
							<CardFooter class="flex justify-between">
								<span class="font-semibold">
									Total: ₹{order.products.reduce((acc: number, curr) => acc + curr.price, 0)}
								</span>
								<Button variant="outline">View Details</Button>
							</CardFooter>
						</Card>
					{/each}
				</div>
			{:else}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center text-muted-foreground">No current orders</p>
					</CardContent>
				</Card>
			{/if}
		</TabsContent>

		<TabsContent value="history" class="mt-6">
			<div class="mb-4 text-2xl font-semibold">Order History</div>

			{#if isLoading}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center">Loading order history...</p>
					</CardContent>
				</Card>
			{:else if userOrders.filter((order) => order.status !== 'PENDING').length > 0}
				<div class="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Items</TableHead>
								<TableHead>Total</TableHead>
								<TableHead>Status</TableHead>
								<TableHead class="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each userOrders.filter((order) => order.status !== 'PENDING') as order}
								<TableRow>
									<TableCell>#{order.id.slice(0, 8)}</TableCell>
									<TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
									<TableCell>
										{order.products.map((p) => p.name).join(', ')}
									</TableCell>
									<TableCell>
										₹{order.products.reduce((acc: number, curr) => acc + curr.price, 0)}
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{order.status}</Badge>
									</TableCell>
									<TableCell class="text-right">
										<Button variant="ghost" size="sm">Reorder</Button>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{:else}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center text-muted-foreground">No order history found</p>
					</CardContent>
				</Card>
			{/if}
		</TabsContent>

		<TabsContent value="menu" class="mt-6">
			<div class="mb-4 text-2xl font-semibold">Menu</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each menuItems as item}
					<Card>
						<img src={item.image} alt={item.name} class="h-48 w-full rounded-t-lg object-cover" />
						<CardHeader>
							<CardTitle>{item.name}</CardTitle>
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each item.variants as variant}
									<div class="flex justify-between">
										<span>{variant.size}</span>
										<span class="font-semibold">{variant.price}</span>
									</div>
									{#if variant !== item.variants[item.variants.length - 1]}
										<Separator />
									{/if}
								{/each}
							</div>
						</CardContent>
						<CardFooter class="flex flex-col gap-2">
							<div class="flex w-full items-center">
								<Select
									type="single"
									value={selectedVariants[item.id] || item.variants[0].size}
									onValueChange={(value) => (selectedVariants[item.id] = value)}
								>
									<SelectTrigger class="w-full">
										{selectedVariants[item.id] || item.variants[0].size}
									</SelectTrigger>
									<SelectContent>
										{#each item.variants as variant}
											<SelectItem value={variant.size}>
												{variant.size} - {variant.price}
											</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
							<Button class="w-full" onclick={() => handleAddToCart(item)}>
								<Plus class="mr-2 h-4 w-4" /> Add to Cart
							</Button>
						</CardFooter>
					</Card>
				{/each}
			</div>
		</TabsContent>
	</Tabs>
</div>
