-- Drop the incorrect policies if they somehow still exist (defensive programming)
DROP POLICY IF EXISTS "Allow student access if parent subscription active" ON public.chats;
DROP POLICY IF EXISTS "Allow student message access if parent subscription active" ON public.chat_messages;

-- Drop the very first simple policies if they somehow still exist
DROP POLICY IF EXISTS "Allow student access to own chats" ON public.chats;
DROP POLICY IF EXISTS "Allow student access to own messages" ON public.chat_messages;

-- Enable RLS if it was somehow disabled again
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create the correct policy for the chats table
CREATE POLICY "Allow student access based on subscription type"
ON public.chats
AS PERMISSIVE FOR ALL
TO authenticated
USING (
    -- User must be the student associated with the chat
    auth.uid() = student_id
    AND (
        -- Condition A: Individual Learner (no parent link, own subscription active)
        (
            NOT EXISTS (
                SELECT 1
                FROM public.parents_students ps
                WHERE ps.student_id = chats.student_id
            )
            AND EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = chats.student_id AND p.subscription_status = 'active'
            )
        )
        -- OR
        -- Condition B: Family/Co-op Learner (parent link exists, parent subscription active)
        OR (
            EXISTS (
                SELECT 1
                FROM public.parents_students ps
                JOIN public.profiles pp ON ps.parent_id = pp.id
                WHERE ps.student_id = chats.student_id AND pp.subscription_status = 'active'
            )
        )
    )
)
WITH CHECK (
    -- User must be the student associated with the chat
    auth.uid() = student_id
    AND (
        -- Condition A: Individual Learner (no parent link, own subscription active)
        (
            NOT EXISTS (
                SELECT 1
                FROM public.parents_students ps
                WHERE ps.student_id = chats.student_id
            )
            AND EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = chats.student_id AND p.subscription_status = 'active'
            )
        )
        -- OR
        -- Condition B: Family/Co-op Learner (parent link exists, parent subscription active)
        OR (
            EXISTS (
                SELECT 1
                FROM public.parents_students ps
                JOIN public.profiles pp ON ps.parent_id = pp.id
                WHERE ps.student_id = chats.student_id AND pp.subscription_status = 'active'
            )
        )
    )
);

-- Create the correct policy for the chat_messages table
CREATE POLICY "Allow student message access based on subscription type"
ON public.chat_messages
AS PERMISSIVE FOR ALL
TO authenticated
USING (
    -- User must be the student associated with the message
    auth.uid() = student_id
    AND (
        -- Condition A: Individual Learner (no parent link, own subscription active)
        (
            NOT EXISTS (
                SELECT 1
                FROM public.parents_students ps
                WHERE ps.student_id = chat_messages.student_id
            )
            AND EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = chat_messages.student_id AND p.subscription_status = 'active'
            )
        )
        -- OR
        -- Condition B: Family/Co-op Learner (parent link exists, parent subscription active)
        OR (
            EXISTS (
                SELECT 1
                FROM public.parents_students ps
                JOIN public.profiles pp ON ps.parent_id = pp.id
                WHERE ps.student_id = chat_messages.student_id AND pp.subscription_status = 'active'
            )
        )
    )
)
WITH CHECK (
    -- User must be the student associated with the message
    auth.uid() = student_id
    AND (
        -- Condition A: Individual Learner (no parent link, own subscription active)
        (
            NOT EXISTS (
                SELECT 1
                FROM public.parents_students ps
                WHERE ps.student_id = chat_messages.student_id
            )
            AND EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = chat_messages.student_id AND p.subscription_status = 'active'
            )
        )
        -- OR
        -- Condition B: Family/Co-op Learner (parent link exists, parent subscription active)
        OR (
            EXISTS (
                SELECT 1
                FROM public.parents_students ps
                JOIN public.profiles pp ON ps.parent_id = pp.id
                WHERE ps.student_id = chat_messages.student_id AND pp.subscription_status = 'active'
            )
        )
    )
);
