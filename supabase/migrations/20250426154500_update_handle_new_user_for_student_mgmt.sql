-- Update the handle_new_user function to support student creation by teachers
-- It now attempts to read 'username' from raw_user_meta_data
-- and 'creator_id' (teacher's user ID) from raw_app_meta_data

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
  first_name_value TEXT;
  last_name_value TEXT;
  username_value TEXT;
  creator_id_value UUID;
BEGIN
  -- Extract values from metadata, providing defaults or handling NULLs
  user_role_value := (NEW.raw_user_meta_data->>'role')::user_role; -- Role is required
  first_name_value := NEW.raw_user_meta_data->>'first_name';
  last_name_value := NEW.raw_user_meta_data->>'last_name';
  username_value := NEW.raw_user_meta_data->>'username'; -- For student accounts
  creator_id_value := (NEW.raw_app_meta_data->>'creator_id')::UUID; -- For student accounts, creator is the teacher

  -- Insert a new row into public.profiles
  INSERT INTO public.profiles (id, role, first_name, last_name, username, created_by)
  VALUES (
    NEW.id,
    user_role_value,
    first_name_value,
    last_name_value,
    username_value, -- Will be NULL for self-signed up teachers/users
    creator_id_value -- Will be NULL for self-signed up users
  )
  -- Handle potential conflicts if a profile somehow already exists
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Ensures profile entry is created for a new user, including username and created_by if provided in metadata (for teacher-created students).';

-- Note: We are NOT recreating the trigger here, only updating the function it calls.
-- Apply this migration using Supabase CLI: supabase db push (or apply manually)
