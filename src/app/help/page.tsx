'use client';

import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout"; // Import AppLayout
import { BrainCircuit, FlaskConical, History, Sigma, BookOpen } from 'lucide-react'; // Import icons for subjects

// Define Chat History Item type (can be shared or imported)
interface ChatHistoryItem {
  id: string;
  title: string;
}

// Define subjects locally or import from a shared location
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

export default function HelpPage() {
   // State needed for AppLayout props (passed down to ChatSidebar)
  // Use dummy/mock data and handlers - similar to ActivityPage/SettingsPage
  const [chatHistory] = useState<ChatHistoryItem[]>([
   
  ]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0].value); // Default subject
  const [isLoading] = useState(false); // Not loading for Help page

  const handleSelectChat = (id: string) => {
    console.log(`Help Page: Chat selected ${id}`);
    setCurrentChatId(id);
    // In real app, might navigate or load chat context
  };

  const handleNewChat = () => {
    console.log("Help Page: New Chat clicked");
    setCurrentChatId(null);
  };

  const handleSubjectChange = (value: string) => {
    console.log(`Help Page: Subject changed to ${value}`);
    setSelectedSubject(value);
  };

  return (
    <AppLayout // Use AppLayout
      // Props for sidebar
      chatHistory={chatHistory}
      onSelectChat={handleSelectChat}
      currentChatId={currentChatId}
      onNewChat={handleNewChat}
      selectedSubject={selectedSubject}
      onSubjectChange={handleSubjectChange}
      isLoading={isLoading}
    >
      {/* Main Content for Help Page */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 dark:text-neutral-100">Help & Support</h1>
          
          <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-sm border dark:border-neutral-700/80">
            <h2 className="text-lg font-medium mb-3 dark:text-neutral-200">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              {/* Placeholder FAQ content */}
              Find answers to common questions about using Principia AI.
            </p>
            {/* Add actual FAQs later */}
            <div className="space-y-2 text-sm">
                <p><strong>Q: How does the Socratic method work?</strong></p>
                <p className="text-gray-600 dark:text-neutral-400">A: Instead of giving answers, the AI asks guiding questions to help you explore and understand concepts yourself.</p>
                <p><strong>Q: Can I switch subjects during a chat?</strong></p>
                <p className="text-gray-600 dark:text-neutral-400">A: You can select a different subject using the dropdown in the sidebar before starting a new line of inquiry.</p>
            </div>

            <h2 className="text-lg font-medium mb-3 mt-6 dark:text-neutral-200">Contact Us</h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              If you need further assistance, please reach out to support. (Contact details placeholder)
            </p>
          </div>
        </div>
      </div>
    </AppLayout> // Close AppLayout
  );
}
