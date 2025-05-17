-- Update the handle_new_user function to set default values for new columns

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
  -- Role is required, assume it's passed correctly in metadata
  user_role_value := (NEW.raw_user_meta_data->>'role')::user_role;
  first_name_value := NEW.raw_user_meta_data->>'first_name';
  last_name_value := NEW.raw_user_meta_data->>'last_name';
  username_value := NEW.raw_user_meta_data->>'username'; -- For student accounts
  creator_id_value := (NEW.raw_app_meta_data->>'creator_id')::UUID; -- For student accounts

  -- Insert a new row into public.profiles with defaults for new columns
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    username,
    created_by,
    -- Explicitly set defaults for subscription-related fields
    plan_type,
    extra_student_slots,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_subscription_status
  )
  VALUES (
    NEW.id,
    user_role_value,
    first_name_value,
    last_name_value,
    username_value,
    creator_id_value,
    -- Default values for new users
    'free', -- Default plan type
    0,      -- Default extra slots
    NULL,   -- Default Stripe customer ID
    NULL,   -- Default Stripe subscription ID
    NULL    -- Default Stripe subscription status
  )
  -- Handle potential conflicts if a profile somehow already exists
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Ensures profile entry is created for a new user, setting defaults for plan_type, extra_student_slots, and Stripe fields.';

-- Apply this migration using Supabase CLI or MCP tool.
