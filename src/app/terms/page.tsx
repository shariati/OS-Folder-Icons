import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl neu-flat">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: December 1, 2025</p>
            
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
                  <li><strong>Deletion:</strong> You have the right to delete your account and personal data at any time through your account settings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Intellectual Property</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Our Content:</strong> All content provided by OS Folder Icons, including the icon generator tool, designs, logos, and code, is the property of OS Folder Icons or its licensors and is protected by copyright and other intellectual property laws.</li>
                  <li><strong>User-Generated Content:</strong> By creating icons using our tools, you retain rights to your specific customizations, but you grant us a license to display and use them for the purpose of providing the service.</li>
                  <li><strong>Restrictions:</strong> You may not reverse engineer, decompile, or attempt to extract the source code of our software, except as permitted by open-source licenses where applicable.</li>
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
                <p className="mb-2">Our service may integrate with third-party tools such as:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Social Login:</strong> Google, GitHub, or other providers for authentication.</li>
                  <li><strong>Analytics:</strong> Google Analytics and Microsoft Clarity to improve user experience.</li>
                </ul>
                <p>
                  Your use of these third-party services is subject to their respective terms and privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Prohibited Conduct</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal purpose.</li>
                  <li>Upload malicious code or content.</li>
                  <li>Interfere with the proper working of the service.</li>
                  <li>Scrape or harvest data from our website without permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Disclaimer of Warranties</h2>
                <p>
                  The service is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
                <p>
                  OS Folder Icons shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes. Your continued use of the service constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at <a href="https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a" className="text-blue-600 hover:underline">GitHub Discussions</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
