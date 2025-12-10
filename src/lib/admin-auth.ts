import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { createLogger } from '@/lib/logger';

const logger = createLogger('admin-auth');

export async function verifyAdmin(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Only log in development for debugging
    logger.debug(
      {
        uid: decodedToken.uid,
        hasAdminRole: decodedToken.role === 'admin' || decodedToken.admin === true,
      },
      'Admin auth check'
    );

    if (decodedToken.role !== 'admin' && decodedToken.admin !== true) {
      logger.warn({ uid: decodedToken.uid }, 'Admin verification failed: Missing admin role');
      return null;
    }

    return decodedToken;
  } catch (error) {
    logger.error({ err: error }, 'verifyAdmin error');
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
