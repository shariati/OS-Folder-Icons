'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/contexts/AuthContext';

import { CookieConsentProvider } from './CookieConsentProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CookieConsentProvider>{children}</CookieConsentProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
