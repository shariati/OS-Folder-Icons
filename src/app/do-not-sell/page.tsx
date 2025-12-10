'use client';

import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { MainSiteWrapper } from '@/components/layout/MainSiteWrapper';
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
    <div className="flex min-h-screen flex-col bg-[#e0e5ec] dark:bg-gray-900">
      <MainSiteWrapper>
        <div className="mx-auto max-w-4xl">
          <NeumorphBox className="rounded-3xl bg-white p-8 shadow-xl md:p-12 dark:bg-gray-800">
            {/* ... content ... */}
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Do Not Sell My Personal Information
              </h1>
            </div>

            <div className="space-y-6 leading-relaxed text-gray-700 dark:text-gray-300">
              <p>
                Under the California Consumer Privacy Act (CCPA), California residents have the
                right to opt out of the "sale" of their personal information. While HD Pick does not
                directly sell your data to third parties, certain third-party services we use (such
                as advertising partners) may collect information that could be considered a "sale"
                under CCPA definitions.
              </p>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Your Rights Under CCPA
                </h2>
                <ul className="list-disc space-y-2 pl-6">
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
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  What Data May Be Shared
                </h2>
                <p className="mb-4">
                  When you visit HD Pick, the following information may be shared with our
                  advertising partners:
                </p>
                <ul className="list-disc space-y-2 pl-6">
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
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Opt-Out of Data Sharing
                </h2>
                <p className="mb-6">
                  By clicking the button below, you will opt out of personalized advertising and
                  data sharing with third-party advertisers. You will still see ads, but they will
                  not be personalized based on your browsing behavior.
                </p>

                {submitted ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Check className="h-6 w-6" />
                    <span className="font-medium">
                      Your opt-out request has been processed. You have been opted out of
                      personalized advertising.
                    </span>
                  </div>
                ) : (
                  <>
                    {!isPaidUser && (
                      <div className="mb-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                        <p className="mb-1 font-bold">Feature Restricted</p>
                        <p>
                          Opting out of data sharing is available for Pro and Lifetime members. Free
                          accounts support our platform through personalized advertising.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleOptOut}
                      disabled={!isPaidUser}
                      className={`rounded-xl px-8 py-4 text-lg font-medium transition-all ${
                        isPaidUser
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg'
                          : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700'
                      }`}
                    >
                      Opt Out of Data Sharing
                    </button>
                  </>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Other Ways to Opt Out
                </h2>
                <ul className="list-disc space-y-2 pl-6">
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
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
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
      </MainSiteWrapper>
      <Footer />
    </div>
  );
}
