-- Create chats table for storing chat metadata
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by student_id
CREATE INDEX IF NOT EXISTS idx_chats_student_id ON chats (student_id);
