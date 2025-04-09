'use client';

import React, { useState } from 'react';
import { ChatLayout } from "@/components/chat/chat-layout";
import { BrainCircuit, FlaskConical, History, Sigma, BookOpen } from 'lucide-react';

// Define subjects locally or import from a shared location
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

export default function ActivityPage() {
  // Dummy state/handlers needed for ChatLayout compatibility
  const [dummySubject, setDummySubject] = useState(subjects[0].value);
  const handleDummyNewChat = () => console.log("New Chat clicked from Activity");

  return (
    <ChatLayout
      subjects={subjects}
      selectedSubject={dummySubject}
      onSubjectChange={setDummySubject}
      isLoading={false}
      onNewChat={handleDummyNewChat}
    >
      {/* Main Content for Activity Page */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 dark:text-neutral-100">Activity</h1>
          
          <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-sm border dark:border-neutral-700/80">
            <h2 className="text-lg font-medium mb-3 dark:text-neutral-200">Recent Activity</h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              {/* Placeholder Activity content */}
              This section will display recent interactions or usage statistics.
            </p>
            {/* Add actual activity log/stats later */}
             <div className="text-center text-sm text-gray-500 dark:text-neutral-400 py-8">
                 Activity log coming soon.
             </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
} 