-- Function to increment daily message count and check limit
CREATE OR REPLACE FUNCTION public.increment_daily_message_count(
    p_user_id uuid,
    p_date date,
    p_limit integer
)
RETURNS integer -- Returns the new count after incrementing
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to bypass RLS if needed
AS $$
DECLARE
    v_current_count integer;
BEGIN
    -- Upsert the row for the user and date, incrementing the count
    INSERT INTO public.daily_message_counts (user_id, date, count)
    VALUES (p_user_id, p_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET count = daily_message_counts.count + 1
    RETURNING count INTO v_current_count;

    -- Return the count *after* the potential increment
    RETURN v_current_count;
END;
$$;

-- Grant execute permission to the authenticated role (or anon if needed, depending on your setup)
-- If your API uses the service_role key, this might not be strictly necessary,
-- but it's good practice if you might call it from other contexts.
GRANT EXECUTE ON FUNCTION public.increment_daily_message_count(uuid, date, integer) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.increment_daily_message_count(uuid, date, integer) TO service_role; -- Or grant to service_role if preferred

COMMENT ON FUNCTION public.increment_daily_message_count(uuid, date, integer) IS 'Atomically increments the message count for a user on a specific date and returns the new count. Used for rate limiting.';
