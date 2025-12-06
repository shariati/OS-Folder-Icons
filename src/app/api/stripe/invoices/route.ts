
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, db } from '@/lib/firebase/admin';
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

        // Fetch invoices
        const invoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit: 20,
        });

        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            amount: invoice.total,
            currency: invoice.currency,
            status: invoice.status,
            date: new Date(invoice.created * 1000).toISOString(),
            pdf_url: invoice.invoice_pdf,
        }));

        return NextResponse.json({ invoices: formattedInvoices });

    } catch (error: any) {
        console.error('Invoice Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
