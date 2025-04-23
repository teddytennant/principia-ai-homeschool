import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthGuard } from '@/app/chat/AuthGuard';
import { useTeacherSettings } from '@/lib/teacher-settings-context';
import { Switch } from "@/components/ui/switch";

export default function TeacherSettingsPage() {
  const { settings, updateSettings } = useTeacherSettings();

  const handleAiEnabledChange = (checked: boolean) => {
    updateSettings({ isAiEnabled: checked });
  };

  const handleAiOpennessChange = (value: number) => {
    updateSettings({ aiOpenness: value });
  };

  const handleGradeLevelChange = (value: string) => {
    updateSettings({ gradeLevel: value });
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <header className="w-full flex flex-row items-center justify-between py-4 px-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Principia AI</span>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold text-base">T</div>
          </div>
        </header>

        <main className="flex flex-col min-h-[80vh] w-full px-2 md:px-8 py-10 bg-white dark:bg-gray-950 transition-all duration-300">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Teacher Settings</h1>
          <hr className="border-gray-200 dark:border-gray-800 mb-8" />

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">AI Assistant Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-lg font-medium text-gray-700 dark:text-gray-300">Enable AI Assistant for All Students</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Allow all students to interact with the AI by default</p>
                </div>
                <Switch
                  checked={settings.isAiEnabled}
                  onCheckedChange={handleAiEnabledChange}
                  aria-label="Enable AI Assistant for all students"
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Default AI Response Style</label>
                  <span className="text-sm px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {settings.aiOpenness < 20 ? "Strongly Socratic" :
                     settings.aiOpenness < 40 ? "Mostly Socratic" :
                     settings.aiOpenness < 60 ? "Balanced" :
                     settings.aiOpenness < 80 ? "Mostly Direct" : "Strongly Direct"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.aiOpenness}
                  onChange={(e) => handleAiOpennessChange(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Socratic Teaching</span>
                  <span>Direct Instruction</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Default Grade Level for Students</label>
                <select
                  value={settings.gradeLevel}
                  onChange={(e) => handleGradeLevelChange(e.target.value)}
                  className="w-full p-2.5 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                >
                  <option value="k">Kindergarten</option>
                  <option value="1">1st Grade</option>
                  <option value="2">2nd Grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                  <option value="9">9th Grade</option>
                  <option value="10">10th Grade</option>
                  <option value="11">11th Grade</option>
                  <option value="12">12th Grade</option>
                  <option value="higher_ed">Higher Education</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Subjects Taught</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the subjects you teach. Curriculum and context will only be applied to these specific subjects for your students.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'general', name: 'General' },
                  { id: 'math', name: 'Mathematics' },
                  { id: 'science', name: 'Science' },
                  { id: 'history', name: 'History' },
                  { id: 'english', name: 'English' },
                  { id: 'computer_science', name: 'Computer Science' },
                  { id: 'art', name: 'Art' },
                  { id: 'music', name: 'Music' },
                  { id: 'physical_education', name: 'Physical Education' }
                ].map(subject => (
                  <div key={subject.id} className="flex items-center justify-between p-3 border rounded-md border-gray-300 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300">{subject.name}</span>
                    <Switch
                      checked={settings.subjects.some(s => s.id === subject.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateSettings({ subjects: [...settings.subjects, subject] });
                        } else {
                          updateSettings({ subjects: settings.subjects.filter(s => s.id !== subject.id) });
                        }
                      }}
                      aria-label={`Teach ${subject.name}`}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                ))}
              </div>
              {settings.subjects.some(s => s.id === 'general') && (
              <div className="p-3 border border-yellow-500 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                <strong>Warning:</strong> Selecting 'General' as a subject will apply your curriculum and context to all subjects for your students, which may affect interactions across different classes if they have multiple teachers.
              </div>
              )}
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Additional Context for General Subject</label>
                <textarea
                  value={settings.additionalContext}
                  onChange={(e) => updateSettings({ additionalContext: e.target.value })}
                  placeholder="Provide additional instructions or context for the AI when assisting with general topics."
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  rows={3}
                />
              </div>
              {settings.subjects.filter(s => s.id !== 'general').map(subject => (
                <div key={subject.id} className="space-y-3">
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Additional Context for {subject.name}</label>
                  <textarea
                    value={settings.subjectContext && settings.subjectContext[subject.id] || ''}
                    onChange={(e) => updateSettings({ 
                      subjectContext: { 
                        ...(settings.subjectContext || {}), 
                        [subject.id]: e.target.value 
                      } 
                    })}
                    placeholder={`Provide additional instructions or context for the AI when assisting with ${subject.name}.`}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </DashboardLayout>
    </AuthGuard>
  );
}
