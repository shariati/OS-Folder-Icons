'use client';

import Script from 'next/script';
import { useCookieConsent } from './CookieConsentProvider';

export default function GoogleAnalytics({ id }: { id?: string }) {
  const { preferences, isLoaded } = useCookieConsent();

  // Don't render if:
  // - No ID provided
  // - Preferences haven't loaded yet (avoid flash of tracking)
  // - User has opted out of analytics
  if (!id || !isLoaded || !preferences.analytics) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            'anonymize_ip': true
          });
        `}
      </Script>
    </>
  );
}
