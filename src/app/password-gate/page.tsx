"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PasswordGatePage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Use server-side validation for site access password.
    try {
      const response = await fetch('/api/validate-site-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        // Upon successful validation, redirect to homepage or set a secure token.
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error('Error validating password:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-8 rounded-lg shadow-lg max-w-md w-full bg-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Site Access</h1>
        <p className="text-gray-300 mb-6 text-center">Enter the password to access the site.</p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter site password"
              className="w-full bg-gray-700 border-gray-600 text-white rounded-md py-3"
              required
            />
          </div>
          <Button type="submit" className="w-full py-3">Submit</Button>
        </form>
      </div>
    </div>
  );
}
