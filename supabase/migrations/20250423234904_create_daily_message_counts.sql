-- Create table to track daily message counts per user
CREATE TABLE public.daily_message_counts (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL DEFAULT CURRENT_DATE,
    count integer NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Add comment for clarity
COMMENT ON TABLE public.daily_message_counts IS 'Tracks the number of chat messages sent by each user per day for rate limiting.';

-- Optional: Add index for potential queries on date alone
CREATE INDEX idx_daily_message_counts_date ON public.daily_message_counts(date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_message_counts ENABLE ROW LEVEL SECURITY;

-- Policies for RLS:
-- Allow users to see their own counts (optional, might not be needed by app)
CREATE POLICY "Allow users to select own counts"
ON public.daily_message_counts
FOR SELECT
USING (auth.uid() = user_id);

-- Allow server-side operations (e.g., API route) to manage counts
-- Note: This assumes your Supabase client uses the service_role key or a role with appropriate permissions.
-- If using anon key + RLS bypass via SECURITY DEFINER functions, adjust accordingly.
CREATE POLICY "Allow service role full access"
ON public.daily_message_counts
FOR ALL
USING (true); -- Or specify a role: USING (auth.role() = 'service_role')
