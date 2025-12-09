'use client';

import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ShieldCheck, Check } from 'lucide-react';
import { PROJECT_LINKS } from '@/constants/links';
import { useAuth } from '@/contexts/AuthContext';

export default function DoNotSellPage() {
  const [optedOut, setOptedOut] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { userProfile } = useAuth();
  
  const isPaidUser = userProfile?.role === 'paid' || userProfile?.role === 'lifetime';

  const handleOptOut = () => {
    // Store opt-out preference
    localStorage.setItem('ccpa_do_not_sell', 'true');
    localStorage.setItem('adsense_personalization_disabled', 'true');
    setOptedOut(true);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NeumorphBox className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Do Not Sell My Personal Information
              </h1>
            </div>

            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Under the California Consumer Privacy Act (CCPA), California residents have the right
                to opt out of the "sale" of their personal information. While HD Pick does not
                directly sell your data to third parties, certain third-party services we use (such
                as advertising partners) may collect information that could be considered a "sale"
                under CCPA definitions.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Rights Under CCPA
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Right to Know:</strong> You can request information about what personal
                    data we collect and how it's used.
                  </li>
                  <li>
                    <strong>Right to Delete:</strong> You can request deletion of your personal
                    information (available in your{' '}
                    <a href="/profile" className="text-blue-600 hover:underline">
                      Profile settings
                    </a>
                    ).
                  </li>
                  <li>
                    <strong>Right to Opt-Out:</strong> You can opt out of the sale of your personal
                    information.
                  </li>
                  <li>
                    <strong>Right to Non-Discrimination:</strong> We will not discriminate against
                    you for exercising your privacy rights.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  What Data May Be Shared
                </h2>
                <p className="mb-4">
                  When you visit HD Pick, the following information may be shared with our
                  advertising partners:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Device identifiers</strong> (such as cookies and mobile advertising IDs)
                  </li>
                  <li>
                    <strong>Browsing behavior</strong> on our site
                  </li>
                  <li>
                    <strong>General location</strong> (derived from IP address)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Opt-Out of Data Sharing
                </h2>
                <p className="mb-6">
                  By clicking the button below, you will opt out of personalized advertising and
                  data sharing with third-party advertisers. You will still see ads, but they will
                  not be personalized based on your browsing behavior.
                </p>

                {submitted ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <Check className="h-6 w-6" />
                    <span className="font-medium">
                      Your opt-out request has been processed. You have been opted out of
                      personalized advertising.
                    </span>
                  </div>
                ) : (
                  <>
                    {!isPaidUser && (
                        <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm">
                            <p className="font-bold mb-1">Feature Restricted</p>
                            <p>Opting out of data sharing is available for Pro and Lifetime members. Free accounts support our platform through personalized advertising.</p>
                        </div>
                    )}
                    <button
                        onClick={handleOptOut}
                        disabled={!isPaidUser}
                        className={`px-8 py-4 rounded-xl font-medium text-lg transition-all ${
                            isPaidUser 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:-translate-y-0.5" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Opt Out of Data Sharing
                    </button>
                  </>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Other Ways to Opt Out
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <a href="/cookies" className="text-blue-600 hover:underline">
                      Manage Cookie Preferences
                    </a>{' '}
                    – Control which cookies are used on this site.
                  </li>
                  <li>
                    <strong>Global Privacy Control (GPC):</strong> If your browser supports GPC, we
                    honor this signal as a valid opt-out request.
                  </li>
                  <li>
                    <strong>Google Ads Settings:</strong>{' '}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Manage your Google ad personalization preferences
                    </a>
                    .
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Us
                </h2>
                <p>
                  If you have questions about your privacy rights or wish to make a request, please
                  contact us through our{' '}
                  <a
                    href={PROJECT_LINKS.GITHUB_DISCUSSIONS}
                    className="text-blue-600 hover:underline"
                  >
                    GitHub Discussions
                  </a>
                  .
                </p>
              </section>
            </div>
          </NeumorphBox>
        </div>
      </div>
      <Footer />
    </div>
  );
}
