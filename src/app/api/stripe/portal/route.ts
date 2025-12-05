import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

});

export async function POST(req: Request) {
    try {
        const { customerId, returnUrl } = await req.json();

        if (!customerId) {
            return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
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
