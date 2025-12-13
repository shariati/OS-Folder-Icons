'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  isLoaded: boolean;
  updatePreferences: (prefs: CookiePreferences) => void;
}

const COOKIE_PREFERENCES_KEY = 'hdpick_cookie_preferences';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: true,
  advertising: true,
};

/**
 * Get default cookie preferences based on user subscription status.
 * - Free/Guest users: All cookies enabled (ads required for free downloads)
 * - Paid/Lifetime users: Ads disabled by default (they can download without ads)
 */
export function getDefaultPreferences(isPaidUser: boolean): CookiePreferences {
  if (isPaidUser) {
    return {
      essential: true,
      analytics: true,
      advertising: false, // Paid users don't need ad tracking
    };
  }
  return { ...defaultPreferences };
}

const CookieConsentContext = createContext<CookieConsentContextType>({
  preferences: defaultPreferences,
  isLoaded: false,
  updatePreferences: () => {},
});

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  const { userProfile, loading } = useAuth();
  const { showToast } = useToast();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({
          essential: true, // Always true
          analytics: parsed.analytics ?? true,
          advertising: parsed.advertising ?? true,
        });
      } catch {
        // Use defaults if parsing fails
      }
    }
    setIsLoaded(true);
  }, []);

  // Enforce ads for free users whenever their profile loads or preferences change
  useEffect(() => {
    if (loading || !isLoaded) return;

    const isFreeUser = !userProfile || userProfile.role === 'free';

    // If user is free but advertising is disabled
    if (isFreeUser && !preferences.advertising) {
      // Force enable
      updatePreferences({ ...preferences, advertising: true }, true);
    }
  }, [userProfile, loading, isLoaded, preferences.advertising]);

  const updatePreferences = (newPrefs: CookiePreferences, force: boolean = false) => {
    const isFreeUser = !userProfile || userProfile.role === 'free';

    // If user is free and trying to disable ads (and it's not a forced update)
    if (isFreeUser && !newPrefs.advertising && !force) {
      showToast('Free users cannot disable advertising cookies. Please upgrade to Pro.', 'error');
      // Keep advertising true
      newPrefs.advertising = true;
    }

    const updatedPrefs = { ...newPrefs, essential: true };
    setPreferences(updatedPrefs);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(updatedPrefs));

    // Also update individual flags for backwards compatibility
    if (!updatedPrefs.analytics) {
      localStorage.setItem('ga_disabled', 'true');
      localStorage.setItem('clarity_disabled', 'true');
    } else {
      localStorage.removeItem('ga_disabled');
      localStorage.removeItem('clarity_disabled');
    }

    if (!updatedPrefs.advertising) {
      localStorage.setItem('adsense_personalization_disabled', 'true');
    } else {
      localStorage.removeItem('adsense_personalization_disabled');
    }
  };

  return (
    <CookieConsentContext.Provider value={{ preferences, isLoaded, updatePreferences }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
