import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl neu-flat">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: December 1, 2025</p>
            
            <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>OS Folder Icons</strong> ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">A. Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Information:</strong> When you register, we collect your name, email address, and profile picture (via Social Login).</li>
                  <li><strong>User Content:</strong> We store the configurations and preferences for the icons you generate or bundles you save.</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">B. Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Usage Data:</strong> We use tools like <strong>Google Analytics</strong> and <strong>Microsoft Clarity</strong> to collect anonymous data about how you interact with our site (e.g., pages visited, time spent, clicks).</li>
                  <li><strong>Device Information:</strong> We may collect information about your browser, device type, and operating system.</li>
                  <li><strong>Cookies:</strong> We use cookies to maintain your session and store your preferences.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                <p className="mb-2">We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our services.</li>
                  <li>Personalize your experience (e.g., saving your favorite colors).</li>
                  <li>Analyze usage patterns to improve our website and tools.</li>
                  <li>Communicate with you about updates or support.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Third-Party Services</h2>
                <p className="mb-2">We share data with trusted third-party service providers to help us operate our business:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Authentication:</strong> We use third-party providers (e.g., Google, GitHub) for secure login.</li>
                  <li><strong>Analytics:</strong> We use Google Analytics and Microsoft Clarity to understand user behavior. These services may capture data such as heatmaps and session recordings to help us improve usability.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Retention and Deletion</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Retention:</strong> We retain your personal information only as long as necessary to provide you with our services and as required by law.</li>
                  <li><strong>Deletion:</strong> You have the right to request the deletion of your account and all associated personal data. You can do this directly through your account settings or by contacting us. Upon deletion, your data will be permanently removed from our active databases.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Children's Privacy</h2>
                <p>
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at <a href="https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a" className="text-blue-600 hover:underline">GitHub Discussions</a>.
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
