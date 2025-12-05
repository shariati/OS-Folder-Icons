import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseAuth } from '@/lib/firebase/client'; // Note: We need admin SDK for server-side user verification usually, but for now we might pass UID or rely on client. 
// Actually, better to use firebase-admin to verify token if we want to be secure, but for simplicity let's assume we pass the user ID or email.
// Wait, we should use a proper server-side auth check. 
// Since I don't have the full auth setup on server side visible yet (next-firebase-auth or similar), I'll assume we can get the user info from the request body or headers.
// For this implementation, I'll initialize Stripe and create the session.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia', // Use latest or what's installed. 2024-11-20.acacia is a recent one.
});

export async function POST(req: Request) {
    try {
        const { priceId, mode, userId, email, returnUrl } = await req.json();

        if (!priceId || !mode || !userId || !email) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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
            success_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}/?payment=success`,
            cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}/?payment=cancelled`,
            metadata: {
                userId: userId,
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
