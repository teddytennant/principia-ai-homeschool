"use client"; // May need client-side features for filtering, sorting, real-time updates

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { User, Clock, MessageCircle, FileUp, LogOut, RefreshCw } from 'lucide-react'; // Icons
import { useTeacherSettings } from '@/lib/teacher-settings-context';
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/lib/supabaseClient';

// Placeholder data structure for student activity
interface ActivityLog {
    id: string;
    studentName: string;
    studentId: string; // Or some identifier
    activityType: 'chat_started' | 'message_sent' | 'file_uploaded' | 'session_ended';
    details: string; // e.g., message content snippet, file name
    timestamp: Date;
}

// Placeholder data structure for current students
interface Student {
    id: string;
    name: string;
    isActive: boolean;
}

// Function to fetch student activity data from Supabase
const fetchStudentActivity = async (): Promise<ActivityLog[]> => {
    try {
        console.log("Starting fetchStudentActivity...");
        // Fetch current students to map IDs to names
        const students = await fetchCurrentStudents();
        console.log("Fetched students:", students.length);
        
        if (students.length === 0) {
            console.log("No students found, skipping activity fetch.");
            return [];
        }

        const studentIds = students.map(student => student.id);

        // Fetch activity logs for all students associated with the teacher
        let activityData = null;
        let activityError = null;
        if (studentIds.length > 0) {
            try {
                const result = await supabase
                    .from('student_activity')
                    .select('id, student_id, activity_type')
                    .in('student_id', studentIds)
                    .limit(50); // Limit to the most recent 50 activities
                
                activityData = result.data;
                activityError = result.error;
            } catch (err) {
                console.error("Exception caught while fetching student activity from Supabase:", err);
                activityError = { 
                    message: err instanceof Error ? err.message : "Unknown error", 
                    details: "Exception in query execution", 
                    hint: "Check error details" 
                };
            }

            if (activityError) {
                console.error("Error fetching student activity from Supabase:", activityError.message, "Details:", activityError.details || "Not available", "Hint:", activityError.hint || "Not available");
                console.log("Returning empty array due to error in fetching activity data. This may be due to missing table or permissions.");
                return [];
            }
        } else {
            console.log("No student IDs available, skipping activity fetch.");
            return [];
        }

        if (!activityData || activityData.length === 0) {
            console.log("No activity data found for students.");
            return [];
        }

        console.log("Fetched activity data:", activityData);

        // Map the activity data to the ActivityLog interface
        const activityLogs: ActivityLog[] = activityData.map((activity: { id: string; student_id: string; activity_type: string }) => {
            const student = students.find(s => s.id === activity.student_id);
            return {
                id: activity.id,
                studentName: student ? student.name : `Student ID: ${activity.student_id.substring(0, 8)}...`,
                studentId: activity.student_id,
                activityType: activity.activity_type as 'chat_started' | 'message_sent' | 'file_uploaded' | 'session_ended',
                details: 'Details not available',
                timestamp: new Date() // Fallback to current date since created_at is not available
            };
        });

        return activityLogs;
    } catch (err) {
        console.error("Unexpected error fetching student activity:", err);
        console.log("Returning empty array due to unexpected error in fetching activity data. Check Supabase setup and permissions.");
        return [];
    }
};

// Function to fetch current students from Supabase based on teacher-student relationships
const fetchCurrentStudents = async (): Promise<Student[]> => {
    try {
        console.log("Starting fetchCurrentStudents...");
        // Fetch the current authenticated user's ID (teacher)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error("Error fetching current user:", userError);
            return [];
        }
        
        if (!user) {
            console.error("No authenticated user found.");
            return [];
        }
        
        console.log("Fetching students for teacher ID:", user.id, "Email:", user.email);
        
        // Fetch students related to the current teacher from teacher_student_relationships with a timeout
        const fetchPromise = supabase
            .from('teacher_student_relationships')
            .select('student_id, status')
            .eq('teacher_id', user.id);

        // Set a timeout of 10 seconds for the fetch operation
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Fetch operation timed out')), 10000);
        });

        let relData: Array<{ student_id: string; status: string }> | null = null;
        let relError: any = null;
        try {
            console.log("Attempting to fetch teacher-student relationships...");
            const result = await Promise.race([fetchPromise, timeoutPromise]) as { data: Array<{ student_id: string; status: string }> | null; error: any };
            relData = result.data;
            relError = result.error;
            console.log("Fetch result received:", { data: relData ? relData.length : null, error: relError });
        } catch (err) {
            console.error("Timeout or error fetching teacher-student relationships:", err instanceof Error ? err.message : 'Unknown error');
            relError = err;
            relData = null;
        }

        if (relError) {
            console.error("Error fetching teacher-student relationships from Supabase:", relError.message || "Timeout error");
            // Store error message to display in UI via state update (will be handled in component)
            return [];
        }

        console.log("Fetched teacher-student relationships:", relData, "Total count:", relData?.length || 0);

        if (relData && relData.length > 0) {
            // Map the fetched data to the Student interface
            // Fetch all student profiles in a single batch query to optimize
            const studentIds = relData.map(rel => rel.student_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, role')
                .in('id', studentIds);

            if (profilesError) {
                console.error("Error fetching student profiles:", profilesError.message, "Details:", profilesError.details, "Hint:", profilesError.hint);
                // Fall back to displaying student IDs with a clear indication
                return relData.map((rel: { student_id: string; status: string }) => ({
                    id: rel.student_id,
                    name: `Student ID: ${rel.student_id.substring(0, 8)}... (Profile Not Found)`,
                    isActive: rel.status === 'active'
                }));
            }

            console.log("Fetched student profiles:", profilesData, "Total profiles fetched:", profilesData?.length || 0);

            // Fetch from student_name_mapping as a fallback
            const { data: mappingData, error: mappingError } = await supabase
                .from('student_name_mapping')
                .select('student_id, first_name, last_name')
                .in('student_id', studentIds);

            if (mappingError) {
                console.error("Error fetching student name mappings:", mappingError.message, "Details:", mappingError.details, "Hint:", mappingError.hint);
            } else {
                console.log("Fetched student name mappings:", mappingData, "Total mappings fetched:", mappingData?.length || 0);
            }

            const students: Student[] = relData.map((rel: { student_id: string; status: string }) => {
                const profile = profilesData.find((p: { id: string; first_name?: string; last_name?: string }) => p.id === rel.student_id);
                if (profile) {
                    return {
                        id: rel.student_id,
                        name: `${profile.first_name || 'Unknown'} ${profile.last_name || ''}`.trim(),
                        isActive: rel.status === 'active'
                    };
                } else if (mappingData) {
                    const mapping = mappingData.find((m: { student_id: string; first_name?: string; last_name?: string }) => m.student_id === rel.student_id);
                    if (mapping) {
                        return {
                            id: rel.student_id,
                            name: `${mapping.first_name || 'Unknown'} ${mapping.last_name || ''}`.trim(),
                            isActive: rel.status === 'active'
                        };
                    }
                }
                console.log(`No profile or mapping found for student ${rel.student_id}`);
                return {
                    id: rel.student_id,
                    name: `Student ID: ${rel.student_id.substring(0, 8)}... (Profile Not Found)`,
                    isActive: rel.status === 'active'
                };
            });
            return students;
        }

        console.log("No student relationships found for this teacher in the database.");
        return [];
    } catch (err) {
        console.error("Unexpected error fetching students:", err);
        return [];
    }
};

const StudentActivityMonitor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
        const [currentStudents, setCurrentStudents] = useState<Student[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [fetchStatus, setFetchStatus] = useState<string | null>(null);
        const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
        const [activeFilter, setActiveFilter] = useState<string>('all');
        const { settings, updateStudentSettings } = useTeacherSettings();

        // Get unique students from activity logs for selection
        const uniqueStudents = Array.from(new Map(activityLogs.map(log => [log.studentId, log])).values());

        useEffect(() => {
            setIsLoading(true);
            setFetchStatus(null); // Reset fetch status
            Promise.all([fetchStudentActivity(), fetchCurrentStudents()])
                .then(([activityData, studentData]) => {
                    setActivityLogs(activityData);
                    setCurrentStudents(studentData);
                    setError(null);
                    if (studentData.length === 0) {
                        setFetchStatus("No student relationships found for this teacher in the database.");
                    }
                })
                .catch(err => {
                    console.error("Error fetching data:", err);
                    setError("Failed to load student data. This may be due to database access issues.");
                    setFetchStatus("Error fetching student data: " + (err.message || "Unknown error") + ". Check Supabase setup.");
                    setActivityLogs([]); // Clear logs on error
                    setCurrentStudents([]); // Clear students on error
                })
                .finally(() => {
                    setIsLoading(false);
                });
            // TODO: Implement real-time updates using WebSockets or polling for live student activity monitoring.
            // Placeholder for setting up real-time subscription or interval-based polling.
            /*
            const setupRealTimeUpdates = () => {
              // Example for WebSocket or Supabase real-time subscription.
              // supabase.from('student_activity').on('INSERT', handleNewActivity).subscribe();
              // Example for polling:
              // const interval = setInterval(fetchStudentActivity, 30000); // Refresh every 30 seconds.
              // return () => clearInterval(interval);
            };
            setupRealTimeUpdates();
            */
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
                    <button 
                        className={`px-3 py-1.5 text-xs rounded-md ${activeFilter === 'all' ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300' : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600'}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Activities
                    </button>
                    <button 
                        className={`px-3 py-1.5 text-xs rounded-md ${activeFilter === 'chat_sessions' ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300' : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600'}`}
                        onClick={() => setActiveFilter('chat_sessions')}
                    >
                        Chat Sessions
                    </button>
                    <button 
                        className={`px-3 py-1.5 text-xs rounded-md ${activeFilter === 'messages' ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300' : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600'}`}
                        onClick={() => setActiveFilter('messages')}
                    >
                        Messages
                    </button>
                    <button 
                        className={`px-3 py-1.5 text-xs rounded-md ${activeFilter === 'current_students' ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300' : 'bg-gray-800/30 border border-gray-700 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600'}`}
                        onClick={() => setActiveFilter('current_students')}
                    >
                        Current Students
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 mt-2">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                                <p className="text-gray-400 mt-3">Loading data...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                                <p className="font-medium">Error loading data</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && fetchStatus && (
                        <div className="flex items-center justify-center py-4">
                            <div className="text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-md px-4 py-3">
                                <p className="font-medium">Fetch Status</p>
                                <p className="text-sm mt-1">{fetchStatus}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <div className="space-y-2">
                            <h4 className="text-md font-semibold text-gray-200">Recent Activity</h4>
                            {activeFilter === 'current_students' || activeFilter === 'all' ? (
                                <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-300 mb-2">Current Students</h5>
                                    {currentStudents.length === 0 ? (
                                        <div className="text-center py-2">
                                            <p className="text-gray-500">No students found</p>
                                            <p className="text-xs text-gray-500 mt-1">No student relationships are recorded for your account. Students will appear here once they are connected to you.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {currentStudents.map(student => (
                                                <div key={student.id} className={`p-2 rounded-md shadow-sm transition-colors ${selectedStudentId === student.id ? 'bg-indigo-700/80' : 'bg-gray-700/60 hover:bg-gray-700/80'}`} onClick={() => setSelectedStudentId(student.id)}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center text-sm font-medium text-gray-200">
                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                            {student.name}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${student.isActive ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                                {student.isActive ? 'Active' : 'Pending'}
                                                            </span>
                                                            {!student.isActive && (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        const { error } = await supabase
                                                                            .from('teacher_student_relationships')
                                                                            .update({ status: 'active' })
                                                                            .eq('teacher_id', (await supabase.auth.getUser()).data.user?.id)
                                                                            .eq('student_id', student.id);
                                                                        if (error) {
                                                                            console.error("Error activating student relationship:", error);
                                                                            alert("Failed to activate student relationship.");
                                                                        } else {
                                                                            setCurrentStudents(currentStudents.map(s => 
                                                                                s.id === student.id ? { ...s, isActive: true } : s
                                                                            ));
                                                                            alert("Student relationship activated.");
                                                                        }
                                                                    }}
                                                                    className="text-xs px-2 py-0.5 rounded-md transition-colors bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
                                                                >
                                                                    Activate
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    console.log("Toggling AI for student:", student.id);
                                                                    updateStudentSettings(student.id, { isAiEnabled: !(settings.studentSettings[student.id]?.isAiEnabled ?? settings.isAiEnabled) });
                                                                    console.log("Updated settings:", settings);
                                                                    // Note: This action only toggles AI access and does not affect the teacher-student relationship status.
                                                                }}
                                                                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${settings.studentSettings[student.id]?.isAiEnabled ?? settings.isAiEnabled ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30' : 'bg-green-600/20 text-green-300 hover:bg-green-600/30'}`}
                                                            >
                                                                {settings.studentSettings[student.id]?.isAiEnabled ?? settings.isAiEnabled ? 'Pause' : 'Resume'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                            {activeFilter !== 'current_students' ? (
                                activityLogs.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No recent student activity</p>
                                        <p className="text-xs text-gray-500 mt-1">Activity will appear here when students interact with the AI</p>
                                    </div>
                                ) : (
                                    activityLogs
                                        .filter(log => {
                                            if (activeFilter === 'all') return true;
                                            if (activeFilter === 'chat_sessions') return log.activityType === 'chat_started';
                                            if (activeFilter === 'messages') return log.activityType === 'message_sent';
                                            return true;
                                        })
                                        .map(log => (
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
                                        ))
                                )
                            ) : null}
                            <div className="mt-3 text-center">
                                <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                     
                                </button>
                            </div>
                        </div>
                    )}
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
