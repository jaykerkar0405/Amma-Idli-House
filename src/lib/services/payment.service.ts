import type { CreateOrderInput } from '$lib/stores/cart.svelte';

// Configure these values based on your categories
const CATEGORY_ACCOUNTS = {
	food: 'acct_food123',
	default: 'acct_default789',
	beverage: 'acct_beverage456'
};

// Create a payment intent with Stripe
export async function createPaymentIntent(orderInput: CreateOrderInput, orderId: string) {
	try {
		const response = await fetch('/api/payment/create-intent', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				orderId,
				amount: orderInput.products.reduce((sum, item) => sum + item.price, 0),
				categoryTotals: orderInput.categoryTotals || {}
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to create payment intent');
		}

		return await response.json();
	} catch (error) {
		console.error('Payment intent creation failed:', error);
		throw error;
	}
}
