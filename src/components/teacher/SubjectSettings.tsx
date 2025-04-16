"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTeacherSettings, Subject, defaultSubjects } from '@/lib/teacher-settings-context';
import { Plus, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SubjectSettingsProps extends React.HTMLAttributes<HTMLDivElement> {}

const SubjectSettings = React.forwardRef<HTMLDivElement, SubjectSettingsProps>(
  ({ className, ...props }, ref) => {
    const { settings, updateSettings } = useTeacherSettings();
    const [newSubjectName, setNewSubjectName] = useState('');
    const [isAddingSubject, setIsAddingSubject] = useState(false);

    // Toggle a subject selection
    const toggleSubject = (subject: Subject) => {
      const isSelected = settings.subjects.some(s => s.id === subject.id);
      
      if (isSelected) {
        // Don't allow removing the last subject
        if (settings.subjects.length <= 1) {
          return;
        }
        // Remove the subject
        updateSettings({
          subjects: settings.subjects.filter(s => s.id !== subject.id)
        });
      } else {
        // Add the subject
        updateSettings({
          subjects: [...settings.subjects, subject]
        });
      }
    };

    // Add a custom subject
    const addCustomSubject = () => {
      if (!newSubjectName.trim()) return;
      
      const newSubject: Subject = {
        id: `custom_${uuidv4()}`,
        name: newSubjectName.trim(),
        isCustom: true
      };
      
      updateSettings({
        subjects: [...settings.subjects, newSubject]
      });
      
      setNewSubjectName('');
      setIsAddingSubject(false);
    };

    // Remove a custom subject
    const removeCustomSubject = (subjectId: string) => {
      // Don't allow removing the last subject
      if (settings.subjects.length <= 1) {
        return;
      }
      
      updateSettings({
        subjects: settings.subjects.filter(s => s.id !== subjectId)
      });
    };

    // Handle additional context change
    const handleAdditionalContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateSettings({
        additionalContext: e.target.value
      });
    };

    // Check if a subject is selected
    const isSubjectSelected = (subjectId: string) => {
      return settings.subjects.some(s => s.id === subjectId);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "p-4 border rounded bg-gray-800/50 border-gray-700/50 space-y-6",
          className
        )}
        {...props}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Subject Settings</h3>
            <p className="text-sm text-gray-400">Select the subjects you teach and add custom subjects if needed</p>
          </div>
        </div>
        
        {/* Subject Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">
              Subjects You Teach <span className="text-xs text-gray-500">(Select all that apply)</span>
            </label>
            <span className="text-xs text-indigo-400">{settings.subjects.length} selected</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {defaultSubjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => toggleSubject(subject)}
                className={cn(
                  "flex items-center p-2.5 rounded-md border text-sm transition-all duration-200",
                  isSubjectSelected(subject.id)
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-gray-800/30 border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600"
                )}
              >
                <div className="mr-2 flex-shrink-0">
                  {isSubjectSelected(subject.id) ? (
                    <Check className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-600 rounded-sm" />
                  )}
                </div>
                <span>{subject.name}</span>
              </button>
            ))}
          </div>
          
          {/* Custom Subjects Section */}
          <div className="mt-6 border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-300">Custom Subjects</h4>
              {settings.subjects.filter(subject => subject.isCustom).length > 0 && (
                <span className="text-xs text-indigo-400">
                  {settings.subjects.filter(subject => subject.isCustom).length} custom subject(s)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {settings.subjects
                .filter(subject => subject.isCustom)
                .map(subject => (
                  <div
                    key={subject.id}
                    className="flex items-center bg-indigo-600/20 border border-indigo-500 text-indigo-300 rounded-md px-3 py-1.5 text-sm shadow-sm"
                  >
                    <Check className="h-3 w-3 mr-1 text-indigo-400" />
                    <span>{subject.name}</span>
                    <button
                      onClick={() => removeCustomSubject(subject.id)}
                      className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              
              {isAddingSubject ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Subject name..."
                    className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    autoFocus
                  />
                  <button
                    onClick={addCustomSubject}
                    className="ml-2 text-green-500 hover:text-green-400 transition-colors"
                    disabled={!newSubjectName.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSubject(false);
                      setNewSubjectName('');
                    }}
                    className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingSubject(true)}
                  className="flex items-center bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600 rounded-md px-3 py-1.5 text-sm transition-all duration-200"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span>Add Custom Subject</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Context */}
        <div className="mt-8 border-t border-gray-700 pt-6 space-y-3">
          <div>
            <label htmlFor="additional-context" className="block text-sm font-medium text-gray-300">
              Additional Context for AI
            </label>
            <p className="text-xs text-gray-500 mt-1">
              This will be included in all AI interactions with students
            </p>
          </div>
          <textarea
            id="additional-context"
            value={settings.additionalContext}
            onChange={handleAdditionalContextChange}
            placeholder="Add any additional context or instructions for the AI..."
            className="w-full h-40 p-3 bg-gray-700 border border-gray-600 text-gray-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
          <div className="bg-gray-800/50 border border-gray-700/80 rounded-md p-3">
            <h5 className="text-xs font-medium text-gray-300 mb-2">Examples:</h5>
            <ul className="text-xs text-gray-400 space-y-1.5 ml-4 list-disc">
              <li>"Focus on Common Core standards for all math responses"</li>
              <li>"Emphasize critical thinking and problem-solving approaches"</li>
              <li>"Include real-world examples relevant to student interests"</li>
              <li>"Always encourage students to show their work in math problems"</li>
              <li>"Reference historical context when discussing literature"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
);

SubjectSettings.displayName = "SubjectSettings";

export { SubjectSettings };
