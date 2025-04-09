'use client';

import React, { useState, useEffect } from 'react';
import { ChatLayout } from "@/components/chat/chat-layout";
import { BrainCircuit, FlaskConical, History, Sigma, BookOpen, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";

// Define subjects locally or import from a shared location
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

export default function SettingsPage() {
  // Dummy state/handlers needed for ChatLayout compatibility
  const [dummySubject, setDummySubject] = useState(subjects[0].value);
  const handleDummyNewChat = () => console.log("New Chat clicked from Settings");

  // Theme state from next-themes
  const { theme, setTheme, resolvedTheme } = useTheme();
  // Need to wait for mount to access theme reliably
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const themeOptions = [
    { value: 'system', label: 'System', icon: Laptop },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <ChatLayout
      subjects={subjects}
      selectedSubject={dummySubject}
      onSubjectChange={setDummySubject}
      isLoading={false}
      onNewChat={handleDummyNewChat}
    >
      {/* Main Content for Settings Page */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 dark:text-neutral-100">Settings</h1>
          
          <div className="bg-white dark:bg-neutral-900/80 p-6 rounded-lg shadow-sm border dark:border-neutral-700/80">
            <h2 className="text-lg font-medium mb-4 dark:text-neutral-200">Appearance</h2>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Theme</label>
                 <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3">Select how Principia AI looks. "System" will match your OS preference.</p>
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
    </ChatLayout>
  );
} 