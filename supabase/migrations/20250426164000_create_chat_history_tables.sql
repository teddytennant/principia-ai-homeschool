-- Migration to create tables for storing chat history

-- Create chats table to store metadata for each chat session
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Use gen_random_uuid() if available, or uuid_generate_v4() if uuid-ossp extension is enabled
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Link to the user who initiated the chat
    subject TEXT, -- Optional: Store the subject of the chat
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);

-- Function to automatically update updated_at timestamp (if not already created by previous migrations)
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on chats table update
CREATE TRIGGER set_chats_timestamp
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create chat_messages table to store individual messages within a chat
CREATE TABLE public.chat_messages (
    id BIGSERIAL PRIMARY KEY, -- Auto-incrementing ID for ordering
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE, -- Link to the chat session
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Link to the user (redundant but useful for direct queries)
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')), -- Role of the message sender
    content TEXT NOT NULL, -- The actual message content
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    -- Add other potential fields: token_count, cost, model_used, etc.
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);


-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats table
-- Allow users to manage (select, insert, update, delete) their own chat sessions
CREATE POLICY "Allow users to manage their own chats"
ON public.chats
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_messages table
-- Allow users to manage messages within their own chat sessions
-- We check ownership via the linked chat session's user_id
CREATE POLICY "Allow users to manage messages in their own chats"
ON public.chat_messages
FOR ALL
USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
))
WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
));

-- Add comments for clarity
COMMENT ON TABLE public.chats IS 'Stores metadata for individual chat sessions.';
COMMENT ON TABLE public.chat_messages IS 'Stores individual messages belonging to a chat session.';
COMMENT ON COLUMN public.chat_messages.role IS 'The role of the entity sending the message (user, assistant, or system).';
