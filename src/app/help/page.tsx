import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link'; // Import Link

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Help & Support</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Frequently Asked Questions (FAQ)</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg text-gray-200">How do I sign up?</h3>
                  <p className="text-gray-400">Visit the <Link href="/signup" className="text-indigo-400 hover:underline">Sign Up</Link> page and choose either a Parent/Teacher or Student account. Fill in the required details and agree to the terms.</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-200">How do I manage my subscription?</h3>
                  <p className="text-gray-400">You can view your subscription status and cancel your subscription from the <Link href="/settings" className="text-indigo-400 hover:underline">Account Settings</Link> page after logging in.</p>
                </div>
                 <div>
                  <h3 className="font-medium text-lg text-gray-200">How do Parents/Teachers add students?</h3>
                  <p className="text-gray-400">Log in to your Parent/Teacher account and navigate to the "Manage Students" dashboard (usually found at `/teacher/students`). Use the "Add New Student" form provided.</p>
                </div>
                 <div>
                  <h3 className="font-medium text-lg text-gray-200">How do I change my profile information?</h3>
                  <p className="text-gray-400">Log in and go to the <Link href="/settings" className="text-indigo-400 hover:underline">Account Settings</Link> page to update your first and last name.</p>
                </div>
                {/* Add more relevant FAQs */}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Troubleshooting</h2>
               <div className="space-y-4">
                 <div>
                  <h3 className="font-medium text-lg text-gray-200">Login Issues</h3>
                  <p className="text-gray-400">Ensure you are using the correct email and password. If you signed up recently, check your email for a verification link. If you forgot your password, use the password reset option on the sign-in page (if available).</p>
                </div>
                 <div>
                  <h3 className="font-medium text-lg text-gray-200">AI Assistant Not Responding</h3>
                  <p className="text-gray-400">Check if your teacher has enabled the AI assistant for your account or subject in their settings. Ensure you have not exceeded daily message limits. Try refreshing the page or starting a new chat session.</p>
                </div>
                {/* Add more troubleshooting tips */}
               </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Support</h2>
              <p className="text-gray-400">
                If you need further assistance or have questions not covered here, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:[Your Support Email]" className="text-indigo-400 hover:underline">[Your Support Email]</a>
              </p>
              {/* Optionally add a contact form link or other methods */}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
