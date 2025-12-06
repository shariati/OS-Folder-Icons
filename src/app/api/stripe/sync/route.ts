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
            // Fallback: Search by email
            const email = userData?.email;
            if (email) {
                const customers = await stripe.customers.list({
                    email: email,
                    limit: 1,
                });

                if (customers.data.length > 0) {
                    const foundCustomerId = customers.data[0].id;
                    // Save to user profile for future use, using set { merge: true } to be safe or update
                    await userDocRef.set({ stripeCustomerId: foundCustomerId }, { merge: true });

                    // Use this ID for the rest of the function
                    // We need to re-assign or use a new variable. 
                    // Since stripeCustomerId is const in previous scope (if let), let's just use foundCustomerId logic below.
                    // But to minimize code change, let's just proceed with foundCustomerId as the customer ID to use.

                    // Actually, let's refactor slightly to be cleaner.
                    return await checkSubscription(foundCustomerId, userDocRef, userData);
                }
            }

            return NextResponse.json({ message: 'No Stripe customer ID found.' });
        }

        return await checkSubscription(stripeCustomerId, userDocRef, userData);
    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function checkSubscription(stripeCustomerId: string, userDocRef: FirebaseFirestore.DocumentReference, userData: any) {
    // Retrieve customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 5,
    });

    let role = 'free';
    let subscriptionStatus = 'none';
    let currentPeriodEnd: string | null = null;
    let planId = '';

    // Prioritize active or trialing subscriptions
    const activeSubscription = subscriptions.data.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
    );
    const subscription = activeSubscription || subscriptions.data[0];

    if (subscription) {
        subscriptionStatus = subscription.status;

        let targetDate: Date | null = null;

        // Try to get the end date provided by Stripe
        const periodEndTimestamp = (subscription as any).current_period_end || (subscription as any).trial_end;
        if (periodEndTimestamp) {
            targetDate = new Date(periodEndTimestamp * 1000);
        }

        // If date is missing OR it's in the past/now (and sub is active), we calculate next cycle manually
        if (subscription.status === 'active' || subscription.status === 'trialing') {
            const now = new Date();
            // If targetDate is incorrectly "now" or "past" or missing
            if (!targetDate || targetDate <= now) {
                // If we didn't have a date, start from 'now'. If we did, use it as base (to increment from).
                // Actually if it's in the past, sticking to it + interval is safer than 'now + interval' to keep anchor, 
                // but for a fresh "today" issue, 'now' is fine.
                const baseDate = targetDate || now;

                const price = subscription.items.data[0].price;
                const interval = price.recurring?.interval;
                const intervalCount = price.recurring?.interval_count || 1;

                // Create a new date object to modify
                const newDate = new Date(baseDate);

                if (interval === 'month') {
                    newDate.setMonth(newDate.getMonth() + intervalCount);
                } else if (interval === 'year') {
                    newDate.setFullYear(newDate.getFullYear() + intervalCount);
                } else if (interval === 'day') {
                    newDate.setDate(newDate.getDate() + intervalCount);
                } else if (interval === 'week') {
                    newDate.setDate(newDate.getDate() + (intervalCount * 7));
                }

                targetDate = newDate;
            }
        }

        if (targetDate) {
            currentPeriodEnd = targetDate.toISOString();
        }

        if (subscription.items && subscription.items.data.length > 0) {
            planId = subscription.items.data[0].price.id;
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
            role = 'paid';
        }
    } else {
        // Check for lifetime payment intent or similar if applicable
        if (userData?.role === 'lifetime') {
            role = 'lifetime';
            subscriptionStatus = 'active';
            currentPeriodEnd = null; // No next cycle for lifetime
        }
    }

    // Update Firestore
    await userDocRef.update({
        role,
        subscriptionStatus,
        currentPeriodEnd,
        planId,
        lastSyncedAt: new Date().toISOString(),
        stripeCustomerId: stripeCustomerId // Ensure it's saved
    });

    return NextResponse.json({
        success: true,
        role,
        subscriptionStatus
    });
}
