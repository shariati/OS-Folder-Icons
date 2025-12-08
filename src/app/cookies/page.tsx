'use client';

import { useState, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { Check, X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

const COOKIE_PREFERENCES_KEY = 'hdpick_cookie_preferences';

const defaultPreferences: CookiePreferences = {
  essential: true, // Always required
  analytics: true,
  advertising: true,
};

export default function CookiesPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot disable essential cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setSaved(true);

    // Apply preferences (in a real implementation, this would communicate with analytics/ad scripts)
    if (!preferences.analytics) {
      // Disable analytics tracking
      window.localStorage.setItem('ga_disabled', 'true');
      window.localStorage.setItem('clarity_disabled', 'true');
    } else {
      window.localStorage.removeItem('ga_disabled');
      window.localStorage.removeItem('clarity_disabled');
    }

    if (!preferences.advertising) {
      // Disable personalized advertising
      window.localStorage.setItem('adsense_personalization_disabled', 'true');
    } else {
      window.localStorage.removeItem('adsense_personalization_disabled');
    }

    // Show confirmation
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allEnabled: CookiePreferences = {
      essential: true,
      analytics: true,
      advertising: true,
    };
    setPreferences(allEnabled);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allEnabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      advertising: false,
    };
    setPreferences(onlyEssential);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(onlyEssential));
    localStorage.setItem('ga_disabled', 'true');
    localStorage.setItem('clarity_disabled', 'true');
    localStorage.setItem('adsense_personalization_disabled', 'true');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NeumorphBox className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Manage Cookie Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              We use cookies to enhance your experience on HD Pick. You can customize your preferences below.
            </p>

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
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences[category.key]
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[category.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
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
                  <strong>How long do cookies last?</strong> Session cookies are deleted when you close
                  your browser. Persistent cookies remain on your device for a set period or until you
                  delete them.
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
      </div>
      <Footer />
    </div>
  );
}
