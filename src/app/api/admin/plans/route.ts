import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase/admin';
import { Plan } from '@/types/plan';
import Stripe from 'stripe';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-11-20.acacia',
});

export async function GET() {
    try {
        const snapshot = await db.collection('plans').get();
        const plans: Plan[] = [];
        snapshot.forEach((doc) => {
            plans.push({ id: doc.id, ...doc.data() } as Plan);
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const admin = await verifyAdmin(req);
    if (!admin) return unauthorizedResponse();

    try {
        const plan = await req.json();

        // If stripePriceId is missing, create it in Stripe
        if (!plan.stripePriceId) {
            console.log('Creating plan in Stripe...');
            // Create Product
            const product = await stripe.products.create({
                name: plan.name,
                description: plan.description || undefined,
            });

            // Create Price
            const priceData: Stripe.PriceCreateParams = {
                product: product.id,
                unit_amount: Math.round(plan.price * 100),
                currency: plan.currency || 'usd',
            };

            if (plan.interval === 'month' || plan.interval === 'year') {
                priceData.recurring = {
                    interval: plan.interval,
                };
            }
            // For one-time, we just don't set recurring.

            const price = await stripe.prices.create(priceData);
            plan.stripePriceId = price.id;
            console.log('Created Stripe Price:', price.id);
        }

        const docRef = await db.collection('plans').add(plan);
        return NextResponse.json({ id: docRef.id, ...plan });
    } catch (error: any) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to create plan' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const admin = await verifyAdmin(req);
    if (!admin) return unauthorizedResponse();

    try {
        const { id, ...data } = await req.json();

        // Optional: meaningful updates to Stripe Product could go here (e.g. name change)
        // But price changes require new Price objects. For now, we only update Firestore.

        await db.collection('plans').doc(id).update(data);
        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const admin = await verifyAdmin(req);
    if (!admin) return unauthorizedResponse();

    try {
        const { id } = await req.json();

        // Only delete from Firestore, do NOT touch Stripe
        await db.collection('plans').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
