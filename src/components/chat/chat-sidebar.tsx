'use client';

import React from 'react';
import Link from 'next/link'; // Import Next Link
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter
import { cn } from "@/lib/utils";
import { MessageSquarePlus, ChevronDown, Settings, HelpCircle } from 'lucide-react'; // Add more icons

// Define subject type (can be shared or redefined)
interface Subject {
    value: string;
    label: string;
    icon: React.ElementType;
}

interface ChatSidebarProps {
    subjects: Subject[];
    selectedSubject: string;
    onSubjectChange: (value: string) => void;
    isLoading: boolean;
    onNewChat: () => void; // Add prop for new chat handler
    // Props for chat history
    chatHistory: { id: string; title: string }[];
    onSelectChat: (id: string) => void;
    currentChatId: string | null;
}

// Refined SidebarItem for cleaner hover/active states
const SidebarItem: React.FC<{ children: React.ReactNode, onClick?: () => void, href?: string, isActive?: boolean }> = 
    ({ children, onClick, href, isActive }) => {
    const commonClasses = "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 transition-colors duration-100 ease-in-out"; // Adjusted gap/padding
    const activeClasses = "bg-gray-200 dark:bg-neutral-800/80"; // Subtle active state
    const hoverClasses = "hover:bg-gray-200/60 dark:hover:bg-neutral-800/50"; // Subtle hover

    const content = <>{children}</>;

    if (href) {
        return (
            <Link href={href} className={cn(commonClasses, hoverClasses, isActive && activeClasses)}>
                {content}
            </Link>
        );
    }
    return (
        <button onClick={onClick} className={cn("w-full text-left", commonClasses, hoverClasses, isActive && activeClasses)}>
            {content}
        </button>
    );
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    subjects,
    selectedSubject,
    onSubjectChange,
    isLoading,
    onNewChat, // Receive handler
    // Receive chat history props
    chatHistory,
    onSelectChat,
    currentChatId,
}) => {
    const SelectedIcon = subjects.find(s => s.value === selectedSubject)?.icon || MessageSquarePlus;
    const iconSize = 16; // Consistent icon size
    const pathname = usePathname(); // Get current path
    const router = useRouter(); // Get router instance

    // Handle New Chat: clear state and navigate to /chat if not already there
    const handleNewChatClick = () => {
        onNewChat(); // Clear state via prop from ChatPage
        if (pathname !== '/chat') {
            router.push('/chat'); // Navigate to chat page
        }
    };

    return (
        <aside className={cn(
            // Darker sidebar background, slightly wider
            "h-screen w-72 flex-col border-r border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black p-4", 
            "hidden lg:flex" // Hide on smaller than large screens
        )}>
            <div className="flex flex-col h-full">
                {/* Top Section: New Chat button simplified */}
                <div className="mb-4">
                    <button 
                        onClick={handleNewChatClick}
                        disabled={isLoading} // Disable button if chat is loading
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 dark:border-neutral-700/60 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-black disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="dark:text-neutral-100">New Chat</span>
                        <MessageSquarePlus size={iconSize} className="dark:text-neutral-400" />
                    </button>
                </div>

                {/* Subject Selector - improved padding/border */}
                <div className="mb-5">
                    <label htmlFor="subject-select" className="block text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1.5 px-1 uppercase tracking-wider">
                        Subject
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SelectedIcon size={iconSize} className="text-gray-500 dark:text-neutral-400" />
                        </div>
                        <select
                            id="subject-select"
                            value={selectedSubject}
                            onChange={(e) => onSubjectChange(e.target.value)}
                            disabled={isLoading}
                            className="w-full appearance-none bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors dark:text-neutral-100"
                        >
                            {subjects.map(subject => (
                                <option key={subject.value} value={subject.value}>
                                    {subject.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500 dark:text-neutral-400">
                            <ChevronDown size={iconSize} />
                        </div>
                    </div>
                </div>

                {/* Middle Section: Chat History - more padding */}
                <div className="flex-1 overflow-y-auto space-y-1 mb-4 pr-1 -mr-3 pl-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent scrollbar-thumb-rounded">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-2 px-1 uppercase tracking-wider">
                        History
                    </h3>
                    {chatHistory && chatHistory.length > 0 ? (
                        chatHistory.map((chat) => (
                            <SidebarItem
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                isActive={chat.id === currentChatId}
                            >
                                {/* Using a generic icon for now, could be dynamic later */}
                                <MessageSquarePlus size={iconSize} /> 
                                <span className="truncate flex-1">{chat.title || `Chat ${chat.id.substring(0, 6)}`}</span> 
                            </SidebarItem>
                        ))
                    ) : (
                        <div className="text-center text-xs text-gray-400 dark:text-neutral-500 py-8 px-2">
                            No chat history yet. Start a new chat!
                        </div>
                    )}
                </div>

                {/* Bottom Section: Links/Settings - Using SidebarItem */}
                <div className="mt-auto border-t border-gray-200 dark:border-neutral-800 pt-3 space-y-1">
                    {/* Mark links as active based on current path */}
                    <SidebarItem href="/help" isActive={pathname === '/help'}> 
                        <HelpCircle size={iconSize} /> Help
                    </SidebarItem>
                    {/* Removed Activity Link */}
                    <SidebarItem href="/settings" isActive={pathname === '/settings'}>
                         <Settings size={iconSize} /> Settings
                     </SidebarItem>
                </div>
            </div>
        </aside>
    );
};
