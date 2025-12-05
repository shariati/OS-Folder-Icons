import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { AdConfig } from '@/lib/types';

export async function GET() {
    try {
        const db = await getDB();
        const adConfig = db.settings.adConfig || {
            enabled: false,
            provider: 'google-adsense',
            adsterra: { script: '' },
            googleAdsense: { client: '', slot: '' },
            propellerads: { zoneId: '', script: '' },
        };
        return NextResponse.json(adConfig);
    } catch (error) {
        console.error('Error fetching ad settings:', error);
        return NextResponse.json({ error: 'Failed to fetch ad settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const db = await getDB();

        // Validate body (basic validation)
        if (!body.provider) {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        db.settings.adConfig = {
            ...db.settings.adConfig,
            ...body,
        };

        await saveDB(db);
        return NextResponse.json(db.settings.adConfig);
    } catch (error) {
        console.error('Error saving ad settings:', error);
        return NextResponse.json({ error: 'Failed to save ad settings' }, { status: 500 });
    }
}
