'use client';

import Script from 'next/script';
import { useCookieConsent } from './CookieConsentProvider';

export default function Clarity({ projectId }: { projectId?: string }) {
  const { preferences, isLoaded } = useCookieConsent();

  // Don't render if:
  // - No project ID provided
  // - Preferences haven't loaded yet
  // - User has opted out of analytics
  if (!projectId || !isLoaded || !preferences.analytics) {
    return null;
  }

  return (
    <Script id="clarity-script" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}
