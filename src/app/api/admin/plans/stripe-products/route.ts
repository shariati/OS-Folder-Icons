
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb as db } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia',
});

export async function GET() {
    try {
        // 1. Fetch all active prices from Stripe with product expansion
        const prices = await stripe.prices.list({
            active: true,
            limit: 100,
            expand: ['data.product'],
        });

        // 2. Fetch existing plans from Firestore to check for duplicates
        const snapshot = await db.collection('plans').get();
        const existingStripePriceIds = new Set<string>();
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.stripePriceId) {
                existingStripePriceIds.add(data.stripePriceId);
            }
        });

        // 3. Filter out prices that are already in Firestore
        const availablePrices = prices.data.filter(price => !existingStripePriceIds.has(price.id));

        // 4. Map to a cleaner format for frontend
        const mappedPrices = availablePrices.map(price => {
            const product = price.product as Stripe.Product;
            return {
                id: price.id,
                amount: price.unit_amount ? price.unit_amount / 100 : 0,
                currency: price.currency,
                interval: price.recurring?.interval || 'one-time',
                type: price.type === 'recurring' ? 'subscription' : 'payment',
                productName: product.name,
                productDescription: product.description,
                marketingFeatures: product.marketing_features?.map(f => f.name) || [],
            };
        });

        return NextResponse.json(mappedPrices);
    } catch (error: any) {
        console.error('Error fetching Stripe products:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
