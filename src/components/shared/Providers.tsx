'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { CookieConsentProvider } from './CookieConsentProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <AuthProvider>
          <ToastProvider>
              {children}
          </ToastProvider>
      </AuthProvider>
    </CookieConsentProvider>
  );
}
