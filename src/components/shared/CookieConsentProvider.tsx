'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  const updatePreferences = (newPrefs: CookiePreferences) => {
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
