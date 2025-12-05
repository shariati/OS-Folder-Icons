import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, db } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
    try {
        const authorization = (await headers()).get('Authorization');

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // Fetch user profile
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        const userData = userDoc.data();
        const stripeCustomerId = userData?.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json({ message: 'No Stripe customer ID found.' });
        }

        // Retrieve customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'all',
            limit: 1,
        });

        let role = 'free';
        let subscriptionStatus = 'none';
        let currentPeriodEnd = new Date().toISOString();
        let planId = '';

        if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            subscriptionStatus = subscription.status;
            currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();
            planId = subscription.items.data[0].price.id;

            if (subscription.status === 'active' || subscription.status === 'trialing') {
                role = 'paid';
            }
        } else {
            // Check for lifetime payment intent or similar if applicable
            // For now, assuming only subscriptions or manual role check
            // If role was previously lifetime, we might not want to overwrite it unless we verify it's invalid
            if (userData?.role === 'lifetime') {
                role = 'lifetime';
                subscriptionStatus = 'active';
            }
        }

        // Update Firestore
        await userDocRef.update({
            role,
            subscriptionStatus,
            currentPeriodEnd,
            planId,
            lastSyncedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            role,
            subscriptionStatus
        });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
