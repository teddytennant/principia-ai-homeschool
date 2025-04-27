-- Add Stripe customer and subscription IDs to the profiles table

ALTER TABLE public.profiles
ADD COLUMN stripe_customer_id TEXT UNIQUE, -- Store Stripe Customer ID, ensure uniqueness
ADD COLUMN stripe_subscription_id TEXT UNIQUE, -- Store Stripe Subscription ID, ensure uniqueness
ADD COLUMN stripe_subscription_status TEXT; -- Store subscription status (e.g., 'active', 'canceled', 'past_due')

-- Add indexes for faster lookups on Stripe IDs (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stores the Stripe Customer ID associated with this user.';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stores the Stripe Subscription ID associated with this user''s active subscription.';
COMMENT ON COLUMN public.profiles.stripe_subscription_status IS 'Stores the current status of the user''s Stripe subscription.';

-- Note: You might need to update RLS policies if these columns need specific access controls.
-- The existing policies likely allow users to update their own profile, which might
-- inadvertently allow them to modify these IDs. Consider restricting updates to these columns
-- via specific policies or handling updates only through secure backend functions/webhooks.
