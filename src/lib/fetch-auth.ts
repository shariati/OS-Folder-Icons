import { createLogger } from '@/lib/logger';

import { getFirebaseAuth } from './firebase/client';

const logger = createLogger('fetch-auth');

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Ensure auth is initialized
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;

  if (!user) {
    logger.debug('No user logged in for authenticated fetch');
  }

  let token = null;
  if (user) {
    try {
      // Force refresh if this is an admin request to ensure we have latest claims
      const forceRefresh = url.includes('/api/admin');
      token = await user.getIdToken(forceRefresh);
    } catch (err) {
      logger.error({ err }, 'Failed to get ID token');
    }
  }

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    logger.debug('Authorization header added for request');
  } else {
    logger.warn({ uid: user?.uid }, 'No token available for user');
  }

  return fetch(url, { ...options, headers });
}
