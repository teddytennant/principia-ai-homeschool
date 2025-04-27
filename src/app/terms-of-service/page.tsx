import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-invert max-w-4xl mx-auto">
          <h1>Terms of Service</h1>
          <p>Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Principia AI Homeschool ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Principia AI Homeschool provides an AI-powered learning assistant and related educational tools. Features and availability are subject to change without notice.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account password and for any activities or actions under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. Parent/Teacher accounts are responsible for managing associated student accounts.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You agree not to misuse the AI assistant or attempt to bypass safety filters.
          </p>

          <h2>5. Subscriptions and Payment</h2>
          <p>
            Certain features of the Service may require payment. Subscription terms, pricing, and payment methods are detailed on our Pricing page and are processed via Stripe. You are responsible for all applicable taxes. Subscriptions auto-renew unless canceled. You can manage or cancel your subscription through your Account Settings page. Refunds are handled according to our refund policy (if applicable).
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Principia AI and its licensors.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Principia AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2>9. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied. We do not warrant that the AI responses will always be accurate, complete, or suitable for your specific educational needs.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction - e.g., State of California, USA], without regard to its conflict of law provisions.
          </p>

          <h2>11. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at [Your Contact Email or Link].
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
