'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/password/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'same-origin',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      router.push('/');
    } else {
      setError(data.message || 'Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Enter Site Password</h1>
        <input
          type="password"
          className="w-full px-4 py-2 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-indigo-400"
          placeholder="Site Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-semibold transition">
          Unlock Site
        </button>
      </form>
    </div>
  );
}
