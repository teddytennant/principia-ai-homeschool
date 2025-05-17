-- Migration SQL for creating the student_mastery table

-- 1. Create the student_mastery table
CREATE TABLE public.student_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL, -- Represents the subject (e.g., 'math', 'science', 'general')
    mastery_score REAL NOT NULL DEFAULT 0.0 CHECK (mastery_score >= 0.0 AND mastery_score <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT student_subject_unique UNIQUE (student_id, subject_id) -- Ensure only one score per student per subject
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_mastery_student_id ON public.student_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_student_mastery_subject_id ON public.student_mastery(subject_id);

-- Add comments to explain the table and columns
COMMENT ON TABLE public.student_mastery IS 'Stores mastery scores for students across different subjects.';
COMMENT ON COLUMN public.student_mastery.student_id IS 'Foreign key referencing the student''s profile.';
COMMENT ON COLUMN public.student_mastery.subject_id IS 'Identifier for the subject (e.g., ''math'', ''history'').';
COMMENT ON COLUMN public.student_mastery.mastery_score IS 'Mastery score between 0.0 (beginner) and 1.0 (mastered).';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Allow students to read their own mastery scores
CREATE POLICY "Allow students to read their own mastery scores"
ON public.student_mastery
FOR SELECT USING (auth.uid() = student_id);

-- Allow parents/teachers to read/write mastery scores for students they created
-- This requires joining with the profiles table to check the created_by column
CREATE POLICY "Allow creators to manage mastery for their students"
ON public.student_mastery
FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = student_mastery.student_id AND p.created_by = auth.uid()
    )
)
WITH CHECK ( -- Ensure they can only insert/update for students they created
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = student_mastery.student_id AND p.created_by = auth.uid()
    )
);

-- Optional: Allow service_role to bypass RLS (useful for backend updates)
-- CREATE POLICY "Allow service_role full access"
-- ON public.student_mastery
-- FOR ALL USING (auth.role() = 'service_role');

-- 4. Create a trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_student_mastery_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_student_mastery_update
BEFORE UPDATE ON public.student_mastery
FOR EACH ROW
EXECUTE FUNCTION public.handle_student_mastery_update();
