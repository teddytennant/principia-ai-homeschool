'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-white">Signup Unavailable</h1>
        <p className="text-xl text-gray-300 mb-8">We are currently focusing on school district partnerships. Individual signups are not available at this time.</p>
        <Button asChild variant="outline" className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-white">
          <Link href="/pricing">View Pricing for Schools</Link>
        </Button>
      </div>
    </div>
  );
}
