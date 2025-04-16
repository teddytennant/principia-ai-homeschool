"use client"; // Required for state and event handlers

import React from 'react';
import { cn } from '@/lib/utils';
import { useTeacherSettings } from '@/lib/teacher-settings-context';
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Assuming AlertDialog exists
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";
// import { Label } from "@/components/ui/label";

interface SettingsControlsProps extends React.HTMLAttributes<HTMLDivElement> {}

// Placeholder data - replace with actual grade levels
const gradeLevels = [
    { value: 'k', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' },
    { value: 'higher_ed', label: 'Higher Education' },
];

const SettingsControls = React.forwardRef<HTMLDivElement, SettingsControlsProps>(
    ({ className, ...props }, ref) => {
        // Use the teacher settings context
        const { settings, updateSettings } = useTeacherSettings();
        const [showDisableConfirm, setShowDisableConfirm] = React.useState<boolean>(false);

        const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
            updateSettings({ gradeLevel: event.target.value });
            console.log("Grade level changed to:", event.target.value);
        };

        const handleAiToggleRequest = (checked: boolean) => {
            if (!checked) {
                // If attempting to disable, show confirmation dialog
                setShowDisableConfirm(true);
            } else {
                // If enabling, do it directly
                updateSettings({ isAiEnabled: true });
                console.log("AI Enabled:", true);
            }
        };

        const confirmDisableAi = () => {
            updateSettings({ isAiEnabled: false });
            setShowDisableConfirm(false);
            console.log("AI Enabled:", false);
        };

        const handleOpennessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(event.target.value, 10);
            updateSettings({ aiOpenness: value });
            console.log("AI Openness changed to:", value);
        };

        // Helper function for slider description
        const getOpennessDescription = (value: number): string => {
            if (value < 20) return "Strongly Socratic: AI primarily asks guiding questions.";
            if (value < 40) return "Mostly Socratic: AI favors questions but offers hints.";
            if (value < 60) return "Balanced: AI mixes questions and explanations.";
            if (value < 80) return "Mostly Direct: AI provides explanations but encourages reflection.";
            return "Strongly Direct: AI provides direct answers and explanations readily.";
        };


        return (
            <> {/* Use Fragment to wrap component and dialog */}
            <div
                ref={ref}
                className={cn(
                    "p-4 border rounded-md bg-gray-800/50 border-gray-700/50 space-y-6",
                    className
                )}
                {...props}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">AI Settings</h3>
                        <p className="text-sm text-gray-400">Configure how the AI assistant interacts with students</p>
                    </div>
                </div>

                {/* Grade Level Selection */}
                <div className="space-y-3 pb-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <label htmlFor="grade-level" className="block text-sm font-medium text-gray-300">Grade Level</label>
                        <span className="text-xs text-indigo-400">
                            {settings.gradeLevel === 'k' ? 'Kindergarten' : 
                             settings.gradeLevel === 'higher_ed' ? 'Higher Education' : 
                             `${settings.gradeLevel}th Grade`}
                        </span>
                    </div>
                    <select
                        id="grade-level"
                        value={settings.gradeLevel}
                        onChange={handleGradeChange}
                        className="w-full p-2.5 border rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    >
                        {gradeLevels.map((grade) => (
                            <option key={grade.value} value={grade.value}>
                                {grade.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* AI On/Off Toggle */}
                <div className="py-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="ai-toggle" className="text-sm font-medium text-gray-300">Enable AI Assistant</label>
                            <p className="text-xs text-gray-500 mt-1">Allow students to interact with the AI</p>
                        </div>
                        <Switch
                            id="ai-toggle"
                            checked={settings.isAiEnabled}
                            onCheckedChange={handleAiToggleRequest}
                            aria-label="Enable AI Assistant"
                            className="data-[state=checked]:bg-indigo-600"
                        />
                    </div>
                </div>

                {/* AI Openness Slider */}
                <div className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                        <label htmlFor="ai-openness" className="block text-sm font-medium text-gray-300">
                            AI Response Style
                        </label>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {settings.aiOpenness < 20 ? "Strongly Socratic" :
                             settings.aiOpenness < 40 ? "Mostly Socratic" :
                             settings.aiOpenness < 60 ? "Balanced" :
                             settings.aiOpenness < 80 ? "Mostly Direct" : "Strongly Direct"}
                        </span>
                    </div>
                    
                    <input
                        type="range"
                        id="ai-openness"
                        min="0"
                        max="100"
                        value={settings.aiOpenness}
                        onChange={handleOpennessChange}
                        className="w-full h-2.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Socratic Teaching</span>
                        <span>Direct Instruction</span>
                    </div>
                    
                    {/* Descriptive text based on slider value */}
                    <div className="mt-2 p-3 bg-gray-800/80 border border-gray-700/80 rounded-md">
                        <p className="text-sm text-gray-300">
                            {getOpennessDescription(settings.aiOpenness)}
                        </p>
                    </div>
                </div>

                {/* TODO: Add save button or indicate auto-save */}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
                <AlertDialogContent className="bg-neutral-800 border-neutral-700 text-gray-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disable AI Assistant?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to disable the AI assistant for students?
                            They will not be able to interact with it until you re-enable it.
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
            </> // Close Fragment
        );
    }
);

SettingsControls.displayName = "SettingsControls";

export { SettingsControls };
