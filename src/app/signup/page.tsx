'use client';

import React, { useState, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA
import { Button } from "@/components/ui/button";
import Link from 'next/link'; // Import Link
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabaseClient';

export default function SignUp() {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Added first name state
  const [lastName, setLastName] = useState(''); // Added last name state
  const [role, setRole] = useState('student'); // Default to student
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Add success message state
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null); // Clear previous success message

    // Check if terms are agreed
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to sign up.");
      return;
    }

    setIsLoading(true);

    // Execute reCAPTCHA challenge
    const recaptchaToken = await recaptchaRef.current?.executeAsync();
    recaptchaRef.current?.reset(); // Reset after execution

    if (!recaptchaToken) {
      setError("CAPTCHA verification failed. Please try again.");
      setIsLoading(false);
      return;
    }

    // Send data to backend API route
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: role,
          recaptchaToken: recaptchaToken, // Send the token
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Sign-up failed.');
      }

      // Signup successful, show success message and clear form
      setSuccessMessage("Sign-up successful! Please check your email and click the verification link to activate your account.");
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('student');
      setAgreedToTerms(false); // Reset terms checkbox

    } catch (error: any) {
      // Check for the specific error message indicating an existing user
      if (error.message === 'Sign-up failed: This email address is already registered.') {
        setError('Account already exists, please log in.');
      } else {
        // Use the error message from the API for other errors
        setError(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-br from-black via-gray-900 to-indigo-900/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-8 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Sign Up</h1>
            <p className="text-gray-400">Create an account to access Principia AI Homeschool</p>
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-md p-2">
              {error}
            </div>
          )}

          {/* Display success message */}
          {successMessage && (
            <div className="text-center text-green-400 text-sm font-medium bg-green-500/10 border border-green-500/20 rounded-md p-3">
              {successMessage}
            </div>
          )}

          {/* Hide form if signup was successful */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Enter your email address" 
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3"
              />
            </div>
             <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Enter your first name"
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Enter your last name"
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <Input
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Create a password" 
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select 
                id="role" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3 px-3"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option> {/* Corrected role option */}
              </select>
            </div>
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                I agree to the{' '}
                <Link href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">
                  Privacy Policy
                </Link>.
              </label>
            </div>
            {/* Add ReCAPTCHA component (invisible v3) */}
            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} // Use site key from env
              // badge="bottomright" // Optional: control badge position
            />
            <Button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
