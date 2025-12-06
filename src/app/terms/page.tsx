import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NeumorphBox className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: December 6, 2025</p>
            
            <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Welcome to <strong>OS Folder Icons</strong>. By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Description of Service</h2>
                <p>
                  OS Folder Icons provides a platform for users to generate, customize, and download folder icons for various operating systems (macOS, Windows, Linux). We also offer curated bundles of icons.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. User Accounts</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Registration:</strong> You may need to create an account to access certain features. You agree to provide accurate and complete information.</li>
                  <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li><strong>Deletion:</strong> You have the right to delete your account and personal data at any time through your account settings. However, if you have an active paid subscription, you must first cancel the subscription and wait for the remainder of the paid term to expire before deleting the account.</li>
                  <li><strong>Subscription Cancellation:</strong> You may cancel your subscription at any time. Your access to paid features will continue until the end of your current billing period. We do not provide refunds for partial subscription periods.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Intellectual Property</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Our Content:</strong> All content provided by OS Folder Icons, including the icon generator tool, designs, logos, and code, is the property of OS Folder Icons or its licensors and is protected by copyright and other intellectual property laws.</li>
                  <li><strong>User-Generated Content:</strong> By creating icons using our tools, you retain rights to your specific customizations, but you grant us a license to display and use them for the purpose of providing the service.</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Source Code License</h3>
                <p className="mb-2">
                  The source code for OS Folder Icons is available for transparency and educational purposes.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Open Source (Non-Commercial):</strong> The source code is available for personal and educational use. You can view the source code on our <a href="https://github.com/shariati/OS-Folder-Icons" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Repository</a>.</li>
                  <li><strong>Commercial Use:</strong> Any commercial use of the source code, its variations, or deployment of this application for commercial purposes requires a separate commercial license and payment of royalty fees. Please contact us for details.</li>
                  <li><strong>Restrictions:</strong> You may not reverse engineer, decompile, or attempt to extract the source code of our software for commercial reproduction without a license.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Usage Rights</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Use:</strong> You may use the icons generated or downloaded for personal and non-commercial purposes freely.</li>
                  <li><strong>Commercial Use:</strong> Commercial use of the icons may require a separate license or attribution, as specified in the specific bundle details.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Third-Party Services</h2>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Photo Frame Feature Usage</h2>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Prohibited Conduct</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal purpose.</li>
                  <li>Upload malicious code or content.</li>
                  <li>Interfere with the proper working of the service.</li>
                  <li>Scrape or harvest data from our website without permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Disclaimer of Warranties</h2>
                <p>
                  The service is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
                <p>
                  OS Folder Icons shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes. Your continued use of the service constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at <a href="https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a" className="text-blue-600 hover:underline">GitHub Discussions</a>.
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
