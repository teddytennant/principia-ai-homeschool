import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
          <p>Last Updated: April 24, 2025</p>

          <p>Welcome to Principia AI Homeschool! These Terms of Service ("Terms") govern your use of our website, applications, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>

          <h2 className="text-xl font-semibold text-white pt-4">1. Use of Service</h2>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the Service complies with all applicable laws and regulations.</p>

          <h2 className="text-xl font-semibold text-white pt-4">2. Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

          <h2 className="text-xl font-semibold text-white pt-4">3. Subscriptions and Payment</h2>
          <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select.</p>
          <p><strong>Refund Policy:</strong> All payments are non-refundable. Principia AI Homeschool is not obligated to provide refunds or credits for any reason, including if the product isn't working as expected or if you are dissatisfied with the Service. We reserve the right to issue refunds or credits at our sole discretion.</p>

          <h2 className="text-xl font-semibold text-white pt-4">4. Usage Limits</h2>
          <p>Certain features, such as the Socratic Tutor, may be described as "unlimited." However, this is subject to fair use. Principia AI Homeschool reserves the right to implement reasonable usage limits to prevent abuse, ensure service stability, and maintain fair access for all users. Excessive use deemed detrimental to the Service may result in limitations or suspension of access to certain features or your account, at our sole discretion.</p>

          <h2 className="text-xl font-semibold text-white pt-4">5. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Principia AI Homeschool and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

          <h2 className="text-xl font-semibold text-white pt-4">6. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

          <h2 className="text-xl font-semibold text-white pt-4">7. Limitation of Liability</h2>
          <p>In no event shall Principia AI Homeschool, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

          <h2 className="text-xl font-semibold text-white pt-4">8. Disclaimer</h2>
          <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied.</p>
          <p><strong>Legal Advice Disclaimer:</strong> The information provided in these Terms is not legal advice. You should consult with a qualified legal professional for advice specific to your situation.</p>

          <h2 className="text-xl font-semibold text-white pt-4">9. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Principia AI Homeschool operates, without regard to its conflict of law provisions.</p>

          <h2 className="text-xl font-semibold text-white pt-4">10. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

          <h2 className="text-xl font-semibold text-white pt-4">11. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
