import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { adminAuth as auth, adminDb as db } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  try {
    const { returnUrl } = await req.json();
    const authorization = (await headers()).get('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Fetch user profile to get stripeCustomerId
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || process.env.NEXT_PUBLIC_BASE_URL,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
