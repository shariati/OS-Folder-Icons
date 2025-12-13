import { NextRequest, NextResponse } from 'next/server';

import { unauthorizedResponse, verifyAdmin } from '@/lib/admin-auth';
import { getSettings, saveSettings } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const updates = await req.json();

    // Get current settings and merge with updates
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...updates };

    await saveSettings(newSettings);

    return NextResponse.json(newSettings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
