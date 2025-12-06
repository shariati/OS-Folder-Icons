import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia', // Use default
});

export async function POST(req: Request) {
    try {
        const { priceId, mode, returnUrl } = await req.json();
        const authorization = (await headers()).get('Authorization');

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const email = decodedToken.email;

        if (!priceId || !mode || !email) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Check plan availability
        let planFirestoreId;
        const plansRef = db.collection('plans');
        const querySnapshot = await plansRef.where('stripePriceId', '==', priceId).limit(1).get();

        if (!querySnapshot.empty) {
            const planDoc = querySnapshot.docs[0];
            const planData = planDoc.data();
            planFirestoreId = planDoc.id;

            if (planData.maxQuantity && planData.soldCount >= planData.maxQuantity) {
                return NextResponse.json({ error: 'This plan is sold out.' }, { status: 400 });
            }
        }

        // Optional: Retrieve existing customer by email or metadata to avoid duplicates
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    firebaseUID: userId
                }
            });
            customerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: mode, // 'subscription' or 'payment'
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: returnUrl || process.env.NEXT_PUBLIC_BASE_URL,
            metadata: {
                userId: userId,
                planId: planFirestoreId || '',
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
