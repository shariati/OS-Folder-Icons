import { Footer } from '@/components/layout/Footer';
import { MainSiteWrapper } from '@/components/layout/MainSiteWrapper';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EXTERNAL_LINKS, PROJECT_LINKS } from '@/constants/links';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#e0e5ec] dark:bg-gray-900">
      <MainSiteWrapper>
        <div className="mx-auto max-w-4xl">
          <NeumorphBox className="rounded-3xl bg-white p-8 shadow-xl md:p-12 dark:bg-gray-800">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="mb-8 text-gray-500 dark:text-gray-400">Last Updated: December 8, 2025</p>

            <div className="space-y-8 leading-relaxed text-gray-700 dark:text-gray-300">
              <p>
                <strong>HD Pick</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
                committed to protecting your privacy. This Privacy Policy explains how we collect,
                use, and safeguard your information when you use our website and services.
              </p>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  1. Information We Collect
                </h2>

                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  A. Information You Provide
                </h3>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>
                    <strong>Account Information:</strong> When you register, we collect your name,
                    email address, and profile picture (via Social Login).
                  </li>
                  <li>
                    <strong>User Content:</strong> We store the configurations and preferences for
                    the icons you generate or bundles you save.
                  </li>
                </ul>

                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  B. Information Collected Automatically
                </h3>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Usage Data:</strong> We use tools like <strong>Google Analytics</strong>
                    , <strong>Microsoft Clarity</strong>, and <strong>Vercel Analytics</strong> to
                    collect anonymous data about how you interact with our site (e.g., pages
                    visited, time spent, clicks, heatmaps, and session recordings).
                  </li>
                  <li>
                    <strong>Advertising Data:</strong> We work with third-party ad providers such as{' '}
                    <strong>Google AdSense</strong> which may use cookies and similar technologies
                    to show personalized ads based on your visits to this and other websites.
                  </li>
                  <li>
                    <strong>Device Information:</strong> We may collect information about your
                    browser, device type, and operating system.
                  </li>
                  <li>
                    <strong>Cookies:</strong> We use cookies to maintain your session, store your
                    preferences, and for advertising purposes. You can manage your cookie
                    preferences on our{' '}
                    <a href="/cookies" className="text-blue-600 hover:underline">
                      Cookie Preferences
                    </a>{' '}
                    page.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  2. How We Use Your Information
                </h2>
                <p className="mb-2">We use the collected information to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    Provide and maintain our services, including hosting via <strong>Vercel</strong>{' '}
                    and backend services via <strong>Firebase</strong>.
                  </li>
                  <li>Personalize your experience (e.g., saving your favorite colors).</li>
                  <li>Analyze usage patterns to improve our website and tools.</li>
                  <li>Serve relevant advertisements to support the free version of our tools.</li>
                  <li>Communicate with you about updates or support.</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  3. Third-Party Services
                </h2>
                <p className="mb-2">
                  We share data with trusted third-party service providers to help us operate our
                  business:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Authentication &amp; Backend:</strong> We use <strong>Firebase</strong>{' '}
                    (by Google) for secure authentication and database services.
                  </li>
                  <li>
                    <strong>Hosting:</strong> Our application is hosted on <strong>Vercel</strong>,
                    which may collect anonymous usage statistics.
                  </li>
                  <li>
                    <strong>Analytics:</strong>
                    <ul className="mt-1 list-disc space-y-1 pl-6">
                      <li>
                        <strong>Google Analytics:</strong> To understand user behavior and traffic.
                      </li>
                      <li>
                        <strong>Microsoft Clarity:</strong> We partner with Microsoft Clarity and
                        Microsoft Advertising to capture how you use and interact with our website
                        through behavioral metrics, heatmaps, and session replay to improve and
                        market our products/services. Website usage data is captured using first and
                        third-party cookies and other tracking technologies to determine the
                        popularity of products/services and online activity. Additionally, we use
                        this information for site optimization, fraud/security purposes, and
                        advertising. For more information about how Microsoft collects and uses your
                        data, visit the{' '}
                        <a
                          href={EXTERNAL_LINKS.MICROSOFT_PRIVACY}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Microsoft Privacy Statement
                        </a>
                        . See also{' '}
                        <a
                          href={EXTERNAL_LINKS.CLARITY_DISCLOSURE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Clarity Privacy Disclosure
                        </a>
                        .
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Advertising:</strong> We use <strong>Google AdSense</strong> and other
                    ad partners to display advertisements. These partners may use cookies to serve
                    ads based on your prior visits to our website or other websites.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  4. Photo Frame Privacy &amp; Client-Side Processing
                </h2>
                <p className="mb-4">
                  We prioritize your privacy when using our tools, specifically the{' '}
                  <strong>Photo Frame</strong> feature.
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Client-Side Processing:</strong> All image processing for the Photo
                    Frame feature happens entirely on your device (in your browser).{' '}
                    <strong>We do not upload your photos to any server.</strong>
                  </li>
                  <li>
                    <strong>No Storage:</strong> Since processing is local, we do not store or have
                    access to the photos you use in the Photo Frame tool.
                  </li>
                  <li>
                    <strong>Transparency:</strong> You can verify this by reviewing our source code
                    (see Terms of Service for repository details).
                  </li>
                  <li>
                    <strong>Future Changes:</strong> In the future, if we introduce a feature to
                    save your projects to the cloud, we will update this policy. Any such feature
                    would involve uploading data to secure, encrypted storage, and would only occur
                    with your explicit action and consent. As of now, no such upload occurs.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  5. Data Retention and Deletion
                </h2>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Retention:</strong> We retain your personal information only as long as
                    necessary to provide you with our services and as required by law.
                  </li>
                  <li>
                    <strong>Deletion:</strong> You have the right to request the deletion of your
                    account and all associated personal data. You can do this directly through your
                    &quot;My Profile&quot; page.
                    <br />
                    <strong>Note:</strong> If you have an active paid subscription, you must first
                    cancel your subscription and wait for the current billing period to end before
                    you can permanently delete your account. This ensures you receive the full
                    service you paid for and allows for proper billing settlement.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  6. Your Rights
                </h2>
                <p className="mb-4">
                  Depending on your location, you may have the following rights regarding your
                  personal data:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Right to Access:</strong> You can request a copy of the personal data we
                    hold about you.
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> You can request that we correct
                    inaccurate or incomplete personal data.
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> You can request that we delete your personal
                    data (see Section 5).
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> You can request a copy of your data
                    in a structured, machine-readable format.
                  </li>
                  <li>
                    <strong>Right to Object:</strong> You can object to certain types of processing,
                    such as direct marketing.
                  </li>
                  <li>
                    <strong>Right to Withdraw Consent:</strong> Where processing is based on
                    consent, you can withdraw your consent at any time.
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us through our{' '}
                  <a
                    href={PROJECT_LINKS.GITHUB_DISCUSSIONS}
                    className="text-blue-600 hover:underline"
                  >
                    GitHub Discussions
                  </a>{' '}
                  or use the options available in your account settings.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  7. California Privacy Rights (CCPA)
                </h2>
                <p className="mb-4">
                  If you are a California resident, you have additional rights under the California
                  Consumer Privacy Act (CCPA):
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    <strong>Right to Know:</strong> You can request disclosure of the categories and
                    specific pieces of personal information we have collected.
                  </li>
                  <li>
                    <strong>Right to Delete:</strong> You can request deletion of your personal
                    information.
                  </li>
                  <li>
                    <strong>Right to Opt-Out:</strong> You can opt out of the &quot;sale&quot; of
                    your personal information. Visit our{' '}
                    <a href="/do-not-sell" className="text-blue-600 hover:underline">
                      Do Not Sell My Personal Information
                    </a>{' '}
                    page to exercise this right.
                  </li>
                  <li>
                    <strong>Right to Non-Discrimination:</strong> We will not discriminate against
                    you for exercising your CCPA rights.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  8. Cookie Policy
                </h2>
                <p className="mb-4">
                  We use cookies and similar tracking technologies to improve your experience. Our
                  cookies fall into the following categories:
                </p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the website to function
                    properly (authentication, security, preferences).
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how visitors use our site
                    (Google Analytics, Microsoft Clarity).
                  </li>
                  <li>
                    <strong>Advertising Cookies:</strong> Used to deliver relevant advertisements
                    (Google AdSense).{' '}
                    <em>
                      Note: Paid subscribers (Pro and Lifetime) may disable advertising cookies
                      without affecting their download capabilities.
                    </em>
                  </li>
                </ul>
                <p>
                  You can manage your cookie preferences at any time on our{' '}
                  <a href="/cookies" className="text-blue-600 hover:underline">
                    Manage Cookies
                  </a>{' '}
                  page.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  9. Data Security
                </h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your
                  personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  10. Age Requirement
                </h2>
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    You must be at least 16 years old to use HD Pick.
                  </p>
                </div>
                <ul className="list-disc space-y-2 pl-6">
                  <li>HD Pick is not intended for children under the age of 16.</li>
                  <li>
                    We do not knowingly collect personal information from anyone under 16 years of
                    age.
                  </li>
                  <li>
                    If you are under 16, please do not create an account or provide any personal
                    information.
                  </li>
                  <li>
                    If we become aware that we have collected personal data from a child under 16,
                    we will take steps to delete that information promptly.
                  </li>
                  <li>
                    If you believe a child under 16 has provided us with personal information,
                    please contact us immediately.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  11. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any
                  changes by posting the new policy on this page and updating the &quot;Last
                  Updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  12. Contact Us
                </h2>
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your privacy
                  rights, please contact us at{' '}
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
