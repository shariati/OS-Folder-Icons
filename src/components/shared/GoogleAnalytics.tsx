'use client';

import Script from 'next/script';
import config from '@/lib/config';

export default function GoogleAnalytics() {
  if (!config.googleAnalytics.id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${config.googleAnalytics.id}');
        `}
      </Script>
    </>
  );
}
