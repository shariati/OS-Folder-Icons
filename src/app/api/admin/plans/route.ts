import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { Plan } from '@/types/plan';

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
        const docRef = await db.collection('plans').add(plan);
        return NextResponse.json({ id: docRef.id, ...plan });
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, ...data } = await req.json();
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
        await db.collection('plans').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
