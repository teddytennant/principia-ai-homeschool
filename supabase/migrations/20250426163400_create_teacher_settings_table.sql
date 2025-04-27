-- Migration to create the teacher_settings table

-- Create the table to store settings specific to each teacher
CREATE TABLE public.teacher_settings (
    teacher_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to the teacher user, cascade delete if teacher is deleted
    settings JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store settings as a JSONB object, default to empty
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.teacher_settings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE public.teacher_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow teachers to manage their own settings

-- Allow teachers to read their own settings
CREATE POLICY "Allow teachers to read their own settings"
ON public.teacher_settings
FOR SELECT
USING (auth.uid() = teacher_id);

-- Allow teachers to insert their own settings (if not already existing)
CREATE POLICY "Allow teachers to insert their own settings"
ON public.teacher_settings
FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

-- Allow teachers to update their own settings
CREATE POLICY "Allow teachers to update their own settings"
ON public.teacher_settings
FOR UPDATE
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

-- Note: Deletion might not be needed or desired for settings. If needed, add a DELETE policy.
-- CREATE POLICY "Allow teachers to delete their own settings"
-- ON public.teacher_settings
-- FOR DELETE
-- USING (auth.uid() = teacher_id);

-- Add comments for clarity
COMMENT ON TABLE public.teacher_settings IS 'Stores customizable settings for teacher accounts.';
COMMENT ON COLUMN public.teacher_settings.teacher_id IS 'Foreign key referencing the teacher user in auth.users.';
COMMENT ON COLUMN public.teacher_settings.settings IS 'JSONB column containing various teacher-specific settings (e.g., AI behavior, curriculum links, subject preferences).';
