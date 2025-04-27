-- Migration: Add SELECT policy for profiles table

-- Ensure RLS is enabled (redundant if already enabled, but safe)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own profile data
-- Drop policy first if it potentially exists from previous attempts or manual setup
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;

-- Create the SELECT policy
CREATE POLICY "Allow authenticated users to read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id); -- User can only select their own row

COMMENT ON POLICY "Allow authenticated users to read their own profile" ON public.profiles IS 'Allows authenticated users to read all columns of their own profile.';
