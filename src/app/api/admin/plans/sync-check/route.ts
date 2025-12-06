
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb as db } from '@/lib/firebase/admin';
import { Plan } from '@/types/plan';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
    try {
        // 1. Fetch all plans from Firestore that have a Stripe Price ID
        const snapshot = await db.collection('plans').where('stripePriceId', '!=', '').get();
        const localPlans: Plan[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.stripePriceId) {
                localPlans.push({ id: doc.id, ...data } as Plan);
            }
        });

        if (localPlans.length === 0) {
            return NextResponse.json({ missingPlans: [] });
        }

        // 2. Fetch all active prices from Stripe
        let hasMore = true;
        let startingAfter: string | undefined = undefined;
        const activeStripePriceIds = new Set<string>();

        while (hasMore) {
            const prices: Stripe.ApiList<Stripe.Price> = await stripe.prices.list({
                active: true,
                limit: 100,
                starting_after: startingAfter,
            });

            prices.data.forEach(p => activeStripePriceIds.add(p.id));

            if (prices.has_more && prices.data.length > 0) {
                startingAfter = prices.data[prices.data.length - 1].id;
            } else {
                hasMore = false;
            }
        }

        // 3. Find plans that are in Firestore but NOT in the active Stripe list
        const missingPlans = localPlans.filter(plan => !activeStripePriceIds.has(plan.stripePriceId));

        return NextResponse.json({ missingPlans });

    } catch (error: any) {
        console.error('Error checking sync status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
