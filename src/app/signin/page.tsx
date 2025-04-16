"use client";

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the sign-in logic with username and password
    signIn("credentials", { username, password, redirect: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900/30 text-gray-100 flex flex-col items-center justify-center py-20 px-4 overflow-hidden h-screen w-screen fixed top-0 left-0">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">Sign In</h1>
        <p className="text-lg text-gray-300 mb-8">Use the username and password provided by your teacher or district.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <Input 
              id="username" 
              type="text" 
              placeholder="Enter your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
