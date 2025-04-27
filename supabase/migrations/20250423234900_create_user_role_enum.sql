-- Create the user_role enum type if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('teacher', 'student');
        COMMENT ON TYPE public.user_role IS 'Defines the possible roles for users in the system.';
    END IF;
END
$$;
