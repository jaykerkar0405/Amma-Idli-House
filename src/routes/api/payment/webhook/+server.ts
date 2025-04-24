import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Define your connected account IDs - replace with your actual account IDs
const CATEGORY_ACCOUNTS = {
	food: 'acct_food123',
	beverage: 'acct_beverage456',
	default: 'acct_default789'
};

export async function POST({ request }) {
	const signature = request.headers.get('stripe-signature');
	const body = await request.text();

	if (!signature) {
		return json({ error: 'Missing stripe-signature header' }, { status: 400 });
	}

	try {
		const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

		// Handle successful payments
		if (event.type === 'payment_intent.succeeded') {
			const paymentIntent = event.data.object;
			const transferGroup = paymentIntent.transfer_group;
			const metadata = paymentIntent.metadata;
			const categoryTotals = JSON.parse(metadata.category_totals || '{}');

			// Process transfers to each category account
			for (const [category, amount] of Object.entries(categoryTotals)) {
				const accountId = CATEGORY_ACCOUNTS[category] || CATEGORY_ACCOUNTS.default;

				if (accountId) {
					await stripe.transfers.create({
						amount: Math.round(Number(amount) * 100), // Convert to cents
						currency: 'inr',
						destination: accountId,
						transfer_group: transferGroup,
						metadata: {
							category,
							order_id: metadata.order_id
						}
					});
				}
			}
		}

		return json({ received: true });
	} catch (error) {
		console.error('Webhook error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 400 }
		);
	}
}
