-- Update the function to correctly handle profile creation on signup
-- Removes insertion into non-existent 'profile_data' and 'preferences' columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a new row into public.profiles, only including required columns
  -- Uses the id from the newly created auth.users record
  -- Retrieves role, first_name, and last_name from the raw_user_meta_data JSON field
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::user_role, -- Cast role from metadata to user_role enum
    NEW.raw_user_meta_data->>'first_name',        -- Get first_name from metadata
    NEW.raw_user_meta_data->>'last_name'         -- Get last_name from metadata
  )
  -- Handle potential conflicts if a profile somehow already exists
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Ensures profile entry with required fields (id, role, first_name, last_name) is created for a newly signed up user.';

-- Note: We are NOT recreating the trigger here, only updating the function it calls.
