-- Migration SQL for adding student management fields and policies

-- 1. Add username column (unique constraint)
-- Make sure this doesn't conflict with existing data if any profiles exist.
-- Consider adding error handling or conditional logic if needed.
ALTER TABLE public.profiles
ADD COLUMN username TEXT;

-- Add unique constraint separately to handle potential initial nulls if table wasn't empty
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_key UNIQUE (username);


-- Add index for faster username lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 2. Add created_by column (foreign key to auth.users)
ALTER TABLE public.profiles
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL; -- Set to NULL if creator is deleted

-- Add index for faster created_by lookups
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by);

-- 3. Update RLS Policies for profiles table

-- Drop existing policies first to avoid conflicts (adjust names based on your actual policies)
-- It's safer to drop and recreate than to alter complex policies.
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles; -- Example if you had a broad read policy

-- Recreate policies with new logic:

-- Allow users to read their own profile
CREATE POLICY "Allow users to read their own profile"
ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow parents/teachers to read profiles they created
CREATE POLICY "Allow creators to read profiles they created"
ON public.profiles
FOR SELECT USING (auth.uid() = created_by);

-- Allow users to insert their own profile (needed for the handle_new_user trigger)
-- The trigger runs as the user performing the signup.
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (e.g., first/last name, but NOT username or role directly here)
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND id = id); -- Redundant check, but emphasizes ownership

-- Allow parents/teachers to update profiles they created
-- Restrict columns they can update if necessary (e.g., allow updating first_name, last_name, maybe username, but not role)
CREATE POLICY "Allow creators to update profiles they created"
ON public.profiles
FOR UPDATE USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by); -- Check ensures they don't change created_by

-- Allow parents/teachers to delete profiles they created
CREATE POLICY "Allow creators to delete profiles they created"
ON public.profiles
FOR DELETE USING (auth.uid() = created_by);

-- Ensure RLS is enabled (should already be, but good practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add comments to explain the new columns
COMMENT ON COLUMN public.profiles.username IS 'Unique username for student accounts managed by parents/teachers.';
COMMENT ON COLUMN public.profiles.created_by IS 'The user ID (parent/teacher) who created this profile/student account.';


-- Add the simplified UPDATE policies here, after the column exists

-- Recreate the UPDATE policy for users updating their own profile
-- USING clause restricts which rows can be targeted.
-- WITH CHECK clause is removed; rely on API to send only allowed fields.
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id); -- User can only target their own row

-- Recreate the UPDATE policy for creators updating profiles they created
-- USING clause restricts which rows can be targeted.
-- WITH CHECK clause is removed; rely on API to send only allowed fields.
CREATE POLICY "Allow creators to update profiles they created"
ON public.profiles
FOR UPDATE
USING (auth.uid() = created_by); -- Creator can only target rows they created

-- Add comments for the UPDATE policies
COMMENT ON POLICY "Allow users to update their own profile" ON public.profiles IS 'Allows users to update their own profile row. API layer must control which fields are updatable.';
COMMENT ON POLICY "Allow creators to update profiles they created" ON public.profiles IS 'Allows teachers/parents to update profile rows they created. API layer must control which fields are updatable.';
