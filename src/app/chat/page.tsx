"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from 'framer-motion';
import { SendHorizonal, User, Bot, BrainCircuit, FlaskConical, History, Sigma, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Textarea } from "@/components/ui/textarea";
import { ChatLayout } from "@/components/chat/chat-layout";

// Define message type
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Define subjects
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0].value);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the auto-resize hook
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52, // Adjust as needed
    maxHeight: 200,
  });

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
    // Optionally reset subject to general
    // setSelectedSubject(subjects[0].value);
    textareaRef.current?.focus(); // Focus the input area
    adjustHeight(true); // Reset textarea height
    console.log("New chat started");
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const currentSubject = selectedSubject;
    const userMessage: Message = { role: "user", content: currentInput };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    adjustHeight(true); // Reset textarea height
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send message content AND subject
        body: JSON.stringify({ message: currentInput, subject: currentSubject }),
      });

      if (!response.ok) {
        // Log the response body for more details on API errors
        let errorBody = 'Unknown error';
        try {
          errorBody = await response.text(); // Try to get text first
          console.error("API Error Response Body:", errorBody);
        } catch { /* Ignore if body can't be read */ }
        throw new Error(`API error: ${response.statusText} (${response.status}) - ${errorBody.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!data.content) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from API.");
      }

      const assistantMessage: Message = { role: "assistant", content: data.content };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error("Chat Submit Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`${errorMessage}`); // Keep error message concise for UI
      setMessages(prev => prev.slice(0, -1));
      setInput(currentInput);
      requestAnimationFrame(() => adjustHeight());
    } finally {
      setIsLoading(false);
    }
  };

  // Update input state and adjust textarea height
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <ChatLayout
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        isLoading={isLoading}
        onNewChat={handleNewChat}
    >
        {/* Messages Area - Further Refinements */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
             <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
                {/* Initial Placeholder - More minimal */}
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center text-center text-gray-400 dark:text-neutral-500 pt-24 md:pt-32">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 rounded-full mb-5 shadow-lg">
                             <BrainCircuit size={36} className="text-white"/>
                        </div>
                        <h2 className="text-2xl font-medium text-gray-700 dark:text-neutral-200">
                            Principia AI
                        </h2>
                    </div>
                )}

                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }} // Faster transition
                        className={cn(
                            "flex items-start gap-3 w-full",
                            message.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex items-start gap-3 max-w-[85%]",
                            message.role === "user" && "flex-row-reverse"
                        )}>
                            {/* Icon - Slightly smaller, adjusted colors */}
                            <div className={cn(
                                "flex-shrink-0 p-1.5 rounded-full mt-0.5 shadow-sm",
                                message.role === 'user' 
                                    ? 'bg-indigo-500 dark:bg-indigo-600 text-indigo-50' 
                                    : 'bg-gray-200 dark:bg-neutral-700/70 text-gray-700 dark:text-neutral-300'
                            )}>
                                {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            {/* Message Bubble - Refined colors and padding */}
                            <div
                                className={cn(
                                    "px-3.5 py-2 rounded-lg text-sm shadow-sm", // Less vertical padding
                                    "leading-relaxed break-words",
                                    message.role === "user"
                                        ? "bg-indigo-500 dark:bg-indigo-600 text-white"
                                        : "bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                                )}
                            >
                                {/* Consider using a markdown renderer here for richer text */}
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Loading Indicator - Aligned with bot message */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-start gap-3 justify-start w-full"
                    >
                         <div className={cn(
                             "flex items-start gap-3 max-w-[85%]",
                         )}>
                            <div className="flex-shrink-0 p-1.5 rounded-full mt-0.5 shadow-sm bg-gray-200 dark:bg-neutral-700/70 text-gray-700 dark:text-neutral-300">
                                <Bot size={14} />
                            </div>
                            <div className="px-3.5 py-2 rounded-lg shadow-sm bg-white dark:bg-neutral-800">
                                <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s] inline-block mr-1.5"></div>
                                <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s] inline-block mr-1.5"></div>
                                <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce inline-block"></div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Error Message */}
                {error && (
                     <div className="flex justify-center p-4">
                         <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 px-3 py-2 rounded-lg text-sm max-w-md text-center">
                             <strong>Error:</strong> {error}
                         </div>
                     </div>
                 )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-1"/>
            </div>
        </div>

        {/* Input Area - Blend with background */}
        <div className="pb-3 md:pb-4 pt-2 bg-gradient-to-t from-white via-white dark:from-neutral-900 dark:via-neutral-900 to-transparent">
            {/* Input field remains centered */}
            <div className="max-w-3xl mx-auto px-4">
                 <div className="relative flex items-center bg-white dark:bg-neutral-800/80 rounded-2xl border border-gray-200 dark:border-neutral-700/80 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/70 transition-all duration-200 backdrop-blur-sm">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message Principia AI...`}
                        className={cn(
                            "flex-1 pl-4 pr-12 py-3", // Let flexbox handle width, adjust padding
                            "resize-none",
                            "bg-transparent",
                            "border-none",
                            "text-base leading-relaxed", // Slightly larger base text
                            "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-gray-400 dark:placeholder:text-neutral-500",
                            "min-h-[58px] max-h-[200px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
                        )}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className={cn(
                            "absolute right-3 bottom-[9px] p-2 rounded-lg text-sm transition-all duration-150 ease-in-out", // Adjusted positioning/timing
                            "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-neutral-800",
                            input.trim() && !isLoading
                                ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 active:bg-indigo-800 scale-100 hover:scale-[1.03] active:scale-95"
                                : "bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed"
                        )}
                        disabled={isLoading || !input.trim()}
                        aria-label="Send message"
                    >
                        <SendHorizonal size={18} />
                    </button>
                </div>
            </div>
        </div>
    </ChatLayout>
  );
}
