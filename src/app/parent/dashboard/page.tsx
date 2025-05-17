"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CurriculumUploader } from '@/components/parent/CurriculumUploader';
import { StudentActivityMonitor } from '@/components/parent/StudentActivityMonitor';
import { SubjectSettings } from '@/components/parent/SubjectSettings';
import { BookOpen, Users, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { AuthGuard } from '@/app/chat/AuthGuard';
import { supabase } from '@/lib/supabaseClient';

interface ProfileData {
  stripe_subscription_status: string | null;
  // Add role if needed for display, though middleware handles access control
  role?: string | null;
}

export default function ParentDashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); // More specific error state
  const [isActivating, setIsActivating] = useState(false); // State for showing "Activating..." message
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollAttempts = 10; // Limit polling attempts
  const pollAttemptCount = useRef(0);

  const fetchProfile = async (isRetry = false): Promise<ProfileData | null> => {
    if (!isRetry) {
      console.log("Dashboard: Initial profile fetch...");
      setFetchError(null); // Clear previous errors on initial fetch
    } else {
      console.log(`Dashboard: Polling attempt ${pollAttemptCount.current + 1}...`);
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error(sessionError?.message || 'Not authenticated');
      const token = session.access_token;

      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Dashboard: Profile fetch ${isRetry ? 'retry' : 'initial'} returned 404.`);
          // Don't set fetchError here during polling, just return null
          if (!isRetry) {
              // Set a specific state to indicate activation might be needed
              setIsActivating(true);
          }
          return null;
        }
        // Handle other errors
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to fetch profile (${response.status})`);
      }

      const data: ProfileData = await response.json();
      console.log("Dashboard: Profile fetched:", data);
      setProfile(data); // Update state
      setFetchError(null); // Clear any previous error on success
      setIsActivating(false); // Stop showing activating message if profile found
      return data;

    } catch (err: any) {
      console.error("Dashboard: Error fetching profile:", err);
      if (!isRetry) {
        setFetchError(err.message || "Could not load profile data.");
        setProfile(null); // Clear profile on initial error
        setIsActivating(false); // Stop showing activating message on error
      }
      // Don't update state during polling errors, just log and let it retry
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    setIsLoadingProfile(true);
    fetchProfile().finally(() => setIsLoadingProfile(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling logic
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) return; // Prevent multiple intervals
      console.log("Dashboard: Starting polling for active subscription...");
      setIsActivating(true); // Show activating message
      pollAttemptCount.current = 0; // Reset attempt count

      pollingIntervalRef.current = setInterval(async () => {
        pollAttemptCount.current++;
        console.log(`Dashboard: Polling attempt ${pollAttemptCount.current}`);
        const updatedProfile = await fetchProfile(true); // Indicate it's a retry

        if (updatedProfile?.stripe_subscription_status === 'active') {
          console.log("Dashboard: Subscription activated! Stopping polling.");
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsActivating(false); // Hide activating message
          // Profile state is updated within fetchProfile
        } else if (pollAttemptCount.current >= maxPollAttempts) {
            console.warn(`Dashboard: Max polling attempts (${maxPollAttempts}) reached. Stopping polling.`);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            setIsActivating(false);
            // Set an error if profile still not found or inactive
            if (!profile) {
                setFetchError("Failed to activate subscription after multiple checks. Please contact support if payment was successful.");
            } else {
                 // Profile exists but isn't active - this shouldn't happen if verify API worked
                 setFetchError("Subscription status issue. Please contact support.");
            }
        } else {
            console.log("Dashboard: Still waiting for active status...");
        }
      }, 3000); // Poll every 3 seconds
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        console.log("Dashboard: Stopping polling.");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsActivating(false);
      }
    };

    // Only start polling if loading is finished and status is not active
    if (!isLoadingProfile && (!profile || profile.stripe_subscription_status !== 'active')) {
        // Don't start polling if there was a non-404 error during initial load
        if (!fetchError) {
            startPolling();
        }
    } else if (profile && profile.stripe_subscription_status === 'active') {
        stopPolling(); // Ensure polling stops if status becomes active
    }

    // Cleanup interval on unmount
    return stopPolling;
  }, [profile, isLoadingProfile, fetchError]); // Dependencies


  const renderContent = () => {
    if (isLoadingProfile) {
      return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /> <span className="ml-2 text-gray-500">Loading dashboard...</span></div>;
    }

    if (fetchError) {
        return (
            <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 p-4 rounded-md">
                <AlertCircle className="inline-block h-5 w-5 mr-2" />
                {fetchError}
            </div>
        );
    }

    if (isActivating) {
       return (
         <div className="flex flex-col justify-center items-center min-h-[50vh] text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Activating your subscription...</p>
            <p className="text-gray-500 dark:text-gray-400">Please wait a moment. This page will update automatically once confirmed.</p>
         </div>
       );
    }

    // This should only render if profile exists and status is active
    if (profile && profile.stripe_subscription_status === 'active') {
      return (
        <>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
          <hr className="border-gray-200 dark:border-gray-800 mb-8" />
          <Tabs defaultValue="curriculum" className="w-full">
             <TabsList className="flex flex-wrap mb-8 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-700 rounded-xl overflow-hidden shadow-lg">
               <TabsTrigger value="curriculum" className="flex items-center gap-2 px-6 py-3 text-base md:text-lg font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-indigo-700 dark:data-[state=inactive]:text-indigo-200 flex-grow justify-center">
                 <BookOpen className="h-5 w-5" />
                 <span>Curriculum & Settings</span>
               </TabsTrigger>
               <TabsTrigger value="activity" className="flex items-center gap-2 px-6 py-3 text-base md:text-lg font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-indigo-700 dark:data-[state=inactive]:text-indigo-200 flex-grow justify-center">
                 <Users className="h-5 w-5" />
                 <span>Student Activity</span>
               </TabsTrigger>
               <TabsTrigger value="manageStudents" asChild className="flex items-center gap-2 px-6 py-3 text-base md:text-lg font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-indigo-700 dark:data-[state=inactive]:text-indigo-200 flex-grow justify-center">
                  <Link href="/parent/students">
                     <UserPlus className="h-5 w-5" />
                     <span>Manage Students</span>
                  </Link>
               </TabsTrigger>
             </TabsList>

             <TabsContent value="curriculum" className="space-y-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                   <SubjectSettings />
                 </div>
                 <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                   <CurriculumUploader />
                 </div>
               </div>
             </TabsContent>

             <TabsContent value="activity" className="space-y-8">
               <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                 <StudentActivityMonitor />
               </div>
             </TabsContent>
           </Tabs>
        </>
      );
    }

    // Fallback if logic somehow fails
    return <div className="text-center text-gray-500">Loading dashboard content...</div>;
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <header className="w-full flex flex-row items-center justify-between py-4 px-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Principia AI</span>
        </header>
        <main className="flex flex-col min-h-[80vh] w-full px-2 md:px-8 py-10 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900 dark:to-gray-950 transition-all duration-300">
          {renderContent()}
        </main>
      </DashboardLayout>
    </AuthGuard>
  );
}
