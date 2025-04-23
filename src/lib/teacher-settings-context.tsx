"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient';

// Define the types for our curriculum items
export interface CurriculumItem {
  id: string;
  name: string;
  content: string; // This would be the extracted text content from the uploaded file
  type: string;
  subject?: string; // Optional subject association for curriculum
  size?: number; // Size in bytes (optional)
  uploadedAt: Date;
}

// Define subject type
export interface Subject {
  id: string;
  name: string;
  isCustom?: boolean;
}

// Define the types for student-specific settings
export interface StudentSettings {
  isAiEnabled: boolean;
  aiOpenness: number; // 0-100 scale (0: Socratic, 100: Direct)
  gradeLevel: string;
  additionalContext: string; // Additional context for the AI for this student
}

// Define the types for our settings
export interface TeacherSettings {
  isAiEnabled: boolean;
  aiOpenness: number; // 0-100 scale (0: Socratic, 100: Direct)
  gradeLevel: string;
  curriculum: CurriculumItem[];
  subjects: Subject[]; // Subjects the teacher teaches
  additionalContext: string; // General additional context for the AI
  subjectContext: Record<string, string>; // Subject-specific additional context
  studentSettings: Record<string, StudentSettings>; // Map of student ID/username to their specific settings
}

// Define the context type
interface TeacherSettingsContextType {
  settings: TeacherSettings;
  updateSettings: (newSettings: Partial<TeacherSettings>) => void;
  addCurriculumItem: (item: CurriculumItem) => void;
  removeCurriculumItem: (id: string) => void;
  updateStudentSettings: (studentId: string, settings: Partial<StudentSettings>) => void;
  removeStudentSettings: (studentId: string) => void;
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
  additionalContext: '', // No general additional context initially
  subjectContext: {}, // No subject-specific context initially
  studentSettings: {}, // No student-specific settings initially
};

// Provider component
export function TeacherSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TeacherSettings>(defaultSettings);

  // Load settings from Supabase on initial render
  useEffect(() => {
    const fetchSettingsFromBackend = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user for settings:', error.message);
          return;
        }
        if (!user) {
          console.log('No authenticated user found, using default settings.');
          return;
        }

        const { data, error: settingsError } = await supabase
          .from('teacher_settings')
          .select('settings')
          .eq('teacher_id', user.id)
          .limit(1);

        if (settingsError) {
          if (settingsError.message && settingsError.message.includes('relation "public.teacher_settings" does not exist')) {
            console.error('Error fetching teacher settings from Supabase: The teacher_settings table does not exist in the database. Please run the create_teacher_settings_table.sql script to create it.');
          } else {
            console.error('Error fetching teacher settings from Supabase:', settingsError.message || settingsError || 'Unknown error');
          }
          return;
        }

        if (data && data.length > 0 && data[0].settings) {
          const backendSettings = data[0].settings;
          // Convert string dates back to Date objects for curriculum items
          if (backendSettings.curriculum) {
            backendSettings.curriculum = backendSettings.curriculum.map((item: CurriculumItem) => ({
              ...item,
              uploadedAt: typeof item.uploadedAt === 'string' ? new Date(item.uploadedAt) : item.uploadedAt
            }));
          }
          setSettings(backendSettings);
          console.log('Teacher settings loaded from Supabase for user:', user.id);
        } else {
          console.log('No settings found in Supabase, using default settings.');
        }
      } catch (error) {
        console.error('Error fetching teacher settings from backend:', error);
      }
    };

    fetchSettingsFromBackend();
  }, []);

  // Save settings to Supabase whenever they change
  useEffect(() => {
    const saveSettingsToBackend = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user for saving settings:', error.message);
          return;
        }
        if (!user) {
          console.log('No authenticated user found, cannot save settings.');
          return;
        }

        const { error: upsertError } = await supabase
          .from('teacher_settings')
          .upsert({
            teacher_id: user.id,
            settings: settings
          });

        if (upsertError) {
          if (upsertError.message && upsertError.message.includes('relation "public.teacher_settings" does not exist')) {
            console.error('Error saving teacher settings to Supabase: The teacher_settings table does not exist in the database. Please run the create_teacher_settings_table.sql script to create it.');
          } else {
            console.error('Error saving teacher settings to Supabase:', upsertError.message || upsertError || 'Unknown error');
          }
          return;
        }

        console.log('Teacher settings saved to Supabase for user:', user.id);
      } catch (error) {
        console.error('Error saving teacher settings to backend:', error);
      }
    };

    saveSettingsToBackend();
  }, [settings]);

  // Update settings with validation
  const updateSettings = (newSettings: Partial<TeacherSettings>) => {
    // Basic validation to prevent malicious or malformed data
    const validatedSettings: Partial<TeacherSettings> = {};

    if (typeof newSettings.isAiEnabled === 'boolean') {
      validatedSettings.isAiEnabled = newSettings.isAiEnabled;
    }
    if (typeof newSettings.aiOpenness === 'number' && newSettings.aiOpenness >= 0 && newSettings.aiOpenness <= 100) {
      validatedSettings.aiOpenness = newSettings.aiOpenness;
    }
    if (typeof newSettings.gradeLevel === 'string' && newSettings.gradeLevel.trim() !== '') {
      validatedSettings.gradeLevel = newSettings.gradeLevel;
    }
    if (Array.isArray(newSettings.curriculum)) {
      validatedSettings.curriculum = newSettings.curriculum.filter(item => 
        typeof item.id === 'string' && 
        typeof item.name === 'string' && 
        typeof item.content === 'string' && 
        item.uploadedAt instanceof Date
      );
    }
    if (Array.isArray(newSettings.subjects)) {
      validatedSettings.subjects = newSettings.subjects.filter(subject => 
        typeof subject.id === 'string' && 
        typeof subject.name === 'string'
      );
    }
    if (typeof newSettings.additionalContext === 'string') {
      validatedSettings.additionalContext = newSettings.additionalContext;
    }
    if (newSettings.subjectContext && typeof newSettings.subjectContext === 'object') {
      validatedSettings.subjectContext = {};
      for (const [key, value] of Object.entries(newSettings.subjectContext)) {
        if (typeof key === 'string' && typeof value === 'string') {
          validatedSettings.subjectContext[key] = value;
        }
      }
    }
    if (newSettings.studentSettings && typeof newSettings.studentSettings === 'object') {
      validatedSettings.studentSettings = {};
      for (const [studentId, studentSettings] of Object.entries(newSettings.studentSettings)) {
        if (typeof studentId === 'string' && studentSettings && typeof studentSettings === 'object') {
          const validatedStudentSettings: Partial<StudentSettings> = {};
          if (typeof studentSettings.isAiEnabled === 'boolean') {
            validatedStudentSettings.isAiEnabled = studentSettings.isAiEnabled;
          }
          if (typeof studentSettings.aiOpenness === 'number' && studentSettings.aiOpenness >= 0 && studentSettings.aiOpenness <= 100) {
            validatedStudentSettings.aiOpenness = studentSettings.aiOpenness;
          }
          if (typeof studentSettings.gradeLevel === 'string' && studentSettings.gradeLevel.trim() !== '') {
            validatedStudentSettings.gradeLevel = studentSettings.gradeLevel;
          }
          if (typeof studentSettings.additionalContext === 'string') {
            validatedStudentSettings.additionalContext = studentSettings.additionalContext;
          }
          validatedSettings.studentSettings[studentId] = validatedStudentSettings as StudentSettings;
        }
      }
    }

    setSettings(prev => ({ ...prev, ...validatedSettings }));
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

// Update student-specific settings
const updateStudentSettings = (studentId: string, studentSettings: Partial<StudentSettings>) => {
  setSettings(prev => ({
    ...prev,
    studentSettings: {
      ...prev.studentSettings,
      [studentId]: {
        ...(prev.studentSettings[studentId] || {
          isAiEnabled: prev.isAiEnabled,
          aiOpenness: prev.aiOpenness,
          gradeLevel: prev.gradeLevel,
          additionalContext: ''
        }),
        ...studentSettings
      }
    }
  }));
};

// Remove student-specific settings
const removeStudentSettings = (studentId: string) => {
  setSettings(prev => {
    const newStudentSettings = { ...prev.studentSettings };
    delete newStudentSettings[studentId];
    return {
      ...prev,
      studentSettings: newStudentSettings
    };
  });
};

  return (
    <TeacherSettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      addCurriculumItem, 
      removeCurriculumItem,
      updateStudentSettings,
      removeStudentSettings
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
