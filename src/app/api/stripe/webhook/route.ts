import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Webhook signature verification failed: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const customerId = session.customer as string;
                const planFirestoreId = session.metadata?.planId;

                if (userId) {
                    // Retrieve the subscription details if it's a subscription
                    let subscriptionStatus = 'active';
                    let currentPeriodEnd: string | null = new Date().toISOString();
                    let planId = '';

                    if (session.mode === 'subscription' && session.subscription) {
                        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
                        subscriptionStatus = subscription.status;
                        currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
                        planId = subscription.items.data[0].price.id;
                    } else if (session.mode === 'payment') {
                        // Lifetime payment
                        subscriptionStatus = 'active'; // Or specific status for lifetime

                        try {
                            const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                                expand: ['line_items']
                            });
                            const priceId = expandedSession.line_items?.data[0]?.price?.id;
                            planId = priceId || 'lifetime';
                        } catch (e) {
                            console.error('Error fetching line items for payment session:', e);
                            planId = 'lifetime';
                        }

                        currentPeriodEnd = null; // Permanent access

                        // Increment soldCount for lifetime plan
                        if (planFirestoreId) {
                            try {
                                await adminDb.collection('plans').doc(planFirestoreId).update({
                                    soldCount: FieldValue.increment(1)
                                });
                            } catch (error) {
                                console.error('Error incrementing plan soldCount:', error);
                            }
                        }
                    }

                    await adminDb.collection('users').doc(userId).set({
                        stripeCustomerId: customerId,
                        role: session.mode === 'payment' ? 'lifetime' : 'paid',
                        subscriptionStatus: subscriptionStatus,
                        currentPeriodEnd: currentPeriodEnd,
                        planId: planId,
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                }
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                // Find user by stripeCustomerId
                const usersSnapshot = await adminDb.collection('users').where('stripeCustomerId', '==', subscription.customer).get();

                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0];
                    await userDoc.ref.update({
                        subscriptionStatus: subscription.status,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                        planId: subscription.items.data[0].price.id,
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const usersSnapshot = await adminDb.collection('users').where('stripeCustomerId', '==', subscription.customer).get();

                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0];
                    await userDoc.ref.update({
                        role: 'free',
                        subscriptionStatus: 'canceled',
                        currentPeriodEnd: new Date().toISOString(),
                        planId: null,
                    });
                }
                break;
            }
        }
    } catch (error: unknown) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
