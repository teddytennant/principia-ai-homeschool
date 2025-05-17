-- Add plan type and extra student slots to profiles table

ALTER TABLE public.profiles
ADD COLUMN plan_type TEXT,
ADD COLUMN extra_student_slots INTEGER NOT NULL DEFAULT 0;

-- Add indexes for potential lookups (optional but can be helpful)
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON public.profiles(plan_type);

-- Add comments to explain the new columns
COMMENT ON COLUMN public.profiles.plan_type IS 'Identifier for the user''s subscription plan (e.g., ''family'', ''co-op'', ''free'').';
COMMENT ON COLUMN public.profiles.extra_student_slots IS 'Number of additional student slots purchased beyond the base plan limit.';

-- Note: RLS policies might need adjustment if users/triggers need to interact
-- with these columns directly. For now, assuming backend/webhooks manage these.
