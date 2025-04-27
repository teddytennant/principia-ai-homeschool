-- Add potentially useful indexes for common query patterns

-- Add index on the 'role' column in the 'profiles' table
-- Useful if querying/filtering users by role is common (e.g., finding all teachers)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Add index on the 'created_at' column in the 'chats' table
-- Useful for sorting chats by creation time (e.g., displaying recent chats)
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at);

COMMENT ON INDEX idx_profiles_role IS 'Index to speed up queries filtering by user role.';
COMMENT ON INDEX idx_chats_created_at IS 'Index to speed up sorting or filtering chats by creation date.';
