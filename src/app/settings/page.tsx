'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout"; // Import AppLayout
import { BrainCircuit, FlaskConical, History, Sigma, BookOpen, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";

// Define Chat History Item type (can be shared or imported)
interface ChatHistoryItem {
  id: string;
  title: string;
}

// Define subjects locally or import from a shared location (needed for AppLayout -> ChatSidebar)
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

export default function SettingsPage() {
  // State needed for AppLayout props (passed down to ChatSidebar)
  // Use dummy/mock data and handlers for now
  const [chatHistory, ] = useState<ChatHistoryItem[]>([
    // Provide some mock history for the sidebar to display
   
  ]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0].value); // Default subject
  const [isLoading, ] = useState(false); // Example loading state

  const handleSelectChat = (id: string) => {
    console.log(`Settings Page: Chat selected ${id}`);
    setCurrentChatId(id);
    // Might navigate to the chat page
  };

  const handleNewChat = () => {
    console.log("Settings Page: New Chat clicked");
    // Might navigate to /chat
    setCurrentChatId(null);
  };

  const handleSubjectChange = (value: string) => {
    console.log(`Settings Page: Subject changed to ${value}`);
    setSelectedSubject(value);
  };

  // Theme state from next-themes
  const { theme, setTheme } = useTheme(); // removed resolvedTheme as it wasn't used
  // Need to wait for mount to access theme reliably
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themeOptions = [
    { value: 'system', label: 'System', icon: Laptop },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <AppLayout // Use AppLayout
      // Pass the necessary props for the sidebar
      chatHistory={chatHistory}
      onSelectChat={handleSelectChat}
      currentChatId={currentChatId}
      onNewChat={handleNewChat}
      selectedSubject={selectedSubject}
      onSubjectChange={handleSubjectChange}
      isLoading={isLoading}
    >
      {/* Main Content for Settings Page */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 dark:text-neutral-100">Settings</h1>
          
          <div className="bg-white dark:bg-neutral-900/80 p-6 rounded-lg shadow-sm border dark:border-neutral-700/80">
            <h2 className="text-lg font-medium mb-4 dark:text-neutral-200">Appearance</h2>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Theme</label>
                 <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3">Select how Principia AI looks. System setting will match your OS preference.</p>
                 {mounted && (
                    <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-neutral-800 p-1">
                        {themeOptions.map(opt => {
                            const isActive = theme === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setTheme(opt.value)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ease-in-out",
                                        isActive 
                                            ? "bg-white dark:bg-neutral-700/70 shadow-sm text-indigo-600 dark:text-neutral-100 font-medium" 
                                            : "text-gray-600 dark:text-neutral-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/40"
                                    )}
                                    aria-pressed={isActive}
                                >
                                    <opt.icon size={16} />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                 )}
                 {!mounted && (
                    // Placeholder while theme is loading to prevent layout shift
                    <div className="h-[40px] bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
                 )}
             </div>

             {/* Add more settings sections here later */}
             {/* <h2 className="text-lg font-medium mb-4 mt-8 dark:text-neutral-200">Account</h2> ... */}

          </div>
        </div>
      </div>
    </AppLayout> // Close AppLayout
  );
}
