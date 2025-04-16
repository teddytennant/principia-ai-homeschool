"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

// Define the types for our curriculum items
export interface CurriculumItem {
  id: string;
  name: string;
  content: string; // This would be the extracted text content from the uploaded file
  type: string;
  size?: number; // Size in bytes (optional)
  uploadedAt: Date;
}

// Define subject type
export interface Subject {
  id: string;
  name: string;
  isCustom?: boolean;
}

// Define the types for our settings
export interface TeacherSettings {
  isAiEnabled: boolean;
  aiOpenness: number; // 0-100 scale (0: Socratic, 100: Direct)
  gradeLevel: string;
  curriculum: CurriculumItem[];
  subjects: Subject[]; // Subjects the teacher teaches
  additionalContext: string; // Additional context for the AI
}

// Define the context type
interface TeacherSettingsContextType {
  settings: TeacherSettings;
  updateSettings: (newSettings: Partial<TeacherSettings>) => void;
  addCurriculumItem: (item: CurriculumItem) => void;
  removeCurriculumItem: (id: string) => void;
}

// Create the context with a default value
const TeacherSettingsContext = createContext<TeacherSettingsContextType | undefined>(undefined);

// Default subjects
export const defaultSubjects: Subject[] = [
  { id: 'general', name: 'General' },
  { id: 'math', name: 'Mathematics' },
  { id: 'science', name: 'Science' },
  { id: 'history', name: 'History' },
  { id: 'english', name: 'English' },
  { id: 'computer_science', name: 'Computer Science' },
  { id: 'art', name: 'Art' },
  { id: 'music', name: 'Music' },
  { id: 'physical_education', name: 'Physical Education' },
];

// Default settings
const defaultSettings: TeacherSettings = {
  isAiEnabled: true,
  aiOpenness: 50, // Middle of the scale
  gradeLevel: '8', // Default to 8th grade
  curriculum: [], // Empty curriculum initially
  subjects: [defaultSubjects[0]], // Default to General subject
  additionalContext: '', // No additional context initially
};

// Provider component
export function TeacherSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TeacherSettings>(defaultSettings);

  // Load settings from localStorage on initial render (client-side only)
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('teacherSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Convert string dates back to Date objects for curriculum items
        if (parsedSettings.curriculum) {
          parsedSettings.curriculum = parsedSettings.curriculum.map((item: CurriculumItem) => ({
            ...item,
            uploadedAt: typeof item.uploadedAt === 'string' ? new Date(item.uploadedAt) : item.uploadedAt
          }));
        }
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading teacher settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage and cookies whenever they change
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('teacherSettings', JSON.stringify(settings));
      
      // Save to cookies for server-side access
      // Use a 30-day expiration by default
      Cookies.set('teacherSettings', JSON.stringify(settings), { expires: 30 });
    } catch (error) {
      console.error('Error saving teacher settings:', error);
    }
  }, [settings]);

  // Update settings
  const updateSettings = (newSettings: Partial<TeacherSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Add curriculum item
  const addCurriculumItem = (item: CurriculumItem) => {
    setSettings(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, item]
    }));
  };

  // Remove curriculum item
  const removeCurriculumItem = (id: string) => {
    setSettings(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter(item => item.id !== id)
    }));
  };

  return (
    <TeacherSettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      addCurriculumItem, 
      removeCurriculumItem 
    }}>
      {children}
    </TeacherSettingsContext.Provider>
  );
}

// Custom hook to use the context
export function useTeacherSettings() {
  const context = useContext(TeacherSettingsContext);
  if (context === undefined) {
    throw new Error('useTeacherSettings must be used within a TeacherSettingsProvider');
  }
  return context;
}
