import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { PROJECT_LINKS, EXTERNAL_LINKS } from '@/constants/links';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NeumorphBox className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: December 6, 2025</p>
            
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
                  <li><strong>Usage Data:</strong> We use tools like <strong>Google Analytics</strong>, <strong>Microsoft Clarity</strong>, and <strong>Vercel Analytics</strong> to collect anonymous data about how you interact with our site (e.g., pages visited, time spent, clicks, heatmaps, and session recordings).</li>
                  <li><strong>Advertising Data:</strong> We work with third-party ad providers such as <strong>Google AdSense</strong> which may use cookies and similar technologies to show personalized ads based on your visits to this and other websites.</li>
                  <li><strong>Device Information:</strong> We may collect information about your browser, device type, and operating system.</li>
                  <li><strong>Cookies:</strong> We use cookies to maintain your session, store your preferences, and for advertising purposes.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                <p className="mb-2">We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our services, including hosting via <strong>Vercel</strong> and backend services via <strong>Firebase</strong>.</li>
                  <li>Personalize your experience (e.g., saving your favorite colors).</li>
                  <li>Analyze usage patterns to improve our website and tools.</li>
                  <li>Serve relevant advertisements to support the free version of our tools.</li>
                  <li>Communicate with you about updates or support.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Third-Party Services</h2>
                <p className="mb-2">We share data with trusted third-party service providers to help us operate our business:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Authentication & Backend:</strong> We use <strong>Firebase</strong> (by Google) for secure authentication and database services.</li>
                  <li><strong>Hosting:</strong> Our application is hosted on <strong>Vercel</strong>, which may collect anonymous usage statistics.</li>
                  <li><strong>Analytics:</strong>
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li><strong>Google Analytics:</strong> To understand user behavior and traffic.</li>
                      <li><strong>Microsoft Clarity:</strong> We partner with Microsoft Clarity and Microsoft Advertising to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve and market our products/services. Website usage data is captured using first and third-party cookies and other tracking technologies to determine the popularity of products/services and online activity. Additionally, we use this information for site optimization, fraud/security purposes, and advertising. For more information about how Microsoft collects and uses your data, visit the <a href={EXTERNAL_LINKS.MICROSOFT_PRIVACY} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Privacy Statement</a>. See also <a href={EXTERNAL_LINKS.CLARITY_DISCLOSURE} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Clarity Privacy Disclosure</a>.</li>
                    </ul>
                  </li>
                  <li><strong>Advertising:</strong> We use <strong>Google AdSense</strong> and other ad partners to display advertisements. These partners may use cookies to serve ads based on your prior visits to our website or other websites.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Photo Frame Privacy & Client-Side Processing</h2>
                <p className="mb-4">
                  We prioritize your privacy when using our tools, specifically the <strong>Photo Frame</strong> feature.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Client-Side Processing:</strong> All image processing for the Photo Frame feature happens entirely on your device (in your browser). <strong>We do not upload your photos to any server.</strong></li>
                  <li><strong>No Storage:</strong> Since processing is local, we do not store or have access to the photos you use in the Photo Frame tool.</li>
                  <li><strong>Transparency:</strong> You can verify this by reviewing our source code (see Terms of Service for repository details).</li>
                  <li><strong>Future Changes:</strong> In the future, if we introduce a feature to save your projects to the cloud, we will update this policy. Any such feature would involve uploading data to secure, encrypted storage, and would only occur with your explicit action and consent. As of now, no such upload occurs.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Retention and Deletion</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Retention:</strong> We retain your personal information only as long as necessary to provide you with our services and as required by law.</li>
                  <li><strong>Deletion:</strong> You have the right to request the deletion of your account and all associated personal data. You can do this directly through your "My Profile" page. 
                    <br/><strong>Note:</strong> If you have an active paid subscription, you must first cancel your subscription and wait for the current billing period to end before you can permanently delete your account. This ensures you receive the full service you paid for and allows for proper billing settlement.
                  </li>
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
                  If you have questions about this Privacy Policy, please contact us at <a href={PROJECT_LINKS.GITHUB_DISCUSSIONS} className="text-blue-600 hover:underline">GitHub Discussions</a>.
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
