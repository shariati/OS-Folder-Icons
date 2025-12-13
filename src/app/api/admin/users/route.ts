import { NextResponse } from 'next/server';

import { unauthorizedResponse, verifyAdmin } from '@/lib/admin-auth';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types/user';

export async function GET(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        details:
          'Admin verification failed. Check server logs for exact reason (Header missing or Role mismatch).',
      },
      { status: 401 }
    );
  }

  try {
    const listUsersResult = await adminAuth.listUsers(1000);
    const users: UserProfile[] = [];

    for (const userRecord of listUsersResult.users) {
      // Fetch additional data from Firestore if needed
      const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
      const userData = (userDoc.data() as Partial<UserProfile>) || {};

      users.push({
        uid: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || '',
        role: userData.role || 'free',
        subscriptionStatus: userData.subscriptionStatus || null,
        createdAt: userRecord.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: userRecord.metadata.lastSignInTime || undefined,
        planId: userData.planId,
        currentPeriodEnd: userData.currentPeriodEnd,
        stripeCustomerId: userData.stripeCustomerId,
        emailVerified:
          userData.emailVerified !== undefined ? userData.emailVerified : userRecord.emailVerified,
        activatedAt: userData.activatedAt,
        activationEmailSentAt: userData.activationEmailSentAt,
        providers: userRecord.providerData.map((p: any) => ({
          providerId: p.providerId,
          uid: p.uid,
          displayName: p.displayName || null,
          email: p.email || null,
          photoURL: p.photoURL || null,
        })),
        cancellationReason: userData.cancellationReason,
        cancellationFeedback: userData.cancellationFeedback,
        cancellationFeedbackHistory: userData.cancellationFeedbackHistory || [],
        generatedFoldersCount: userData.generatedFoldersCount || 0,
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    await adminAuth.deleteUser(uid);
    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { uid, role, disabled, emailVerified, activatedAt } = body;

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (role) {
      updates.role = role;
      // Also update custom claims if necessary
      const claims: any = { role };
      if (role === 'admin') {
        claims.admin = true;
      } else {
        claims.admin = null; // Unset if demoting
      }
      await adminAuth.setCustomUserClaims(uid, claims);
      // Force refresh on next login/token fetch
      await adminAuth.revokeRefreshTokens(uid);

      await adminDb.collection('users').doc(uid).set({ role }, { merge: true });
    }

    if (disabled !== undefined) {
      await adminAuth.updateUser(uid, { disabled });
    }

    // Handle manual email verification
    if (emailVerified !== undefined || activatedAt !== undefined) {
      const firestoreUpdates: any = {};
      if (emailVerified !== undefined) firestoreUpdates.emailVerified = emailVerified;
      if (activatedAt) firestoreUpdates.activatedAt = activatedAt;

      await adminDb.collection('users').doc(uid).set(firestoreUpdates, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { action, email } = body;

    if (action === 'reset_password' && email) {
      const link = await adminAuth.generatePasswordResetLink(email);
      // In a real app we might email this. For now we return it or just say success if we want to simulate "sent".
      // But admin might want to copy it.
      return NextResponse.json({ success: true, link });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error performing action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
