'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link'; // Import Link component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js'; // Import User type

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  stripe_subscription_id: string | null; // Add Stripe fields
  stripe_subscription_status: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null); // Includes Stripe status now
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCancelingSub, setIsCancelingSub] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updateProfileError, setUpdateProfileError] = useState<string | null>(null);
  const [updateProfileSuccess, setUpdateProfileSuccess] = useState<string | null>(null);
  const [cancelSubError, setCancelSubError] = useState<string | null>(null);
  const [cancelSubSuccess, setCancelSubSuccess] = useState<string | null>(null);
  // State for password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  // State for email change (Reverted - Temporarily commented out)
  // const [newEmail, setNewEmail] = useState('');
  // const [isChangingEmail, setIsChangingEmail] = useState(false);
  // const [changeEmailError, setChangeEmailError] = useState<string | null>(null);
  // const [changeEmailSuccess, setChangeEmailSuccess] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error(sessionError?.message || 'Not authenticated');
        }
        setUser(session.user);

        // Fetch profile data including Stripe status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, stripe_subscription_id, stripe_subscription_status') // Fetch Stripe fields
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          // Handle case where profile might not exist yet (though trigger should create it)
          if (profileError.code === 'PGRST116') { // code for "Resource Not Found"
             console.warn("Profile not found for user, might be newly created.");
             setProfile(null); // Or set default empty profile
             setFirstName('');
             setLastName('');
          } else {
            throw profileError;
          }
        } else if (profileData) {
          setProfile(profileData); // Store full profile including status
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
        } else {
           // This case might occur if RLS prevents row access but doesn't throw an error,
           // or if the profile truly doesn't exist and the trigger failed.
           // Logged a warning previously, now just setting defaults.
           setProfile(null);
           setFirstName('');
           setLastName('');
        }
      } catch (err: any) {
        // More detailed error logging
        console.error("Error fetching user session or profile:", err);
        let detailedMessage = "Failed to load user data.";
        if (err.message) {
            detailedMessage += ` Error: ${err.message}`;
        }
        // Add details if it's a Supabase error object
        if (typeof err === 'object' && err !== null && 'details' in err) {
            detailedMessage += ` Details: ${err.details}`;
        }
         if (typeof err === 'object' && err !== null && 'hint' in err) {
            detailedMessage += ` Hint: ${err.hint}`;
        }
        setFetchError(detailedMessage);
      } finally {
        setIsLoading(false); // Ensure loading is always set to false
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setUpdateProfileError(null);
    setUpdateProfileSuccess(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'Not authenticated');
      }
      const token = session.access_token;

      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
         // Throw an error object compatible with the parsing logic below
         throw new Error(JSON.stringify(result));
      }

      setUpdateProfileSuccess(result.message || 'Profile updated successfully!');
      if (profile) {
        setProfile({ ...profile, first_name: firstName, last_name: lastName });
      }

    } catch (err: any) {
      console.error("Update profile error:", err);
      // Check for structured Zod errors or other API errors
      if (err.message && typeof err.message === 'string' && err.message.startsWith('{')) {
         try {
            const parsedError = JSON.parse(err.message);
            if (parsedError.error?.details) {
               const errorMessages = Object.entries(parsedError.error.details)
                 .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                 .join('; ');
               setUpdateProfileError(`Invalid input: ${errorMessages}`);
            } else if (parsedError.error?.message) {
                 setUpdateProfileError(parsedError.error.message);
            } else {
                 setUpdateProfileError("An unknown error occurred while updating profile.");
            }
         } catch (parseError) {
             setUpdateProfileError(err.message || "An unknown error occurred while updating profile.");
         }
      } else {
          setUpdateProfileError(err.message || "An unknown error occurred while updating profile.");
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handler for Subscription Cancellation
  const handleCancelSubscription = async () => {
    if (!profile?.stripe_subscription_id || profile.stripe_subscription_status !== 'active') {
      setCancelSubError("No active subscription found to cancel.");
      return;
    }

    // Optional: Add a confirmation dialog here
    // if (!confirm("Are you sure you want to cancel your subscription? Access will remain until the end of the current billing period.")) {
    //   return;
    // }

    setIsCancelingSub(true);
    setCancelSubError(null);
    setCancelSubSuccess(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'Not authenticated');
      }
      const token = session.access_token;

      const response = await fetch('/api/user/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const result = await response.json();

      if (!response.ok) {
         // Throw an error object compatible with the parsing logic below
         throw new Error(JSON.stringify(result));
      }

      setCancelSubSuccess(result.message || 'Subscription cancelled successfully!');
      if (profile) {
        setProfile({ ...profile, stripe_subscription_status: 'canceled' });
      }

    } catch (err: any) {
      console.error("Cancel subscription error:", err);
       if (err.message && typeof err.message === 'string' && err.message.startsWith('{')) {
           try {
               const parsedError = JSON.parse(err.message);
               setCancelSubError(parsedError.error?.message || "An unknown error occurred during cancellation.");
           } catch (parseError) {
                setCancelSubError(err.message || "An unknown error occurred during cancellation.");
           }
       } else {
            setCancelSubError(err.message || "An unknown error occurred during cancellation.");
       }
    } finally {
      setIsCancelingSub(false);
    }
  };

  // Handler for Password Change
  const handleChangePassword = async (e: FormEvent) => {
      e.preventDefault();
      setIsChangingPassword(true);
      setChangePasswordError(null);
      setChangePasswordSuccess(null);

      if (newPassword.length < 6) {
        setChangePasswordError('Password must be at least 6 characters long.');
        setIsChangingPassword(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setChangePasswordError('Passwords do not match.');
        setIsChangingPassword(false);
        return;
      }

      try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            throw new Error(sessionError?.message || 'Not authenticated');
          }
          const token = session.access_token;

          const response = await fetch('/api/user/change-password', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ newPassword: newPassword }),
          });

          const result = await response.json();

          if (!response.ok) {
              // Throw an error object compatible with the parsing logic below
              throw new Error(JSON.stringify(result));
          }

          setChangePasswordSuccess(result.message || 'Password updated successfully!');
          setNewPassword('');
          setConfirmNewPassword('');
          // Optionally clear success message after delay
          setTimeout(() => setChangePasswordSuccess(null), 3000);

      } catch (err: any) {
          console.error("Change password error:", err);
          if (err.message && typeof err.message === 'string' && err.message.startsWith('{')) {
              try {
                  const parsedError = JSON.parse(err.message);
                  setChangePasswordError(parsedError.error?.message || "An unknown error occurred while changing password.");
              } catch (parseError) {
                   setChangePasswordError(err.message || "An unknown error occurred while changing password.");
              }
          } else {
               setChangePasswordError(err.message || "An unknown error occurred while changing password.");
          }
      } finally {
          setIsChangingPassword(false);
      }
  };

   // Handler for Email Change (Reverted - Temporarily commented out)
   /*
   const handleEmailChange = async (e: FormEvent) => {
       e.preventDefault();
       setIsChangingEmail(true);
       setChangeEmailError(null);
       setChangeEmailSuccess(null);

       if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
           setChangeEmailError('Please enter a valid email address.');
           setIsChangingEmail(false);
           return;
       }
       // Add null check for user before accessing email
       if (user && newEmail === user.email) {
           setChangeEmailError('New email cannot be the same as the current email.');
           setIsChangingEmail(false);
           return;
       }

       try {
           const { data: { session }, error: sessionError } = await supabase.auth.getSession();
           if (sessionError || !session) {
               throw new Error(sessionError?.message || 'Not authenticated');
           }
           const token = session.access_token;

           const response = await fetch('/api/user/change-email', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({ newEmail: newEmail }),
           });

           const result = await response.json();

           if (!response.ok) {
               // Use the error message from the API response if available
               throw new Error(result.error?.message || JSON.stringify(result));
           }

           setChangeEmailSuccess(result.message || 'Confirmation email sent to the new address. Please check your inbox.');
           setNewEmail(''); // Clear input field
           // Optionally clear success message after delay
           setTimeout(() => setChangeEmailSuccess(null), 5000);

       } catch (err: any) {
           console.error("Change email error:", err);
           // Try to parse JSON error first
           let errorMessage = "An unknown error occurred while changing email.";
           try {
               const parsedError = JSON.parse(err.message);
               errorMessage = parsedError.error?.message || parsedError.message || errorMessage;
           } catch (parseError) {
               // If parsing fails, use the original message if it exists
               errorMessage = err.message || errorMessage;
           }
           setChangeEmailError(errorMessage);
       } finally {
           setIsChangingEmail(false);
       }
   };
   */


  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Account Settings</h1>

          {isLoading && <p className="text-gray-400">Loading settings...</p>}
          {fetchError && <p className="text-red-400">Error: {fetchError}</p>}

          {!isLoading && !fetchError && user && (
            <div className="space-y-12">
              {/* Profile Information Section */}
              <div className="p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-4">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <Input id="email" type="email" value={user.email || ''} disabled className="w-full bg-gray-800 border-gray-700 text-gray-400 rounded-md py-2 px-3 cursor-not-allowed" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                      <Input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Your First Name" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                      <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Your Last Name" className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3" />
                    </div>
                  </div>
                  {updateProfileError && <p className="text-red-400 text-sm">{updateProfileError}</p>}
                  {updateProfileSuccess && <p className="text-green-400 text-sm">{updateProfileSuccess}</p>}
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50">
                    {isUpdatingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </div>

              {/* Password Change Section */}
              <div className="p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-4">Change Password</h2>
                 <p className="text-sm text-gray-400 mb-4">Enter a new password for your account. You might be asked to sign in again after changing your password.</p>
                 <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Enter new password (min. 6 chars)"
                          className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3"
                          autoComplete="new-password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                          placeholder="Confirm new password"
                          className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3"
                          autoComplete="new-password"
                        />
                    </div>
                    {changePasswordError && <p className="text-red-400 text-sm">{changePasswordError}</p>}
                    {changePasswordSuccess && <p className="text-green-400 text-sm">{changePasswordSuccess}</p>}
                    <Button type="submit" disabled={isChangingPassword} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50">
                        {isChangingPassword ? "Updating..." : "Update Password"}
                    </Button>
                 </form>
              </div>

               {/* Email Change Section (Reverted - Temporarily commented out) */}
               {/*
               <div className="p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">
                 <h2 className="text-2xl font-semibold text-white mb-4">Change Email Address</h2>
                 <p className="text-sm text-gray-400 mb-4">
                   Current Email: <span className="font-medium">{user?.email}</span>
                 </p>
                 <p className="text-sm text-gray-400 mb-4">
                   Enter the new email address you want to use. A confirmation link will be sent to both your old and new email addresses.
                 </p>
                 <form onSubmit={handleEmailChange} className="space-y-4">
                     <div>
                         <label htmlFor="newEmail" className="block text-sm font-medium text-gray-300 mb-1">New Email Address</label>
                         <Input
                           id="newEmail"
                           type="email"
                           value={newEmail}
                           onChange={(e) => setNewEmail(e.target.value)}
                           required
                           placeholder="Enter new email address"
                           className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3"
                           autoComplete="email"
                         />
                     </div>
                     {changeEmailError && <p className="text-red-400 text-sm">{changeEmailError}</p>}
                     {changeEmailSuccess && <p className="text-green-400 text-sm">{changeEmailSuccess}</p>}
                     <Button type="submit" disabled={isChangingEmail || !user} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50">
                         {isChangingEmail ? "Sending..." : "Change Email"}
                     </Button>
                 </form>
               </div>
               */}


              {/* Subscription Management Section */}
              <div className="p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-4">Subscription</h2>
                {profile?.stripe_subscription_id ? (
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      Status: <span className={`font-medium ${
                        profile.stripe_subscription_status === 'active' ? 'text-green-400' :
                        profile.stripe_subscription_status === 'canceled' ? 'text-yellow-400' :
                        'text-red-400' // e.g., past_due
                      }`}>
                        {profile.stripe_subscription_status ? profile.stripe_subscription_status.charAt(0).toUpperCase() + profile.stripe_subscription_status.slice(1) : 'Unknown'}
                      </span>
                    </p>
                    {profile.stripe_subscription_status === 'active' && (
                      <div>
                        <Button
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={isCancelingSub}
                        >
                          {isCancelingSub ? "Canceling..." : "Cancel Subscription"}
                        </Button>
                        {cancelSubError && <p className="text-red-400 text-sm mt-2">{cancelSubError}</p>}
                        {cancelSubSuccess && <p className="text-green-400 text-sm mt-2">{cancelSubSuccess}</p>}
                        <p className="text-xs text-gray-500 mt-2">Cancellation is effective at the end of the current billing period.</p>
                      </div>
                    )}
                     {profile.stripe_subscription_status === 'canceled' && (
                       <p className="text-sm text-gray-400">Your subscription has been canceled. Access will continue until the end of the current billing period.</p>
                     )}
                     {/* Add logic here to handle other statuses like 'past_due' or offer reactivation */}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400">You do not have an active subscription.</p>
                    <Link href="/pricing">
                       <Button variant="link" className="text-indigo-400 px-0">View Pricing Plans</Button>
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
