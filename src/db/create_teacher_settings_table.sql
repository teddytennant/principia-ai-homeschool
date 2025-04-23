-- Create Teacher Settings Table: Stores settings specific to teachers
CREATE TABLE IF NOT EXISTS teacher_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL, -- Flexible field for various teacher settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance optimization
CREATE INDEX IF NOT EXISTS idx_teacher_settings_teacher_id ON teacher_settings(teacher_id);

-- Row-Level Security (RLS) Policy for teacher_settings
-- Teachers can only view and update their own settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teacher_settings_access_policy' AND tablename = 'teacher_settings') THEN
        ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY teacher_settings_access_policy ON teacher_settings
            FOR ALL
            TO authenticated
            USING (auth.uid() = teacher_id)
            WITH CHECK (auth.uid() = teacher_id);
    END IF;
END
$$;

-- Comment for documentation
COMMENT ON TABLE teacher_settings IS 'Stores settings specific to teachers.';
