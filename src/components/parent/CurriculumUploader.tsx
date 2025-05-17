"use client"; // Required for state and event handlers

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react'; // Icons for UI + Loader
import { useTeacherSettings, CurriculumItem } from '@/lib/teacher-settings-context';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs
import { supabase } from '@/lib/supabaseClient'; // Import supabase to get JWT

 // Local interface for files being uploaded (before content extraction)
interface UploadingFile {
    id: string;
    name: string;
    size: number;
    type: string;
    file: File; // The actual file object for content extraction
    status: 'pending' | 'uploading' | 'summarizing' | 'failed'; // Add status
    errorMessage?: string; // Optional error message
}

type CurriculumUploaderProps = React.HTMLAttributes<HTMLDivElement>;

const CurriculumUploader = React.forwardRef<HTMLDivElement, CurriculumUploaderProps>(
    ({ className, ...props }, ref) => {
        // Use the teacher settings context
        const { settings, addCurriculumItem, removeCurriculumItem } = useTeacherSettings();
        const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
        const [isDragging, setIsDragging] = useState(false);

        // Helper to update the status of a specific uploading file
        const updateFileStatus = (id: string, status: UploadingFile['status'], errorMessage?: string) => {
            setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, status, errorMessage } : f));
        };

        const processFiles = useCallback(async (files: File[]) => {
            // Get JWT token for API calls
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                console.error("Authentication error:", sessionError?.message || 'No session');
                // Handle error appropriately, maybe show a message to the user
                return;
            }
            const token = session.access_token;


            const newUploadingFiles = files.map((file) => ({
                id: uuidv4(),
                name: file.name,
                size: file.size,
                type: file.type,
                file,
                status: 'pending' as 'pending', // Initial status
            }));

            setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

            const readFileContent = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            };

            // Process each file: read, summarize, add to context
            for (const uploadingFile of newUploadingFiles) {
                try {
                    updateFileStatus(uploadingFile.id, 'uploading'); // Mark as uploading (reading content)
                    const fullContent = await readFileContent(uploadingFile.file);

                    // Check content length before summarizing
                    if (fullContent.length < 50) {
                        throw new Error("Content too short to summarize effectively.");
                    }

                    updateFileStatus(uploadingFile.id, 'summarizing'); // Mark as summarizing

                    // Call the summarization API
                    const summarizeResponse = await fetch('/api/summarize', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` // Pass JWT
                        },
                        body: JSON.stringify({ content: fullContent }),
                    });

                    const summarizeResult = await summarizeResponse.json();

                    if (!summarizeResponse.ok) {
                        throw new Error(summarizeResult.error?.message || `Summarization failed (${summarizeResponse.status})`);
                    }

                    const summary = summarizeResult.summary;

                    // Create a curriculum item with the SUMMARY
                    const curriculumItem: CurriculumItem = {
                        id: uploadingFile.id,
                        name: uploadingFile.name,
                        content: summary, // Store the summary, not the full content
                        type: uploadingFile.type,
                        size: uploadingFile.size, // Keep original size for info
                        uploadedAt: new Date()
                    };
                    addCurriculumItem(curriculumItem); // Add item with summary to context

                    // Remove from uploading list on success
                    setUploadingFiles(prev => prev.filter(file => file.id !== uploadingFile.id));

                } catch (error: any) {
                    console.error(`Error processing file ${uploadingFile.name}:`, error);
                    updateFileStatus(uploadingFile.id, 'failed', error.message || "An unknown error occurred");
                    // Keep the failed file in the list to show the error
                }
            }
        }, [addCurriculumItem, setUploadingFiles]); // Dependencies

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) {
                processFiles(Array.from(event.target.files));
            }
            // Reset input value to allow uploading the same file again
            event.target.value = '';
        };

        const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
            if (event.dataTransfer.files) {
                processFiles(Array.from(event.dataTransfer.files));
            }
        }, [processFiles]); // Include processFiles as a dependency

        const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
        }, []);

        const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
        }, []);

        const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            // Check if the leave target is outside the drop zone
             if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setIsDragging(false);
            }
        }, []);

        const removeFile = (id: string) => {
            // Remove from context
            removeCurriculumItem(id);
        };

        // Helper to format file size
        const formatBytes = (bytes: number, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "p-4 border rounded-md bg-gray-800/50 border-gray-700/50 space-y-6",
                    className
                )}
                {...props}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">Upload Curriculum</h3>
                        <p className="text-sm text-gray-400">Add curriculum materials for the AI to reference</p>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    className={cn(
                        "border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-all duration-200",
                        isDragging ? "bg-gray-700/50 border-indigo-500 shadow-md" : "bg-gray-800/30"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('file-upload-input')?.click()} // Trigger hidden input
                >
                    <input
                        id="file-upload-input"
                        type="file"
                        multiple // Allow multiple files
                        onChange={handleFileChange}
                        className="hidden"
                        // Consider adding 'accept' attribute for specific file types
                        // accept=".pdf,.doc,.docx,.txt"
                    />
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-300 font-medium">
                        {isDragging ? "Drop files here" : "Drag & drop curriculum files here"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
                    <div className="mt-4 inline-block px-3 py-1.5 bg-gray-800/80 rounded-md">
                        <p className="text-xs text-gray-400">Supported formats: PDF, DOCX, TXT</p>
                    </div>
                </div>

                {/* Files being processed */}
                {uploadingFiles.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-gray-700 mt-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">Processing Files</h4>
                            {/* Optional: Add overall progress if needed */}
                        </div>
                        {/* Removed overall progress bar, showing individual status instead */}
                        <ul className="max-h-48 overflow-y-auto space-y-1 pr-2">
                            {uploadingFiles.map((file) => (
                                <li
                                    key={file.id}
                                    className="flex items-center justify-between p-3 bg-gray-700/60 rounded-md text-sm shadow-sm"
                                >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="truncate text-gray-200" title={file.name}>{file.name}</span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {file.size ? `(${formatBytes(file.size)})` : ''}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 text-xs flex items-center gap-1.5">
                                        {file.status === 'pending' && <span className="text-gray-400">Pending...</span>}
                                        {file.status === 'uploading' && <span className="text-blue-400">Reading...</span>}
                                        {file.status === 'summarizing' && (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                                                <span className="text-indigo-400">Summarizing...</span>
                                            </>
                                        )}
                                        {file.status === 'failed' && (
                                            <span className="text-red-400" title={file.errorMessage}>Failed</span>
                                        )}
                                        {/* Button to remove failed uploads */}
                                        {file.status === 'failed' && (
                                             <button
                                                onClick={() => setUploadingFiles(prev => prev.filter(f => f.id !== file.id))}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-600/30"
                                                aria-label={`Remove failed upload ${file.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Uploaded Files List */}
                {settings.curriculum.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-gray-700 mt-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">Uploaded Curriculum</h4>
                            <span className="text-xs text-indigo-400">{settings.curriculum.length} document(s)</span>
                        </div>
                        <ul className="max-h-48 overflow-y-auto space-y-1 pr-2">
                            {settings.curriculum.map((file) => (
                                <li
                                    key={file.id}
                                    className="flex items-center justify-between p-3 bg-gray-700/60 rounded-md text-sm shadow-sm"
                                >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="truncate text-gray-200" title={file.name}>{file.name}</span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {file.size ? `(${formatBytes(file.size)})` : ''}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 rounded-full hover:bg-gray-600/30"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {/* TODO: Add overall progress indicator if uploading multiple files */}
            </div>
        );
    }
);

CurriculumUploader.displayName = "CurriculumUploader";

export { CurriculumUploader };
