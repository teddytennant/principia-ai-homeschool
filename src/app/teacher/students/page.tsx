'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header'; // Assuming shared header
import { Footer } from '@/components/layout/Footer'; // Assuming shared footer
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

// Define the structure for student data received from API
interface StudentProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State for the "Add Student" form
  const [newEmail, setNewEmail] = useState(''); // Add state for email
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Get session for JWT
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'Not authenticated');
      }
      const token = session.access_token;

      // Use the correct endpoint to fetch students managed by the teacher
      const response = await fetch('/api/teacher/get-students', { // Updated endpoint
        headers: {
          'Authorization': `Bearer ${token}` // Send JWT
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to fetch students (${response.status})`);
      }
      const data: StudentProfile[] = await response.json();
      setStudents(data);
    } catch (err: any) {
      console.error("Fetch students error:", err);
      setFetchError(err.message || "An unknown error occurred while fetching students.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new student
  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      // Get session for JWT
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'Not authenticated');
      }
      const token = session.access_token;

      const response = await fetch('/api/teacher/create-student', { // Use the correct endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add JWT
        },
        body: JSON.stringify({
          email: newEmail, // Add email
          username: newUsername,
          password: newPassword,
          firstName: newFirstName,
          lastName: newLastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to add student (${response.status})`);
      }

      // Add successful - Use the message from the API response
      setAddSuccess(result.message || 'Student added successfully!');
      // Clear form
      setNewEmail(''); // Clear email field
      setNewUsername('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      // Refresh student list
      fetchStudents();

    } catch (err: any) {
      console.error("Add student error:", err);
      // Check if the error object has structured details (from Zod validation)
      if (err.message && typeof err.message === 'string' && err.message.startsWith('{')) {
         try {
            const parsedError = JSON.parse(err.message);
            if (parsedError.error?.details) {
               // Format validation errors nicely
               const errorMessages = Object.entries(parsedError.error.details)
                 .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                 .join('; ');
               setAddError(`Invalid input: ${errorMessages}`);
            } else if (parsedError.error?.message) {
                 setAddError(parsedError.error.message);
            } else {
                 setAddError("An unknown error occurred while adding the student.");
            }
         } catch (parseError) {
             // Fallback if parsing fails
             setAddError(err.message || "An unknown error occurred while adding the student.");
         }
      } else {
          // Standard error message
          setAddError(err.message || "An unknown error occurred while adding the student.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Manage Students</h1>

          {/* Add Student Form */}
          <div className="mb-12 p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newFirstName" className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <Input id="newFirstName" type="text" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} required placeholder="Student's First Name" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                </div>
                <div>
                  <label htmlFor="newLastName" className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <Input id="newLastName" type="text" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} required placeholder="Student's Last Name" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                </div>
                 <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="Student's Email Address" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                </div>
                <div>
                  <label htmlFor="newUsername" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <Input id="newUsername" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required placeholder="Create a username" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Create a password (min. 6 chars)" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                </div>
              </div>
              {addError && <p className="text-red-400 text-sm">{addError}</p>}
              {addSuccess && <p className="text-green-400 text-sm">{addSuccess}</p>}
              <Button type="submit" disabled={isAdding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50">
                {isAdding ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </div>

          {/* Student List */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Students</h2>
            {isLoading && <p className="text-gray-400">Loading students...</p>}
            {fetchError && <p className="text-red-400">Error loading students: {fetchError}</p>}
            {!isLoading && !fetchError && (
              students.length === 0 ? (
                <p className="text-gray-400">You haven't added any students yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-900/50 border border-gray-700/30 rounded-lg">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Username</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Added On</th>
                        {/* Add Actions column if needed (e.g., Reset Password, Delete) */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-200">{student.username || '-'}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-200">{student.first_name} {student.last_name}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-400">{new Date(student.created_at).toLocaleDateString()}</td>
                          {/* Add action buttons here */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
