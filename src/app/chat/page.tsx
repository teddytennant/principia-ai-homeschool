"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from 'framer-motion';
import { SendHorizonal, User, Bot, BrainCircuit, FlaskConical, History, Sigma, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/layout/AppLayout";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabaseClient";
import { useChat } from 'ai/react'; // Import useChat hook

// Define message type - Align with useChat's expected structure
// Import Message type from 'ai' package for consistency
import { Message } from 'ai/react';
// interface Message {
//   id: string; // Add ID field
//   role: "user" | "assistant";
//   content: string;
// }

// Define Chat History Item type
interface ChatHistoryItem {
  id: string;
  title: string;
}

// Type for storing messages per chat (using the imported Message type)
interface ChatMessagesStore {
  [key: string]: Message[];
}

// Define subjects
const subjects = [
  { value: "general", label: "General", icon: BrainCircuit },
  { value: "math", label: "Math", icon: Sigma },
  { value: "science", label: "Science", icon: FlaskConical },
  { value: "history", label: "History", icon: History },
  { value: "english", label: "English", icon: BookOpen },
];

import { AuthGuard } from "./AuthGuard";

function ChatPage() {
  // Placeholder: Curriculum-Locked Progressive Disclosure state
  // In a real implementation, this should be fetched from Supabase or backend based on the student's progress.
  const [isCurriculumLocked, setIsCurriculumLocked] = useState<boolean>(false);
  const [curriculumLockReason, setCurriculumLockReason] = useState<string>(
    "You must complete the previous lesson to unlock this chat."
  );

  // Example: Simulate curriculum lock for demonstration (remove in real implementation)
  useEffect(() => {
    // TODO: Replace this with real logic (e.g., fetch curriculum progress)
    // setIsCurriculumLocked(true); // Uncomment to simulate lock
    setIsCurriculumLocked(false); // Allow chat by default
  }, []);
  // Remove manual message state, isLoading, error - useChat handles these
  // const [messages, setMessages] = useState<Message[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0].value);

  // State for chat history and current chat ID
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // State to store messages for all chats
  const [allChatMessages, setAllChatMessages] = useState<ChatMessagesStore>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the auto-resize hook
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52, // Keep minHeight
    maxHeight: 200, // Keep maxHeight
  });

  // Initialize useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/chat', // Point to your chat API route
    body: { // Send additional data needed by the API
      subject: selectedSubject,
      // History is managed by the hook, but you might send initial history if loading from DB
    },
    headers: {
        // Pass chatId if managing multiple chats client-side
        'X-Chat-ID': currentChatId || '', // Send currentChatId or empty string
    },
    initialMessages: [], // Start with empty messages or load from DB/local storage
    onError: (err) => {
      // Handle API errors reported by the hook
      console.error("useChat hook error:", err);
      // You might want to display this error in the UI
    },
    onFinish: (message) => {
        // Optional: Callback when the stream finishes for a message
        console.log("Stream finished for message:", message);
        // Note: Database saving is now handled server-side in the API route's onFinish
    }
  });

  // Scroll to bottom effect - useChat's messages array triggers this
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Adjust textarea height when input changes (handled by useChat's handleInputChange)
  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  // Fetch chat history from Supabase on component mount with retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const fetchChatHistory = async () => {
      try {
        // First, get the current user's ID if available
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('User not authenticated or error fetching user:', userError?.message);
          return;
        }
        const studentId = user.id;
        console.log('Using student ID for chat history:', studentId);

        // Fetch chats, filtering by student ID
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select('id, title')
          .eq('student_id', studentId)
          .order('last_updated', { ascending: false });

        if (chatsError) {
          console.error('Error fetching chat history from Supabase:', chatsError.message);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying fetch chat history (${retryCount}/${maxRetries})...`);
            setTimeout(fetchChatHistory, 2000 * retryCount); // Exponential backoff
          } else {
            console.error('Max retries reached for fetching chat history.');
          }
          return;
        }

        console.log('Fetched chat history:', chatsData);
        if (chatsData && chatsData.length > 0) {
          const mappedHistory = chatsData.map(chat => ({ id: chat.id, title: chat.title }));
          setChatHistory(mappedHistory);
          console.log('Setting chatHistory state:', mappedHistory);

          // Load messages for each chat
          const messagesStore: ChatMessagesStore = {};
          for (const chat of chatsData) {
            const { data: messagesData, error: messagesError } = await supabase
              .from('chat_messages')
              .select('role, content')
              .eq('chat_id', chat.id)
              .order('created_at', { ascending: true });

            if (messagesError) {
              console.error(`Error fetching messages for chat ${chat.id}:`, messagesError.message);
            } else if (messagesData) {
              // Map fetched messages to the Message type, generating IDs
              messagesStore[chat.id] = messagesData.map((msg, index) => ({
                  id: `${chat.id}-${index}-${msg.role}`, // Generate a simple unique ID
                  role: msg.role as "user" | "assistant",
                  content: msg.content
              }));
              console.log(`Loaded ${messagesData.length} messages for chat ${chat.id}`);
            }
          }
          setAllChatMessages(messagesStore);
          console.log('Setting allChatMessages state:', messagesStore);
        } else {
          console.log('No chats found for this user.');
        }
      } catch (err) {
        console.error('Error fetching chat data from Supabase:', err);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying fetch chat history (${retryCount}/${maxRetries})...`);
          setTimeout(fetchChatHistory, 2000 * retryCount); // Exponential backoff
        } else {
          console.error('Max retries reached for fetching chat history.');
        }
      }
    };

    fetchChatHistory();
  }, []);

  // Function to start a new chat
  const handleNewChat = () => {
    const newId = uuidv4(); // Generate a new ID for the potential chat
    setCurrentChatId(newId); // Set as current (even if no messages yet)
    setMessages([]); // Clear messages using the hook's setter
    // Input is managed by useChat, no need to clear manually here
    // Error is managed by useChat
    textareaRef.current?.focus();
    adjustHeight(true);
    console.log("New chat started");
  };

  // Function to handle selecting a chat from history
  const handleSelectChat = (id: string) => {
    const messagesForSelectedChat = allChatMessages[id];
    if (messagesForSelectedChat) {
      setCurrentChatId(id);
      // Ensure messages have IDs when setting state for useChat
      setMessages(messagesForSelectedChat.map((msg, index) => ({
          ...msg,
          id: msg.id || `${id}-${index}-${msg.role}` // Ensure ID exists or generate one
      })));
      // Input is managed by useChat
      // Error is managed by useChat
      console.log(`Selected chat: ${id}`);
      textareaRef.current?.focus();
      adjustHeight(true);
    }
  };

  // Remove the old handleSubmit and handleInputChange, useChat provides these

  // Keep handleKeyDown, but call useChat's handleSubmit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Create a synthetic event or pass necessary info if handleSubmit expects it
      // For useChat, often just calling it without event works if input is managed by the hook
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <AppLayout
      selectedSubject={selectedSubject}
      onSubjectChange={setSelectedSubject}
      isLoading={isLoading}
      onNewChat={handleNewChat}
      chatHistory={chatHistory}
      onSelectChat={handleSelectChat}
      currentChatId={currentChatId}
    >
      {/* Messages Area - Further Refinements */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
          {/* Initial Placeholder - More minimal */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center text-center text-gray-400 dark:text-neutral-500 pt-24 md:pt-32">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 rounded-full mb-5 shadow-lg">
                <BrainCircuit size={36} className="text-white" />
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
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
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
                    "prose prose-sm dark:prose-invert prose-neutral",
                    "max-w-none",
                    "px-3.5 py-2 rounded-lg shadow-sm",
                    "leading-relaxed break-words",
                    message.role === "user"
                      ? "bg-indigo-500 dark:bg-indigo-600 text-white prose-strong:text-white prose-code:text-indigo-100"
                      : "bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 prose-code:text-neutral-800 dark:prose-code:text-neutral-300 prose-strong:text-gray-800 dark:prose-strong:text-neutral-100"
                  )}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="bg-gray-100 dark:bg-neutral-900/80 p-3 rounded my-2 overflow-x-auto">
                            <code className={cn("text-xs", className)} {...props}>
                              {String(children).replace(/\n$/, '')}
                            </code>
                          </div>
                        ) : (
                          <code className={cn("text-xs before:content-none after:content-none font-mono px-1 py-0.5 rounded bg-gray-200/50 dark:bg-neutral-700/50", className)} {...props}>
                            {children}
                          </code>
                        )
                      },
                      a({ ...props }) {
                        return <a target="_blank" rel="noopener noreferrer" {...props} />;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
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
              {/* Display error from useChat hook */}
              <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 px-3 py-2 rounded-lg text-sm max-w-md text-center">
                <strong>Error:</strong> {error?.message || "An unknown error occurred."}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input Area - Blend with background */}
      <div className="pb-3 md:pb-4 pt-2 bg-gradient-to-t from-white via-white dark:from-neutral-900 dark:via-neutral-900 to-transparent">
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative flex items-center bg-white dark:bg-neutral-800/80 rounded-2xl border border-gray-200 dark:border-neutral-700/80 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/70 transition-all duration-200 backdrop-blur-sm">
            {/* Curriculum-Locked Progressive Disclosure UI */}
            {isCurriculumLocked && (
              <div className="absolute left-0 right-0 bottom-[62px] md:bottom-[70px] mx-4 mb-2 z-10 flex justify-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700 px-4 py-2 rounded-lg shadow text-center text-sm max-w-lg">
                  <strong>Locked:</strong> {curriculumLockReason}
                </div>
              </div>
            )}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange} // Use useChat's handler
              onKeyDown={handleKeyDown}
              placeholder={isCurriculumLocked ? "Chat is locked until you complete the required lesson." : `Message Principia AI...`}
              className={cn(
                "flex-1 pl-4 pr-12 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-base leading-relaxed",
                "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-gray-400 dark:placeholder:text-neutral-500",
                "min-h-[58px] max-h-[200px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
              )}
              disabled={isLoading || isCurriculumLocked}
            />
            <button
              type="submit" // Change to type="submit" for form submission
              // onClick={() => handleSubmit()} // Remove onClick, form onSubmit handles it
              className={cn(
                "absolute right-3 bottom-[9px] p-2 rounded-lg text-sm transition-all duration-150 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-neutral-800",
                input.trim() && !isLoading && !isCurriculumLocked
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 active:bg-indigo-800 scale-100 hover:scale-[1.03] active:scale-95"
                  : "bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed"
              )}
              disabled={isLoading || !input.trim() || isCurriculumLocked}
              aria-label="Send message"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function ProtectedChatPage() {
  return (
    <AuthGuard>
      <ChatPage />
    </AuthGuard>
  );
}
