'use client';

import React, { useState } from 'react';
import { ChatLayout } from "@/components/chat/chat-layout";
import { BrainCircuit, FlaskConical, History, Sigma, BookOpen } from 'lucide-react'; // Import icons for subjects

// Define subjects locally or import from a shared location
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

export default function HelpPage() {
  // Dummy state/handlers needed for ChatLayout compatibility
  // In a real app, this might come from a shared context or layout component
  const [dummySubject, setDummySubject] = useState(subjects[0].value);
  const handleDummyNewChat = () => console.log("New Chat clicked from Help");

  return (
    <ChatLayout
      subjects={subjects}
      selectedSubject={dummySubject} 
      onSubjectChange={setDummySubject} // Or a no-op function
      isLoading={false} // Assume not loading
      onNewChat={handleDummyNewChat} // Or a no-op function
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
    </ChatLayout>
  );
} 