<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	// Mock data for current orders
	const currentOrders = [
		{
			id: 1,
			items: ['Idli (2 pcs)', 'Coffee'],
			total: '₹80',
			status: 'preparing',
			time: '10:30 AM'
		},
		{
			id: 2,
			items: ['Tea', 'Coffee', 'Idli (4 pcs)'],
			total: '₹150',
			status: 'ready',
			time: '10:45 AM'
		}
	];

	// Mock data for past orders
	const pastOrders = [
		{
			id: 101,
			date: '2023-10-15',
			items: ['Idli (2 pcs)', 'Tea'],
			total: '₹70',
			status: 'completed'
		},
		{
			id: 102,
			date: '2023-10-14',
			items: ['Coffee', 'Idli (4 pcs)'],
			total: '₹130',
			status: 'completed'
		},
		{ id: 103, date: '2023-10-12', items: ['Tea', 'Coffee'], total: '₹60', status: 'completed' },
		{ id: 104, date: '2023-10-10', items: ['Idli (6 pcs)'], total: '₹120', status: 'completed' },
		{
			id: 105,
			date: '2023-10-08',
			items: ['Idli (2 pcs)', 'Coffee'],
			total: '₹80',
			status: 'completed'
		}
	];

	// Menu items
	const menuItems = [
		{
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

	function getStatusColor(status: string) {
		switch (status) {
			case 'preparing':
				return 'bg-yellow-500 hover:bg-yellow-600';
			case 'ready':
				return 'bg-green-500 hover:bg-green-600';
			case 'completed':
				return 'bg-blue-500 hover:bg-blue-600';
			default:
				return 'bg-gray-500 hover:bg-gray-600';
		}
	}
</script>

<div class="container mx-auto space-y-6 p-4">
	<h1 class="text-3xl font-bold">Amma Idli House Dashboard</h1>

	<Tabs value="orders" class="w-full">
		<TabsList class="grid w-full max-w-md grid-cols-3">
			<TabsTrigger value="orders">Current Orders</TabsTrigger>
			<TabsTrigger value="history">Order History</TabsTrigger>
			<TabsTrigger value="menu">Menu</TabsTrigger>
		</TabsList>

		<TabsContent value="orders" class="mt-6 space-y-4">
			<div class="text-2xl font-semibold">Current Orders</div>

			{#if currentOrders.length > 0}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each currentOrders as order}
						<Card>
							<CardHeader>
								<CardTitle class="flex justify-between">
									<span>Order #{order.id}</span>
									<Badge class={getStatusColor(order.status)}>{order.status}</Badge>
								</CardTitle>
								<CardDescription>{order.time}</CardDescription>
							</CardHeader>
							<CardContent>
								<ul class="list-disc pl-5">
									{#each order.items as item}
										<li>{item}</li>
									{/each}
								</ul>
							</CardContent>
							<CardFooter class="flex justify-between">
								<span class="font-semibold">Total: {order.total}</span>
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
						{#each pastOrders as order}
							<TableRow>
								<TableCell>#{order.id}</TableCell>
								<TableCell>{order.date}</TableCell>
								<TableCell>{order.items.join(', ')}</TableCell>
								<TableCell>{order.total}</TableCell>
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
						<CardFooter>
							<Button class="w-full">Add to Order</Button>
						</CardFooter>
					</Card>
				{/each}
			</div>
		</TabsContent>
	</Tabs>
</div>
