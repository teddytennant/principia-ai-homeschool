-- Function to create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Necessary to access auth.users and public.profiles
SET search_path = public
AS $$
BEGIN
  -- Insert a new row into public.profiles
  -- It uses the id and email from the newly created auth.users record
  -- It retrieves role, first_name, and last_name from the raw_user_meta_data JSON field
  INSERT INTO public.profiles (id, role, first_name, last_name, profile_data, preferences)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::user_role, -- Cast role from metadata to user_role enum
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    '{}'::jsonb, -- Initialize profile_data as empty JSONB
    '{}'::jsonb  -- Initialize preferences as empty JSONB
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile entry for a newly signed up user.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a user signs up, automatically create a profile for them.';
