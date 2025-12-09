'use client';

import { useState, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { MainSiteWrapper } from '@/components/layout/MainSiteWrapper';
import { Check, RefreshCw } from 'lucide-react';
import { useCookieConsent, CookiePreferences, getDefaultPreferences } from '@/components/shared/CookieConsentProvider';
import { useAuth } from '@/contexts/AuthContext';

export default function CookiesPage() {
  const { preferences: savedPreferences, isLoaded, updatePreferences } = useCookieConsent();
  const { userProfile } = useAuth();
  
  // Check if user has a paid subscription (no ad requirements)
  const isPaidUser = userProfile?.role === 'paid' || userProfile?.role === 'lifetime';
  
  const [preferences, setPreferences] = useState<CookiePreferences>(() => 
    getDefaultPreferences(isPaidUser)
  );
  const [saved, setSaved] = useState(false);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);

  // Sync local state with context when loaded, or use role-based defaults for new users
  useEffect(() => {
    if (isLoaded) {
      // Check if user has any saved preferences
      const hasSavedPrefs = localStorage.getItem('hdpick_cookie_preferences');
      if (hasSavedPrefs) {
        setPreferences(savedPreferences);
      } else {
        // First visit - use role-based defaults
        const defaults = getDefaultPreferences(isPaidUser);
        setPreferences(defaults);
        updatePreferences(defaults);
      }
    }
  }, [isLoaded, savedPreferences, isPaidUser, updatePreferences]);

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot disable essential cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
    setShowReloadPrompt(false);
  };

  const handleSave = () => {
    updatePreferences(preferences);
    setSaved(true);
    setShowReloadPrompt(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allEnabled: CookiePreferences = {
      essential: true,
      analytics: true,
      advertising: true,
    };
    setPreferences(allEnabled);
    updatePreferences(allEnabled);
    setSaved(true);
    setShowReloadPrompt(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      advertising: false,
    };
    setPreferences(onlyEssential);
    updatePreferences(onlyEssential);
    setSaved(true);
    setShowReloadPrompt(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const cookieCategories = [
    {
      key: 'essential' as const,
      name: 'Essential Cookies',
      description:
        'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot disable these cookies.',
      required: true,
    },
    {
      key: 'analytics' as const,
      name: 'Analytics Cookies',
      description:
        'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics and Microsoft Clarity to improve user experience.',
      required: false,
    },
    {
      key: 'advertising' as const,
      name: 'Advertising Cookies',
      description:
        'These cookies are used to deliver personalized advertisements based on your browsing behavior. We use Google AdSense which may track your activity across websites to show relevant ads.',
      required: false,
      // Only show warning for non-paid users
      warning: isPaidUser 
        ? undefined 
        : 'Important: Free accounts require advertising cookies to be enabled. If you disable this, you will not be able to download items until you upgrade to a paid plan.',
      // Show benefit message for paid users
      premiumBenefit: isPaidUser 
        ? 'As a premium subscriber, you can disable advertising tracking without any restrictions. Your downloads are ad-free!' 
        : undefined,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <MainSiteWrapper>
        <div className="max-w-4xl mx-auto">
          <NeumorphBox className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Manage Cookie Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              We use cookies to enhance your experience on HD Pick. You can customize your preferences below.
            </p>

            {/* Reload Prompt */}
            {showReloadPrompt && (
              <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Important:</strong> For your new preferences to take full effect, please reload the page.
                  </p>
                  <button
                    onClick={handleReload}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <RefreshCw size={16} />
                    Reload Now
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Reject Non-Essential
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-6">
              {cookieCategories.map((category) => (
                <div
                  key={category.key}
                  className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                      {category.required && (
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                          (Required)
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => handleToggle(category.key)}
                      disabled={category.required}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        preferences[category.key]
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          preferences[category.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
                  {(category as any).warning && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        ⚠️ {(category as any).warning}
                      </p>
                    </div>
                  )}
                  {(category as any).premiumBenefit && (
                    <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        ✨ {(category as any).premiumBenefit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium"
              >
                Save Preferences
              </button>
              {saved && (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check size={20} />
                  Preferences saved!
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                About Our Cookies
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm">
                <p>
                  <strong>What are cookies?</strong> Cookies are small text files stored on your device
                  when you visit websites. They help websites remember your preferences and improve your
                  experience.
                </p>
                <p>
                  <strong>How do your preferences work?</strong> When you disable analytics or advertising cookies,
                  the corresponding tracking scripts will not be loaded on your next page visit. This gives you
                  real control over your privacy.
                </p>
                <p>
                  <strong>Third-party cookies:</strong> Some cookies are set by third-party services we
                  use, such as Google Analytics, Microsoft Clarity, and Google AdSense. These services
                  have their own privacy policies.
                </p>
                <p>
                  For more information about how we handle your data, please read our{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </NeumorphBox>
        </div>
      </MainSiteWrapper>
      <Footer />
    </div>
  );
}
