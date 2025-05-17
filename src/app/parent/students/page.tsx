'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, X, UserPlus, BookOpen, Users } from 'lucide-react'; // Ensure all icons are imported

interface StudentProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface ParentProfile {
  plan_type: string | null;
  extra_student_slots: number | null;
}

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [totalLimit, setTotalLimit] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Re-add state to trigger refresh

  const BASE_LIMITS: { [key: string]: number } = {
    family: 5,
    'co-op': 25,
    free: 0,
  };

  // Define fetch functions directly
  const fetchStudents = async (token: string): Promise<StudentProfile[]> => {
    console.log("ManageStudents: fetchStudents START...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    try {
      const response = await fetch('/api/parent/get-students', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        let errorMsg = `Failed to fetch students (${response.status})`;
        try { const data = await response.json(); errorMsg = data.error?.message || data.message || errorMsg; } catch (e) {}
        console.error("ManageStudents: fetchStudents error response:", errorMsg);
        throw new Error(errorMsg);
      }
      const data: StudentProfile[] = await response.json();
      console.log(`ManageStudents: Fetched ${data.length} students. Returning data.`);
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error("ManageStudents: fetchStudents timed out after 10 seconds.");
        throw new Error("Request timed out. Please check your internet connection and try again.");
      }
      throw error;
    }
  };

  const fetchParentProfile = async (token: string): Promise<ParentProfile> => {
    console.log("ManageStudents: fetchParentProfile START...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        let errorMsg = `Failed to fetch parent profile (${response.status})`;
        try { const data = await response.json(); errorMsg = data.error?.message || data.message || errorMsg; } catch (e) {}
        console.error("ManageStudents: fetchParentProfile error response:", errorMsg);
        throw new Error(errorMsg);
      }
      const profileData: ParentProfile = await response.json();
      console.log("ManageStudents: Fetched parent profile:", profileData);
      return profileData;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error("ManageStudents: fetchParentProfile timed out after 10 seconds.");
        throw new Error("Request timed out. Please check your internet connection and try again.");
      }
      throw error;
    }
  };


  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      console.log(`ManageStudents: Starting data fetch useEffect... (refreshKey: ${refreshKey})`);
      if(isMounted) setIsLoading(true);
      setFetchError(null);

      let token: string | null = null;

      try {
        console.log("ManageStudents: Getting session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (sessionError || !session) {
          throw new Error(sessionError?.message || 'Not authenticated');
        }
        token = session.access_token;
        console.log("ManageStudents: Session obtained.");

        // Fetch profile and students sequentially
        console.log("ManageStudents: Attempting to fetch parent profile...");
        const fetchedProfileData = await fetchParentProfile(token);
        if (!isMounted) return;
        setParentProfile(fetchedProfileData);
        console.log("ManageStudents: Finished fetching parent profile attempt.");

        console.log("ManageStudents: Attempting to fetch students...");
        const fetchedStudents = await fetchStudents(token);
        if (!isMounted) return;
        setStudents(fetchedStudents);
        console.log("ManageStudents: Finished fetching students attempt and set state.");

        console.log("ManageStudents: Data fetch steps completed successfully.");

      } catch (err: any) {
        console.error("ManageStudents: Error during data fetch (try block):", err);
        if (isMounted) {
            setFetchError(err.message || "An unknown error occurred while loading data.");
            setParentProfile(null);
            setTotalLimit(null);
            setStudents([]);
        }
      } finally {
        console.log("ManageStudents: Running finally block...");
        if (isMounted) {
            console.log("ManageStudents: Component is mounted, setting isLoading to false.");
            setIsLoading(false);
        } else {
             console.log("ManageStudents: Component unmounted before finally block, skipping setIsLoading.");
        }
      }
    };

    fetchData();

    return () => {
        console.log("ManageStudents: useEffect cleanup running.");
        isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]); // Re-run effect ONLY when refreshKey changes

  // Separate effect for limit calculation
  useEffect(() => {
    if (parentProfile) {
      const planType = parentProfile.plan_type || 'free';
      const baseLimit = BASE_LIMITS[planType] || 0;
      const extraSlots = parentProfile.extra_student_slots || 0;
      setTotalLimit(baseLimit + extraSlots);
    } else {
      setTotalLimit(null);
    }
    console.log(`ManageStudents: Limit calculation effect. Profile: ${parentProfile ? 'Exists' : 'Null'}, Calculated Limit: ${totalLimit}`);
  }, [parentProfile]);

  // Log student state changes
  useEffect(() => {
    console.log("ManageStudents: Students state updated. New count:", students.length);
  }, [students]);


  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    if (totalLimit === null) {
        setAddError("Could not determine student limit. Please wait or refresh.");
        return;
    }
    if (students.length >= totalLimit) {
        setAddError(`Student limit (${totalLimit}) reached. Purchase more slots to add students.`);
        return;
    }

    setIsAdding(true);
    console.log("ManageStudents: handleAddStudent - Set isAdding=true");
    let token: string | null = null;

    try {
      console.log("ManageStudents: handleAddStudent - Getting session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error(sessionError?.message || 'Not authenticated');
      token = session.access_token;
      console.log("ManageStudents: handleAddStudent - Session obtained.");

      console.log("ManageStudents: handleAddStudent - Calling create-student API...");
      const response = await fetch('/api/parent/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ username: newUsername, password: newPassword, firstName: newFirstName, lastName: newLastName }),
      });
      console.log("ManageStudents: handleAddStudent - API call finished. Status:", response.status);
      const result = await response.json();
      if (!response.ok) {
        console.error("ManageStudents: handleAddStudent - API call failed:", result);
        if (result.error?.details && typeof result.error.details === 'object') {
            const fieldErrors = result.error.details;
            const firstFieldName = Object.keys(fieldErrors)[0];
            if (firstFieldName && Array.isArray(fieldErrors[firstFieldName]) && fieldErrors[firstFieldName].length > 0) {
                throw new Error(fieldErrors[firstFieldName][0]);
            }
        }
        const errorMessage = result.error?.message || result.message || `Failed to add student (${response.status})`;
        throw new Error(errorMessage);
      }
      console.log("ManageStudents: handleAddStudent - API call successful.");

      // Set success message and clear form
      setAddSuccess(result.message || 'Student added successfully!');
      setNewUsername(''); setNewPassword(''); setNewFirstName(''); setNewLastName('');
      setAddError(null);

      // Trigger a full refresh by incrementing refreshKey
      console.log("ManageStudents: handleAddStudent - Incrementing refreshKey...");
      setRefreshKey(prevKey => prevKey + 1);
      console.log("ManageStudents: handleAddStudent - refreshKey incremented.");


    } catch (err: any) {
      console.error("ManageStudents: handleAddStudent - Error caught:", err);
      setAddError(err.message || "An unknown error occurred while adding the student.");
      setAddSuccess(null);
      // Do NOT set isAdding false here, let finally handle it
    } finally {
      // Finally block ALWAYS runs, ensuring isAdding is reset
      console.log("ManageStudents: handleAddStudent - Finally block running.");
      setIsAdding(false); // Only set isAdding false here
      console.log("ManageStudents: handleAddStudent - Set isAdding=false in finally.");
    }
  };

  const canAddMoreStudents = totalLimit !== null && students.length < totalLimit;

  console.log(`ManageStudents: Rendering. isLoading=${isLoading}, fetchError=${fetchError}, totalLimit=${totalLimit}, students=${students.length}`);

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
             <h1 className="text-3xl md:text-4xl font-bold text-white">Manage Students</h1>
             {!isLoading && totalLimit !== null && (
               <div className="text-lg text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg shadow">
                 Students: {students.length} / {totalLimit}
               </div>
             )}
             {isLoading && <p className="text-gray-400 flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading...</p>}
          </div>

          <div className="mb-12 p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Add New Student</h2>
            {fetchError && !isLoading && ( // Show fetch error only when not loading
                 <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-md">
                     <AlertCircle className="inline h-4 w-4 mr-1"/> Error loading page data: {fetchError}
                 </div>
            )}
            {isLoading ? (
              <p className="text-gray-400 flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading form...</p>
            ) : fetchError ? (
                 <p className="text-red-400">Could not load necessary data. Please try refreshing.</p>
            ) : totalLimit === null ? (
                 <p className="text-yellow-400">Could not load plan details. Please refresh.</p>
            ) : canAddMoreStudents ? (
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
                     <label htmlFor="newUsername" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                     <Input id="newUsername" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required placeholder="Create a username" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                   </div>
                   <div>
                     <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                     <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Create a password (min. 6 chars)" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                   </div>
                 </div>
                 {addError && <p className="text-red-400 text-sm mt-2">{addError}</p>}
                 {addSuccess && <p className="text-green-400 text-sm mt-2">{addSuccess}</p>}
                 <Button type="submit" disabled={isAdding || (totalLimit !== null && !canAddMoreStudents)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50">
                   {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add Student"}
                 </Button>
                 {totalLimit !== null && !canAddMoreStudents && (
                     <Link href="/settings#billing" passHref>
                        <Button variant="outline" className="ml-4 bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white">
                          Purchase More Slots
                        </Button>
                     </Link>
                 )}
              </form>
            ) : ( // Limit reached
              <div className="text-center p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                <p className="text-yellow-200 mb-3">
                  You have reached your student limit ({totalLimit ?? 'N/A'}) for the '{parentProfile?.plan_type || 'current'}' plan.
                </p>
                <Link href="/settings#billing" passHref>
                   <Button variant="outline" className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white">
                     Purchase More Slots ($10/month per student)
                   </Button>
                </Link>
                 {addError && <p className="text-red-400 text-sm mt-2">{addError}</p>}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Students</h2>
            {isLoading ? (
                 <p className="text-gray-400 flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading students...</p>
            ) : !fetchError && students.length === 0 ? (
                 <p className="text-gray-400">You haven't added any students yet.</p>
            ) : !fetchError && students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900/50 border border-gray-700/30 rounded-lg">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Username</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Added On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-200">{student.username || '-'}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-200">{student.first_name} {student.last_name}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-400">{new Date(student.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null }
             {fetchError && ( // Display fetch error related to loading data
                  <p className="text-red-400 text-sm mt-4">Error loading page data: {fetchError}</p>
             )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
