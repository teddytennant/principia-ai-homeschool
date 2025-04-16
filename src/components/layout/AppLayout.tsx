'use client';

import React from 'react';
import { ChatSidebar } from '@/components/chat/chat-sidebar'; // Adjust path as needed
import { cn } from '@/lib/utils';
import { BrainCircuit, FlaskConical, History, Sigma, BookOpen } from 'lucide-react'; // Import icons needed for subjects

// Define Chat History Item type (can be shared)
interface ChatHistoryItem {
  id: string;
  title: string;
}

 // Define subjects here or import from a shared location
// These are needed by the sidebar for the dropdown
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

interface AppLayoutProps {
    children: React.ReactNode; // The main page content
    // Props required specifically by ChatSidebar
    chatHistory: ChatHistoryItem[];
    onSelectChat: (id: string) => void;
    currentChatId: string | null;
    onNewChat: () => void;
    selectedSubject: string; // Still needed for the subject dropdown in sidebar
    onSubjectChange: (value: string) => void; // Still needed for the subject dropdown
    isLoading?: boolean; // Optional: Sidebar might disable elements during loading
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    chatHistory,
    onSelectChat,
    currentChatId,
    onNewChat,
    selectedSubject,
    onSubjectChange,
    isLoading = false, // Default to false
}) => {
    return (
        <div className={cn(
            "flex h-screen w-full text-sm",
            "bg-white dark:bg-neutral-900" // Main content area background
        )}>
            {/* Sidebar */}
            <ChatSidebar
                subjects={subjects} // Pass subjects to the sidebar
                selectedSubject={selectedSubject}
                onSubjectChange={onSubjectChange}
                isLoading={isLoading}
                onNewChat={onNewChat}
                chatHistory={chatHistory}
                onSelectChat={onSelectChat}
                currentChatId={currentChatId}
            />
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {children}
            </main>
             {/* TODO: Add mobile sidebar toggle button here if needed */}
        </div>
    );
};
