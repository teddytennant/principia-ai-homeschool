'use client'; // Make it a client component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { User } from '@supabase/supabase-js'; // Import User type
// Consider adding a DropdownMenu from shadcn/ui for a better user menu later
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Optional: for user avatar

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Add state for role
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch profile to get role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error("Header: Error fetching user profile:", profileError.message);
          setUserRole(null); // Assume no specific role if profile fetch fails
        } else {
          setUserRole(profile?.role || null);
        }
      } else {
        setUserRole(null); // No user, no role
      }
      setLoading(false);
    };

    fetchUserAndProfile();

    // Listen for auth changes and refetch profile if needed
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
         const { data: profile, error: profileError } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', currentUser.id)
           .single();
         setUserRole(profile?.role || null);
      } else {
         setUserRole(null);
      }
      // Consider setting loading state here as well if needed
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); // Immediately update state
    router.push('/'); // Redirect to home page after sign out
    router.refresh(); // Ensure layout re-renders correctly
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        {/* Left side: Logo/Title */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Placeholder for Logo */}
            <span className="font-bold sm:inline-block">Principia AI</span>
          </Link>
          {/* Optional: Add main navigation links here if needed */}
        </div>

        {/* Right side: Conditional Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-gray-700"></div> // Placeholder while loading
          ) : user ? (
            // User is logged in - Show relevant links based on role
            <>
              {/* Common Settings link for all logged-in users */}
              <Link href="/settings">
                <Button variant="ghost" size="sm">Account Settings</Button>
              </Link>
              {/* Teacher-specific links */}
              {userRole === 'teacher' && (
                <Link href="/teacher/dashboard"> {/* Link to main teacher dashboard */}
                  <Button variant="ghost" size="sm">Teacher Dashboard</Button>
                </Link>
              )}
              {/* Add other role-specific links if needed */}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
              {/* Example using DropdownMenu (requires installation/setup)
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              */}
            </>
          ) : (
            // User is logged out - Show Sign In/Sign Up
            <>
              <Link href="/signin/student">
                <Button variant="secondary" size="sm">Student Sign In</Button>
              </Link>
              <Link href="/signin/teacher">
                <Button variant="secondary" size="sm">Parent Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
