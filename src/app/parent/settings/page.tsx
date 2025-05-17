'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
// Assuming AlertDialog is available for confirmation
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Removed Label import, will use standard <label>
// Assuming Slider and Select components might exist or using native elements
// import { Slider } from "@/components/ui/slider";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the structure for teacher settings
interface TeacherSettingsData {
  isAiEnabled: boolean;
  aiOpenness: number;
  gradeLevel: string;
  curriculum: Array<{ name: string; content: string; subject?: string }>;
  subjects: Array<{ id: string; name: string }>;
  additionalContext: string;
  subjectContext?: Record<string, string>;
}

export default function TeacherSettingsPage() {
  const [settings, setSettings] = useState<Partial<TeacherSettingsData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDisableConfirm, setShowDisableConfirm] = useState<boolean>(false); // State for confirmation dialog

  // Fetch current settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated.");

        // Assuming RLS allows teacher to read their own settings
        const { data, error: fetchError } = await supabase
          .from('teacher_settings')
          .select('settings')
          .eq('teacher_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'not found' error initially
          throw fetchError;
        }

        if (data?.settings) {
          setSettings(data.settings);
        } else {
          // Initialize with defaults if no settings found
          setSettings({
            isAiEnabled: true,
            aiOpenness: 50,
            gradeLevel: '8',
            curriculum: [],
            subjects: [{ id: 'general', name: 'General' }],
            additionalContext: '',
            subjectContext: {},
          });
        }
      } catch (err: any) {
        console.error("Error fetching teacher settings:", err);
        setError(err.message || "Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle saving settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated.");

        // Use upsert to either insert or update settings
        const { error: saveError } = await supabase
            .from('teacher_settings')
            .upsert({ teacher_id: user.id, settings: settings }, { onConflict: 'teacher_id' });

        if (saveError) throw saveError;

        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3s

    } catch (err: any) {
        console.error("Error saving teacher settings:", err);
        setError(err.message || "Failed to save settings.");
    } finally {
        setIsSaving(false);
    }
  };

  // Helper to update nested settings state
  const handleSettingChange = (key: keyof TeacherSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle AI toggle request (show confirm dialog if disabling)
  const handleAiToggleRequest = (checked: boolean) => {
      if (!checked) {
          setShowDisableConfirm(true);
      } else {
          handleSettingChange('isAiEnabled', true);
          // Optionally save immediately or wait for main save button
      }
  };

  // Confirm disabling AI
  const confirmDisableAi = () => {
      handleSettingChange('isAiEnabled', false);
      setShowDisableConfirm(false);
      // Optionally save immediately or wait for main save button
  };

   // Helper function for slider description
   const getOpennessDescription = (value: number | undefined): string => {
       const val = value ?? 50; // Default to 50 if undefined
       if (val < 20) return "Strongly Socratic: AI primarily asks guiding questions.";
       if (val < 40) return "Mostly Socratic: AI favors questions but offers hints.";
       if (val < 60) return "Balanced: AI mixes questions and explanations.";
       if (val < 80) return "Mostly Direct: AI provides explanations but encourages reflection.";
       return "Strongly Direct: AI provides direct answers and explanations readily.";
   };

  // TODO: Add UI elements for managing subjects and curriculum

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Teacher Settings</h1>

          {isLoading && <p className="text-gray-400">Loading settings...</p>}
          {error && <p className="text-red-400">Error: {error}</p>}

          {!isLoading && !error && (
            <> {/* Wrap form and dialog in fragment */}
            <form onSubmit={handleSaveSettings} className="space-y-8 p-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg">

              {/* AI Enable Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4 border-gray-700">
                <div className="space-y-0.5">
                  <label htmlFor="ai-enabled" className="text-base font-medium text-gray-100">Enable AI Assistant</label>
                  <p className="text-sm text-gray-400">
                    Allow students assigned to you to use the AI chat features.
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={settings.isAiEnabled ?? true}
                  onCheckedChange={handleAiToggleRequest} // Use handler with confirmation
                  aria-label="Toggle AI Assistant"
                  className="data-[state=checked]:bg-indigo-600" // Style checked state
                />
              </div>

               {/* AI Openness Slider */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                     <label htmlFor="ai-openness" className="text-base font-medium text-gray-100">AI Response Style</label>
                     <span className="text-sm px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                         {getOpennessDescription(settings.aiOpenness)}
                     </span>
                 </div>
                 <input // Using native range slider
                     id="ai-openness"
                     type="range"
                     min="0"
                     max="100"
                     step="10" // Adjust step as needed
                     value={settings.aiOpenness ?? 50}
                     onChange={(e) => handleSettingChange('aiOpenness', parseInt(e.target.value, 10))}
                     className="w-full h-2.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
                 <div className="flex justify-between text-xs text-gray-400">
                     <span>Socratic Teaching</span>
                     <span>Direct Instruction</span>
                 </div>
                 {/* Display description based on current value */}
                 <p className="text-sm text-gray-400">{getOpennessDescription(settings.aiOpenness)}</p>
                 <p className="text-xs text-gray-500 mt-1">Adjust how much the AI guides versus directly answers.</p>
               </div>


              {/* Grade Level Select */}
              <div className="space-y-2">
                 <label htmlFor="grade-level" className="text-base font-medium text-gray-100">Default Grade Level</label>
                 <select // Using native select
                     id="grade-level"
                     value={settings.gradeLevel ?? '8'}
                     onChange={(e) => handleSettingChange('gradeLevel', e.target.value)}
                     className="w-full p-2.5 border rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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
                 <p className="text-xs text-gray-500 mt-1">Set the default grade level for AI interactions when no specific subject context applies.</p>
              </div>

              {/* Subjects Management */}
              {/* ... UI for subjects ... */}

              {/* Curriculum Management */}
              {/* ... UI for curriculum ... */}

              {/* Additional Context Textarea */}
               <div>
                 <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-300 mb-1">General Additional Context</label>
                 <Textarea
                   id="additionalContext"
                   value={settings.additionalContext || ''}
                   onChange={(e) => handleSettingChange('additionalContext', e.target.value)}
                   placeholder="Provide general instructions or context for the AI across all subjects..."
                   rows={4}
                   className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-2 px-3"
                 />
                 <p className="text-xs text-gray-500 mt-1">This context will be added to the AI's instructions unless overridden by subject-specific context.</p>
               </div>

              {/* Subject-Specific Context */}
              {/* ... UI for subjectContext ... */}


              {/* Save Button */}
              <div className="pt-4">
                 {successMessage && <p className="text-green-400 text-sm mb-2">{successMessage}</p>}
                 <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-md disabled:opacity-50">
                   {isSaving ? "Saving..." : "Save Settings"}
                 </Button>
              </div>
            </form>

            {/* Confirmation Dialog for Disabling AI */}
            <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
                <AlertDialogContent className="bg-neutral-800 border-neutral-700 text-gray-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disable AI Assistant?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to disable the AI assistant for all your students globally?
                            They will not be able to interact with it until you re-enable it here.
                            (You can still manage individual student access via the Student Activity monitor).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-gray-300 border-gray-600 hover:bg-gray-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDisableAi} className="bg-red-600 hover:bg-red-700 text-white">
                            Yes, Disable AI
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </> // Close fragment
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
