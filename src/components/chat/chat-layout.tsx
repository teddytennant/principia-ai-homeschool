'use client';

import React from 'react';
import { ChatSidebar } from './chat-sidebar'; // Assuming sidebar is in the same directory
import { cn } from '@/lib/utils'; // Import cn

// Define subject type again or import from a shared location
interface Subject {
    value: string;
    label: string;
    icon: React.ElementType;
}

interface ChatLayoutProps {
    children: React.ReactNode; // The main chat content (page.tsx content)
    subjects: Subject[];
    selectedSubject: string;
    onSubjectChange: (value: string) => void;
    isLoading: boolean;
    onNewChat: () => void; // Add prop for new chat handler
    // Pass chat history props later
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
    children,
    subjects,
    selectedSubject,
    onSubjectChange,
    isLoading,
    onNewChat, // Receive the handler
}) => {
    // Add state for mobile sidebar toggle later if needed

    return (
        // Use specific dark mode backgrounds for layout distinction
        <div className={cn(
            "flex h-screen w-full text-sm",
            "bg-white dark:bg-neutral-900" // Main chat area background
        )}>
            {/* Sidebar will have its own darker background via its className */}
            <ChatSidebar
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSubjectChange={onSubjectChange}
                isLoading={isLoading}
                onNewChat={onNewChat} // Pass handler to sidebar
                // Pass chat history props later
            />
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Children now includes both message area and input area from page.tsx */} 
                {children}
            </main>
             {/* Add a button to toggle sidebar on mobile later */}
        </div>
    );
}; 