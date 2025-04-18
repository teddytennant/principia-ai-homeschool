"use client"; // May need client-side features for filtering, sorting, real-time updates

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { User, Clock, MessageCircle, FileUp, LogOut, RefreshCw, Settings } from 'lucide-react'; // Icons
import { useTeacherSettings } from '@/lib/teacher-settings-context';
import { Switch } from "@/components/ui/switch";

 // Placeholder data structure for student activity
interface ActivityLog {
    id: string;
    studentName: string;
    studentId: string; // Or some identifier
    activityType: 'chat_started' | 'message_sent' | 'file_uploaded' | 'session_ended';
    details: string; // e.g., message content snippet, file name
    timestamp: Date;
}

// Placeholder function to fetch activity data - replace with actual API call
const fetchStudentActivity = async (): Promise<ActivityLog[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock data
    return [
        { id: 'act1', studentName: 'Alice Smith', studentId: 's123', activityType: 'chat_started' as const, details: 'Topic: Photosynthesis', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { id: 'act2', studentName: 'Bob Johnson', studentId: 's456', activityType: 'chat_started' as const, details: 'Topic: World War II Causes', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
        { id: 'act3', studentName: 'Alice Smith', studentId: 's123', activityType: 'message_sent' as const, details: 'What are chloroplasts?', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
        { id: 'act4', studentName: 'Charlie Brown', studentId: 's789', activityType: 'file_uploaded' as const, details: 'History Essay Draft.docx', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
        { id: 'act5', studentName: 'Bob Johnson', studentId: 's456', activityType: 'message_sent' as const, details: 'What was the Treaty of Versailles?', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
        { id: 'act6', studentName: 'Alice Smith', studentId: 's123', activityType: 'session_ended' as const, details: 'Duration: 15 mins', timestamp: new Date(Date.now() - 1 * 60 * 1000) },
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first
};

const StudentActivityMonitor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
        const { settings, updateStudentSettings } = useTeacherSettings();

        // Get unique students from activity logs for selection
        const uniqueStudents = Array.from(new Map(activityLogs.map(log => [log.studentId, log])).values());

        useEffect(() => {
            setIsLoading(true);
            fetchStudentActivity()
                .then(data => {
                    setActivityLogs(data);
                    setError(null);
                })
                .catch(err => {
                    console.error("Error fetching student activity:", err);
                    setError("Failed to load student activity.");
                    setActivityLogs([]); // Clear logs on error
                })
                .finally(() => {
                    setIsLoading(false);
                });
            // TODO: Consider adding real-time updates (e.g., WebSockets, polling)
        }, []); // Fetch on component mount

        const formatTimestamp = (date: Date) => {
            // Simple time ago format (can be improved with a library like date-fns)
            const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + " years ago";
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + " months ago";
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + " days ago";
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + " hours ago";
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + " minutes ago";
            return Math.floor(seconds) + " seconds ago";
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "p-4 border rounded-md bg-gray-800/50 border-gray-700/50 space-y-4",
                    className
                )}
                {...props}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">Student Activity Feed</h3>
                        <p className="text-sm text-gray-400">Monitor student interactions with the AI assistant</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setIsLoading(true);
                                fetchStudentActivity()
                                    .then(data => {
                                        setActivityLogs(data);
                                        setError(null);
                                    })
                                    .catch(err => {
                                        console.error("Error fetching student activity:", err);
                                        setError("Failed to load student activity.");
                                    })
                                    .finally(() => {
                                        setIsLoading(false);
                                    });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Refresh</span>
                        </button>
                        {selectedStudentId && (
                            <button 
                                onClick={() => setSelectedStudentId(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                            >
                                <span>Clear Selection</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter options */}
                <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 text-xs bg-indigo-600/20 border border-indigo-500 text-indigo-300 rounded-md">
                        All Activities
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600 rounded-md transition-colors">
                        Chat Sessions
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600 rounded-md transition-colors">
                        Messages
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600 rounded-md transition-colors">
                        File Uploads
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 mt-2">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                                <p className="text-gray-400 mt-3">Loading activity...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                                <p className="font-medium">Error loading activity</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && activityLogs.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-gray-500">No recent student activity</p>
                                <p className="text-xs text-gray-500 mt-1">Activity will appear here when students interact with the AI</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && activityLogs.map(log => (
                        <div key={log.id} className={`p-3.5 rounded-md shadow-sm transition-colors ${selectedStudentId === log.studentId ? 'bg-indigo-700/80' : 'bg-gray-700/60 hover:bg-gray-700/80'}`} onClick={() => setSelectedStudentId(log.studentId)}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center text-sm font-medium text-gray-200">
                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                    {log.studentName}
                                </span>
                                <span className="flex items-center text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                    <Clock className="h-3 w-3 mr-1.5" />
                                    {formatTimestamp(log.timestamp)}
                                </span>
                            </div>
                            <div className="flex items-start pl-6">
                                {log.activityType === 'chat_started' && <MessageCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />}
                                {log.activityType === 'message_sent' && <MessageCircle className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />}
                                {log.activityType === 'file_uploaded' && <FileUp className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />}
                                {log.activityType === 'session_ended' && <LogOut className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />}
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-0.5">
                                        {log.activityType.replace('_', ' ')}
                                    </p>
                                    <p className="text-sm text-gray-300" title={log.details}>
                                        {log.details}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 pl-12">
                                <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {selectedStudentId && (
                    <div className="mt-4 p-4 border rounded-md bg-gray-800/50 border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-gray-200">Settings for {uniqueStudents.find(s => s.studentId === selectedStudentId)?.studentName || 'Selected Student'}</h4>
                            <button className="text-xs text-gray-400 hover:text-gray-300" onClick={() => setSelectedStudentId(null)}>Close</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Enable AI Assistant</label>
                                    <p className="text-xs text-gray-500 mt-1">Allow this student to interact with the AI</p>
                                </div>
                                <Switch
                                    checked={settings.studentSettings[selectedStudentId]?.isAiEnabled ?? settings.isAiEnabled}
                                    onCheckedChange={(checked) => {
                                        updateStudentSettings(selectedStudentId, { isAiEnabled: checked === true });
                                    }}
                                    aria-label="Enable AI Assistant for this student"
                                    className="data-[state=checked]:bg-indigo-600"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-300">AI Response Style</label>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                                        {(settings.studentSettings[selectedStudentId]?.aiOpenness ?? settings.aiOpenness) < 20 ? "Strongly Socratic" :
                                         (settings.studentSettings[selectedStudentId]?.aiOpenness ?? settings.aiOpenness) < 40 ? "Mostly Socratic" :
                                         (settings.studentSettings[selectedStudentId]?.aiOpenness ?? settings.aiOpenness) < 60 ? "Balanced" :
                                         (settings.studentSettings[selectedStudentId]?.aiOpenness ?? settings.aiOpenness) < 80 ? "Mostly Direct" : "Strongly Direct"}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.studentSettings[selectedStudentId]?.aiOpenness ?? settings.aiOpenness}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        updateStudentSettings(selectedStudentId, { aiOpenness: value });
                                    }}
                                    className="w-full h-2.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Socratic Teaching</span>
                                    <span>Direct Instruction</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">Grade Level</label>
                                <select
                                    value={settings.studentSettings[selectedStudentId]?.gradeLevel ?? settings.gradeLevel}
                                    onChange={(e) => {
                                        updateStudentSettings(selectedStudentId, { gradeLevel: e.target.value });
                                    }}
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

StudentActivityMonitor.displayName = "StudentActivityMonitor";

export { StudentActivityMonitor };
