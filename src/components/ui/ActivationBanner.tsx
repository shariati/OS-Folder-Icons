'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Mail, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export function ActivationBanner() {
  const { user, userProfile, resendActivationEmail } = useAuth();
  const { showToast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Prevent hydration mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null;

  // Only show banner if user is logged in with email/password and email is not verified
  const shouldShow = user && 
                     userProfile && 
                     !userProfile.emailVerified && 
                     user.providerData.some(p => p.providerId === 'password') &&
                     !isDismissed;

  if (!shouldShow) return null;

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendActivationEmail();
      showToast('Activation email sent! Please check your inbox.', 'success');
    } catch (error: any) {
      console.error('Error resending activation email:', error);
      showToast(error.message || 'Failed to send activation email', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Please activate your account by clicking the activation link sent to your email.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Sending...' : 'Resend Email'}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

