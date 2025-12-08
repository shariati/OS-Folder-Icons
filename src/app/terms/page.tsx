import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { SOCIAL_LINKS, PROJECT_LINKS } from '@/constants/links';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NeumorphBox className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: December 8, 2025</p>
            
            <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Welcome to <strong>HD Pick</strong>. By accessing or using our website and services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our services.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Description of Service</h2>
                <p>
                  HD Pick provides a platform for users to generate, customize, and download folder icons for various operating systems (macOS, Windows, Linux). We also offer curated bundles of icons and a Photo Frame tool for creating custom photo displays.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Eligibility and Age Requirement</h2>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    You must be at least 16 years old to use HD Pick.
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>By creating an account or using our services, you represent and warrant that you are at least 16 years of age.</li>
                  <li>If you are under 18 years old, you represent that you have your parent&apos;s or legal guardian&apos;s permission to use this service.</li>
                  <li>We reserve the right to terminate accounts of users who misrepresent their age.</li>
                  <li>If you are a parent or guardian and believe your child under 16 has created an account, please contact us immediately at <a href="mailto:hello@hdpick.com">hello@hdpick.com</a>.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Registration:</strong> You may need to create an account to access certain features. You agree to provide accurate and complete information.</li>
                  <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li><strong>Deletion:</strong> You have the right to delete your account and personal data at any time through your account settings. However, if you have an active paid subscription, you must first cancel the subscription and wait for the remainder of the paid term to expire before deleting the account.</li>
                  <li><strong>Subscription Cancellation:</strong> You may cancel your subscription at any time. Your access to paid features will continue until the end of your current billing period. We do not provide refunds for partial subscription periods.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Subscription Plans</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Monthly and Annual Subscriptions</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Monthly and annual subscriptions provide access to PRO features for the duration of the subscription period.</li>
                  <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
                  <li>You can cancel at any time, and your access continues until the end of the current billing period.</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Lifetime Subscription</h3>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
                  <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Important: Please read carefully before purchasing a Lifetime subscription.
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Definition of &quot;Lifetime&quot;:</strong> &quot;Lifetime&quot; refers to the operational lifetime of HD Pick as a service. It does not mean &quot;forever&quot; or your personal lifetime. Your Lifetime access is valid as long as HD Pick continues to operate.</li>
                  <li><strong>Included Features:</strong> Your Lifetime subscription includes only the specific features and tools described in your subscription package at the time of purchase. You should carefully review the package details before purchasing.</li>
                  <li><strong>New Features:</strong> New features, tools, or services that are not directly related to your original package may not be included in your Lifetime subscription. We may offer new features as separate products or require additional purchases.</li>
                  <li><strong>Feature Updates:</strong> Bug fixes, improvements, and updates to your included features will remain available to Lifetime subscribers.</li>
                  <li><strong>Service Discontinuation:</strong> In the unlikely event that HD Pick discontinues operations, we will provide at least 90 days advance notice to all users. No refunds will be issued for Lifetime subscriptions in such circumstances, as you will have had the benefit of the service during your subscription period.</li>
                  <li><strong>Non-Transferable:</strong> Lifetime subscriptions are non-transferable and are tied to the account that made the purchase.</li>
                  <li><strong>No Refunds:</strong> Lifetime subscriptions are non-refundable once purchased, except where required by applicable law.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Intellectual Property</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Our Content:</strong> All content provided by HD Pick, including the icon generator tool, designs, logos, and code, is the property of HD Pick or its licensors and is protected by copyright and other intellectual property laws.</li>
                  <li><strong>User-Generated Content:</strong> By creating icons using our tools, you retain rights to your specific customizations, but you grant us a license to display and use them for the purpose of providing the service.</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Source Code License</h3>
                <p className="mb-2">
                  The source code for HD Pick is available for transparency and educational purposes.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Open Source (Non-Commercial):</strong> The source code is available for personal and educational use. You can view the source code on our <a href={SOCIAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Repository</a>.</li>
                  <li><strong>Commercial Use:</strong> Any commercial use of the source code, its variations, or deployment of this application for commercial purposes requires a separate commercial license and payment of royalty fees. Please contact us for details.</li>
                  <li><strong>Restrictions:</strong> You may not reverse engineer, decompile, or attempt to extract the source code of our software for commercial reproduction without a license.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Usage Rights</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Use:</strong> You may use the icons generated or downloaded for personal and non-commercial purposes freely.</li>
                  <li><strong>Commercial Use:</strong> Commercial use of the icons may require a separate license or attribution, as specified in the specific bundle details.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Third-Party Services</h2>
                <p className="mb-2">Our service integrates with third-party tools to provide functionality, analytics, and advertising:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Infrastructure:</strong> Hosted on <strong>Vercel</strong> with backend services provided by <strong>Firebase</strong> (Google).</li>
                  <li><strong>Authentication:</strong> Google, GitHub, or other providers for secure sign-in.</li>
                  <li><strong>Analytics:</strong> <strong>Google Analytics</strong> and <strong>Microsoft Clarity</strong> are used to improve user experience through traffic analysis, heatmaps, and session recordings.</li>
                  <li><strong>Advertising:</strong> <strong>Google AdSense</strong> and other providers display ads, which may use cookies to personalize content.</li>
                </ul>
                <p>
                  Your use of these third-party services is subject to their respective terms and privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Photo Frame Feature Usage</h2>
                <p className="mb-2">
                  We are committed to your privacy when using our tools.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Local Processing:</strong> The Photo Frame feature processes your images entirely within your browser (client-side). We do not upload your personal photos to our servers.</li>
                  <li><strong>Data Security:</strong> Since your photos never leave your device, they remain secure and private.</li>
                  <li><strong>Future Updates:</strong> If we introduce cloud saving features in the future, we will explicitly inform you and ensure data is stored in secure, encrypted storage.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Prohibited Conduct</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal purpose.</li>
                  <li>Upload malicious code or content.</li>
                  <li>Interfere with the proper working of the service.</li>
                  <li>Scrape or harvest data from our website without permission.</li>
                  <li>Create multiple accounts to circumvent subscription or usage limits.</li>
                  <li>Share your account credentials with others.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Disclaimer of Warranties</h2>
                <p>
                  The service is provided &quot;as is&quot; without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Limitation of Liability</h2>
                <p>
                  HD Pick shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting a notice on our website or sending an email. Your continued use of the service constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which HD Pick operates, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at <a href={PROJECT_LINKS.GITHUB_DISCUSSIONS} className="text-blue-600 hover:underline">GitHub Discussions</a>.
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
