
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia',
});

export async function GET(req: Request) {
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
            return NextResponse.json({ invoices: [] });
        }

        // Fetch both invoices (for subscriptions) and payment intents (for one-time payments)
        const [invoices, paymentIntents] = await Promise.all([
            stripe.invoices.list({
                customer: stripeCustomerId,
                limit: 20,
            }),
            stripe.paymentIntents.list({
                customer: stripeCustomerId,
                limit: 20,
            })
        ]);

        // Format invoices (subscription payments)
        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            amount: invoice.total,
            currency: invoice.currency,
            status: invoice.status,
            date: new Date(invoice.created * 1000).toISOString(),
            pdf_url: invoice.invoice_pdf,
            type: 'invoice' as const,
        }));

        // Format payment intents (one-time payments like lifetime)
        const formattedPaymentIntents = paymentIntents.data
            .filter(pi => pi.status === 'succeeded') // Only show successful payments
            .map(pi => ({
                id: pi.id,
                number: null,
                amount: pi.amount,
                currency: pi.currency,
                status: 'paid', // Map 'succeeded' to 'paid' for consistency
                date: new Date(pi.created * 1000).toISOString(),
                pdf_url: null,
                type: 'payment' as const,
            }));

        // Merge and sort by date (newest first)
        const allTransactions = [...formattedInvoices, ...formattedPaymentIntents]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ invoices: allTransactions });

    } catch (error: any) {
        console.error('Invoice Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
