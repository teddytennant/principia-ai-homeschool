-- Principia AI Platform SQL Schema for Supabase
-- This script defines the complete database structure for the Principia AI platform,
-- integrating with Supabase Auth for user management and streamlining profile setup.

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for user roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('teacher', 'student');
    END IF;
END
$$;

-- Enum for relationship status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_status') THEN
        CREATE TYPE relationship_status AS ENUM ('pending', 'active', 'inactive');
    END IF;
END
$$;

-- Profiles Table: Stores role and additional metadata for users, linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_data JSONB, -- Flexible field for role-specific data (e.g., subject_areas for teachers, grade_level for students)
                        -- Note: Ensure application-level validation for JSONB data to prevent errors or security issues from malformed data.
    preferences JSONB, -- User preferences like notifications or settings
                       -- Note: Validate JSONB structure in the application to ensure data integrity.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher-Student Relationships Table: Manages connections between teachers and students
CREATE TABLE IF NOT EXISTS teacher_student_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status relationship_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (teacher_id, student_id)
);

-- Chat Sessions Table: Manages conversations for easier retrieval of chat history
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (teacher_id, student_id)
);

-- Chat History Table: Stores messages exchanged between users
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Curriculum Table: Stores curriculum content uploaded by teachers
CREATE TABLE IF NOT EXISTS curriculum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT, -- Reference to file in Supabase Storage
    subject TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Activity Table: Tracks student activity for monitoring by teachers
CREATE TABLE IF NOT EXISTS student_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- e.g., 'login', 'assignment_submission', etc.
    activity_details JSONB, -- Additional data about the activity
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- For visibility to specific teacher
);

-- Student Name Mapping Table: Dedicated table to map student IDs to names
-- Note: This table may be redundant since 'profiles' already contains 'first_name' and 'last_name'.
-- Consider removing this table if not strictly necessary, or ensure synchronization with 'profiles' to prevent data inconsistency.
-- If you encounter errors, ensure the 'profiles' table exists before running this part of the script.
CREATE TABLE IF NOT EXISTS student_name_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table: General table for user-specific settings or preferences
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL, -- Flexible field for various settings
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_teacher_student_teacher_id ON teacher_student_relationships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_name_mapping_student_id ON student_name_mapping(student_id);

-- Row-Level Security (RLS) Policies for student_name_mapping
-- Teachers can view mappings of their students, students can view their own mapping
-- Note: Ensure that 'teacher_student_relationships' table exists before enabling RLS.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'teacher_student_relationships') THEN
        ALTER TABLE student_name_mapping ENABLE ROW LEVEL SECURITY;

        CREATE POLICY student_name_mapping_student_access_policy ON student_name_mapping
            FOR SELECT
            TO authenticated
            USING (auth.uid() = student_id);

        CREATE POLICY student_name_mapping_teacher_access_policy ON student_name_mapping
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1
                    FROM teacher_student_relationships
                    WHERE teacher_id = auth.uid()
                    AND student_id = student_name_mapping.student_id
                    AND status = 'active'
                )
            );
    END IF;
END
$$;
CREATE INDEX IF NOT EXISTS idx_teacher_student_student_id ON teacher_student_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_sender_id ON chat_history(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_receiver_id ON chat_history(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_student_id ON student_activity(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_timestamp ON student_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_curriculum_teacher_id ON curriculum(teacher_id);

-- Row-Level Security (RLS) Policies
-- Profile Table: Users can only view and update their own profile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profile_access_policy' AND tablename = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY profile_access_policy ON profiles
            FOR ALL
            TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Teacher-Student Relationships Table: Access based on relationship
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teacher_student_relationship_access_policy' AND tablename = 'teacher_student_relationships') THEN
        ALTER TABLE teacher_student_relationships ENABLE ROW LEVEL SECURITY;
        CREATE POLICY teacher_student_relationship_access_policy ON teacher_student_relationships
            FOR ALL
            TO authenticated
            USING (auth.uid() = teacher_id OR auth.uid() = student_id)
            WITH CHECK (auth.uid() = teacher_id OR auth.uid() = student_id);
    END IF;
END
$$;

-- Chat Sessions Table: Access based on participation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_sessions_access_policy' AND tablename = 'chat_sessions') THEN
        ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY chat_sessions_access_policy ON chat_sessions
            FOR ALL
            TO authenticated
            USING (auth.uid() = teacher_id OR auth.uid() = student_id)
            WITH CHECK (auth.uid() = teacher_id OR auth.uid() = student_id);
    END IF;
END
$$;

-- Chat History Table: Access based on participation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_history_access_policy' AND tablename = 'chat_history') THEN
        ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
        CREATE POLICY chat_history_access_policy ON chat_history
            FOR ALL
            TO authenticated
            USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
            WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);
    END IF;
END
$$;

-- Curriculum Table: Teachers can manage their own, students can view based on relationship
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'curriculum_teacher_access_policy' AND tablename = 'curriculum') THEN
        ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
        CREATE POLICY curriculum_teacher_access_policy ON curriculum
            FOR ALL
            TO authenticated
            USING (auth.uid() = teacher_id)
            WITH CHECK (auth.uid() = teacher_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'curriculum_student_access_policy' AND tablename = 'curriculum') THEN
        CREATE POLICY curriculum_student_access_policy ON curriculum
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1
                    FROM teacher_student_relationships
                    WHERE teacher_id = curriculum.teacher_id
                    AND student_id = auth.uid()
                    AND status = 'active'
                )
            );
    END IF;
END
$$;

-- Student Activity Table: Teachers can view activities of their students, students can view their own
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'student_activity_student_access_policy' AND tablename = 'student_activity') THEN
        ALTER TABLE student_activity ENABLE ROW LEVEL SECURITY;
        CREATE POLICY student_activity_student_access_policy ON student_activity
            FOR SELECT
            TO authenticated
            USING (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'student_activity_teacher_access_policy' AND tablename = 'student_activity') THEN
        CREATE POLICY student_activity_teacher_access_policy ON student_activity
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1
                    FROM teacher_student_relationships
                    WHERE teacher_id = auth.uid()
                    AND student_id = student_activity.student_id
                    AND status = 'active'
                )
            );
    END IF;
END
$$;

-- Settings Table: Users can only view and update their own settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'settings_access_policy' AND tablename = 'settings') THEN
        ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY settings_access_policy ON settings
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Stores role and metadata for users, linked to Supabase Auth.';
COMMENT ON TABLE teacher_student_relationships IS 'Manages relationships between teachers and students.';
COMMENT ON TABLE chat_sessions IS 'Manages conversation sessions between users for chat history retrieval.';
COMMENT ON TABLE chat_history IS 'Stores individual messages exchanged in chats.';
COMMENT ON TABLE curriculum IS 'Stores curriculum content uploaded by teachers.';
COMMENT ON TABLE student_activity IS 'Tracks activities performed by students for monitoring.';
COMMENT ON TABLE settings IS 'Stores user-specific settings and preferences.';

-- End of Schema
