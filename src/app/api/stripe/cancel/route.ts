import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { adminAuth as auth, adminDb as db } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-11-20.acacia', // Use default version installed
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

    const { feedback, reason } = await req.json();

    // Fetch user profile
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 });
    }

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for trialing
      const trialingSubs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'trialing',
        limit: 1,
      });

      if (trialingSubs.data.length === 0) {
        return NextResponse.json(
          { error: 'No active subscription found to cancel' },
          { status: 400 }
        );
      }
      // Use trialing sub if found
      subscriptions.data.push(trialingSubs.data[0]);
    }

    const subscription = subscriptions.data[0];

    // Cancel at period end
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    const now = new Date().toISOString();

    // Update Firestore with feedback and status
    await userDocRef.update({
      subscriptionStatus: 'active', // effectively still active until end, but we can mark intent
      cancelAtPeriodEnd: true,
      cancellationReason: reason,
      cancellationFeedback: feedback,
      cancelledAt: now,
      lastSyncedAt: now,
      cancellationFeedbackHistory: FieldValue.arrayUnion({
        reason,
        feedback,
        date: now,
      }),
    });

    const validPeriodEnd = (updatedSubscription as any).current_period_end;
    const currentPeriodEndDate = validPeriodEnd
      ? new Date(validPeriodEnd * 1000).toISOString()
      : null;

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period.',
      currentPeriodEnd: currentPeriodEndDate,
    });
  } catch (error: any) {
    console.error('Cancellation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
