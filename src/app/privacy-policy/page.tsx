import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
          <p>Last Updated: April 24, 2025</p>

          <p>Principia AI Homeschool ("us", "we", or "our") operates the Principia AI Homeschool website and application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

          <h2 className="text-xl font-semibold text-white pt-4">1. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          <p>Types of Data Collected:</p>
          <ul>
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to: Email address, First name and last name, Usage Data.</li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
            <li><strong>Student Data:</strong> For student users, we may collect information related to their learning progress, interactions with the AI tutor, and curriculum engagement. This data is used solely for educational purposes within the Service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">2. Use of Data</h2>
          <p>Principia AI Homeschool uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To personalize the learning experience</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">3. Data Transfer</h2>
          <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
          <p>Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>

          <h2 className="text-xl font-semibold text-white pt-4">4. Data Disclosure</h2>
          <p>Principia AI Homeschool may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
          <ul>
            <li>To comply with a legal obligation</li>
            <li>To protect and defend the rights or property of Principia AI Homeschool</li>
            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
            <li>To protect the personal safety of users of the Service or the public</li>
            <li>To protect against legal liability</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">5. Data Security</h2>
          <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

          <h2 className="text-xl font-semibold text-white pt-4">6. Service Providers</h2>
          <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

          <h2 className="text-xl font-semibold text-white pt-4">7. Children's Privacy</h2>
          <p>Our Service addresses users under the age of 18 ("Children"). We collect personally identifiable information from Children as described in Section 1. This information is used solely for educational purposes within the Service and is not shared with third parties except as necessary to provide the Service (e.g., cloud hosting providers) or as required by law. Parents or guardians can review their child's personal information, direct us to delete it, and refuse to allow any further collection or use of the child's information.</p>

          <h2 className="text-xl font-semibold text-white pt-4">8. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2 className="text-xl font-semibold text-white pt-4">9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us.</p>
          <p><strong>Legal Advice Disclaimer:</strong> The information provided in this Policy is not legal advice. You should consult with a qualified legal professional for advice specific to your situation.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
