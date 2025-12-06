import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase/admin';
import { Plan } from '@/types/plan';
import Stripe from 'stripe';

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
    try {
        const { id } = await req.json();

        // 1. Get plan from Firestore to find the Stripe Price ID
        const planDoc = await db.collection('plans').doc(id).get();
        if (!planDoc.exists) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }
        const planData = planDoc.data();
        const stripePriceId = planData?.stripePriceId;

        if (stripePriceId) {
            try {
                // 2. Retrieve Price to get Product ID
                const price = await stripe.prices.retrieve(stripePriceId);
                const productId = typeof price.product === 'string' ? price.product : price.product.id;

                // 3. Archive the Price and Product (Stripe doesn't allow easy deletion if used)
                await stripe.prices.update(stripePriceId, { active: false });
                if (productId) {
                    await stripe.products.update(productId, { active: false });
                }
                console.log(`Archived Stripe Price ${stripePriceId} and Product ${productId}`);
            } catch (stripeError) {
                console.error('Error archiving Stripe resources:', stripeError);
                // Continue to delete from DB even if Stripe fails, but log it.
            }
        }

        // 4. Delete from Firestore
        await db.collection('plans').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
