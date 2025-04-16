import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | Principia AI",
  description: "The terms and conditions for using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Terms of Service</h1>
      <p className="text-sm text-gray-100 mb-6 text-center">Last updated: April 13, 2025</p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Acceptance of Terms</h2>
          <p className="text-gray-100 leading-relaxed">
            By accessing or using the Principia AI platform, you agree to be bound by these Terms of Service 
            (referred to as Terms) and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Use of Service</h2>
          <p className="text-gray-100 leading-relaxed">
            Principia AI provides an educational platform for teachers and students. You agree to use our services 
            only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the 
            confidentiality of your account and password.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">User Conduct</h2>
          <p className="text-gray-100 leading-relaxed">
            You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-100">
            <li>Use the platform in any way that violates applicable laws or regulations</li>
            <li>Engage in unauthorized access to any part of the platform</li>
            <li>Interfere with or disrupt the platform&apos;s functionality</li>
            <li>Upload or transmit viruses or other harmful code</li>
            <li>Engage in harassment, bullying, or other harmful behavior towards other users</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Content Ownership and License</h2>
          <p className="text-gray-100 leading-relaxed">
            Content uploaded by users (such as curriculum materials and educational content) remains the property 
            of the respective owners. By uploading content, you grant Principia AI a non-exclusive, worldwide, 
            royalty-free license to use, reproduce, and distribute the content for the purpose of providing and 
            improving our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Intellectual Property</h2>
          <p className="text-gray-100 leading-relaxed">
            The Principia AI platform, including its design, code, and content created by us, is protected by 
            copyright, trademark, and other laws. You may not copy, modify, or create derivative works of our 
            intellectual property without explicit permission.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Account Termination</h2>
          <p className="text-gray-100 leading-relaxed">
            We reserve the right to suspend or terminate your account at our sole discretion, with or without notice, 
            for any violation of these Terms or for any other reason we deem necessary to protect our platform or users.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Disclaimer of Warranties</h2>
          <p className="text-gray-100 leading-relaxed">
            Our services are provided on an as-is and as-available basis. We disclaim all warranties, express or 
            implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, 
            and non-infringement.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Limitation of Liability</h2>
          <p className="text-gray-100 leading-relaxed">
            To the maximum extent permitted by law, Principia AI shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
            or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of 
            our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Indemnification</h2>
          <p className="text-gray-100 leading-relaxed">
            You agree to indemnify and hold harmless Principia AI, its affiliates, officers, directors, employees, 
            and agents from any claims, liabilities, damages, or expenses, including reasonable attorney fees, 
            arising out of your use of the platform or violation of these Terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Governing Law and Dispute Resolution</h2>
          <p className="text-gray-100 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, 
            without regard to its conflict of law principles. Any disputes arising under or in connection with these 
            Terms shall be resolved through binding arbitration in San Francisco, California, in accordance with the 
            rules of the American Arbitration Association.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Changes to Terms</h2>
          <p className="text-gray-100 leading-relaxed">
            We may modify these Terms at any time. We will notify you of significant changes by posting the updated 
            Terms on this page with a new effective date. Your continued use of the platform after such changes 
            constitutes your acceptance of the new Terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
          <p className="text-gray-100 leading-relaxed">
            If you have any questions about these Terms, please contact us at hello@principia-ai.com. We&#39;re here to help you understand your rights and obligations.
          </p>
          <p className="text-gray-100 mt-2">
            Email: legal@principia-ai.com<br />
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
