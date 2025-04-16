import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | Principia AI",
  description: "Our commitment to protecting your privacy and data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Privacy Policy</h1>
      <p className="text-sm text-gray-100 mb-6 text-center">Last updated: April 13, 2025</p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
          <p className="text-gray-100 leading-relaxed">
            At Principia AI, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
          <p className="text-gray-100 leading-relaxed">
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-100">
            <li>Personal identification information (name, email address, etc.)</li>
            <li>Educational data and curriculum information</li>
            <li>Usage data and analytics about how you interact with our platform</li>
            <li>Technical information such as IP address, browser type, and device information</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
          <p className="text-gray-100 leading-relaxed">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-100">
            <li>Provide and improve our educational services</li>
            <li>Personalize learning experiences</li>
            <li>Communicate with you about updates and features</li>
            <li>Analyze usage patterns to enhance platform functionality</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Data Sharing and Disclosure</h2>
          <p className="text-gray-100 leading-relaxed">
            We do not sell your personal information. We may share information with:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-100">
            <li>Service providers who assist in operating our platform</li>
            <li>Educational institutions when required for your learning program</li>
            <li>Legal authorities when required by law or to protect our rights</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Data Security</h2>
          <p className="text-gray-100 leading-relaxed">
            We implement industry-standard security measures to protect your data from unauthorized access, 
            alteration, disclosure, or destruction. However, no method of transmission over the Internet 
            is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Your Rights and Choices</h2>
          <p className="text-gray-100 leading-relaxed">
            Depending on your location, you may have rights regarding your personal data, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-100">
            <li>Access to the personal information we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request data portability</li>
          </ul>
          <p className="text-gray-100 leading-relaxed mt-2">
            To exercise these rights, please contact us using the information below.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Children's Privacy</h2>
          <p className="text-gray-100 leading-relaxed">
            Our services may be used by children under the age of 13 with parental consent. 
            We comply with the Children's Online Privacy Protection Act (COPPA) and other relevant laws. 
            If you are a parent or guardian and believe your child has provided us with personal information, 
            please contact us immediately.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Cookies and Tracking Technologies</h2>
          <p className="text-gray-100 leading-relaxed">
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and provide personalized content. You can manage cookie preferences through your browser settings.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">International Data Transfers</h2>
          <p className="text-gray-100 leading-relaxed">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data during such transfers.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Changes to This Policy</h2>
          <p className="text-gray-100 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of significant changes 
            by posting the new policy on this page with an updated effective date.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
          <p className="text-gray-100 leading-relaxed">
            If you have questions or concerns about this Privacy Policy or our data practices, 
            please contact us at:
          </p>
          <p className="text-gray-100 mt-2">
            Email: privacy@principia-ai.com<br />
            Address: Principia AI, 123 Education Lane, Suite 456, San Francisco, CA 94105
          </p>
        </section>
      </div>
      
      <div className="mt-12 text-center">
        <Link href="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
