import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <h1>Privacy Policy</h1>
          <p>Last Updated: {new Date().toLocaleDateString()}</p>

          <p>
            Principia AI ("us", "we", or "our") operates the Principia AI Homeschool website and service (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>

          <h2>1. Information Collection and Use</h2>
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </p>
          <h3>Types of Data Collected</h3>
          <ul>
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to: Email address, First name and last name, Usage Data, Cookies.</li>
            <li><strong>Account Data:</strong> We store account information including user roles (student, teacher), associated student accounts (for teachers), and subscription details (linked via Stripe IDs).</li>
            <li><strong>Usage Data:</strong> We may collect information on how the Service is accessed and used ("Usage Data"). This may include IP address, browser type, pages visited, time spent, and diagnostic data.</li>
            <li><strong>Chat Data:</strong> Conversations with the AI assistant may be logged for service improvement, monitoring, and safety purposes. We strive to minimize collection of sensitive personal information within chats.</li>
            <li><strong>Teacher Settings & Curriculum:</strong> For teacher accounts, we store settings related to AI behavior, grade levels, subjects, and uploaded curriculum content to personalize the learning experience for their students.</li>
          </ul>

          <h2>2. Use of Data</h2>
          <p>Principia AI uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To manage your account and subscriptions</li>
            <li>To provide customer support</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To personalize the learning experience based on teacher settings</li>
            <li>To improve the AI assistant and overall Service</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          <p>
            Your information, including Personal Data, is stored securely using Supabase and Stripe (for payment information). We implement reasonable security measures to protect your data, but no method of transmission over the Internet or electronic storage is 100% secure.
          </p>

           <h2>4. Data Sharing and Disclosure</h2>
           <p>We may share your data in the following situations:</p>
           <ul>
             <li><strong>With Service Providers:</strong> We may employ third-party companies (e.g., Supabase, Stripe, OpenRouter/OpenAI) to facilitate our Service, provide the Service on our behalf, or assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
             <li><strong>For Legal Requirements:</strong> We may disclose your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, prevent or investigate possible wrongdoing in connection with the Service, protect the personal safety of users of the Service or the public, or protect against legal liability.</li>
           </ul>
           <p>We do not sell your personal information.</p>

          <h2>5. Your Data Protection Rights</h2>
          <p>
            Depending on your location, you may have certain data protection rights, including the right to access, update, or delete the information we have on you. You can manage your account information through the Account Settings page. Please contact us if you wish to exercise other rights.
          </p>

          <h2>6. Children's Privacy</h2>
          <p>
            Our Service is intended for use in an educational setting, potentially including users under the age of 18 ("Children"). Parent/Teacher accounts are responsible for creating and managing student accounts. We collect information from Children only as necessary to provide the Service and under the direction of the parent/teacher. We encourage parents/teachers to monitor their students' use of the Service.
          </p>

          <h2>7. Links to Other Sites</h2>
          <p>
            Our Service may contain links to other sites that are not operated by us. If you click a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>

          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at [Your Contact Email or Link].
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
