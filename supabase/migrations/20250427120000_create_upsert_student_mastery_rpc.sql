-- Migration SQL for creating the upsert_student_mastery RPC function

CREATE OR REPLACE FUNCTION public.upsert_student_mastery(
    p_student_id UUID,
    p_subject_id TEXT,
    p_new_score REAL
)
RETURNS VOID -- Or returns the updated row if needed
LANGUAGE plpgsql
SECURITY DEFINER -- Use definer security if called from backend with elevated privileges
-- SECURITY INVOKER -- Use invoker security if called directly by user (RLS applies)
SET search_path = public
AS $$
BEGIN
    -- Validate the score
    IF p_new_score < 0.0 OR p_new_score > 1.0 THEN
        RAISE EXCEPTION 'Mastery score must be between 0.0 and 1.0';
    END IF;

    INSERT INTO public.student_mastery (student_id, subject_id, mastery_score)
    VALUES (p_student_id, p_subject_id, p_new_score)
    ON CONFLICT (student_id, subject_id)
    DO UPDATE SET
        mastery_score = EXCLUDED.mastery_score,
        updated_at = now(); -- Trigger will also update this, but good practice
END;
$$;

COMMENT ON FUNCTION public.upsert_student_mastery(UUID, TEXT, REAL) IS 'Inserts or updates a student''s mastery score for a specific subject.';

-- Grant execute permission to authenticated users (if using SECURITY INVOKER)
-- GRANT EXECUTE ON FUNCTION public.upsert_student_mastery(UUID, TEXT, REAL) TO authenticated;

-- Grant execute permission to service_role (if using SECURITY DEFINER from backend)
GRANT EXECUTE ON FUNCTION public.upsert_student_mastery(UUID, TEXT, REAL) TO service_role;
