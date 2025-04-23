"use client";

"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsControls } from '@/components/teacher/SettingsControls';
import { CurriculumUploader } from '@/components/teacher/CurriculumUploader';
import { StudentActivityMonitor } from '@/components/teacher/StudentActivityMonitor';
import { SubjectSettings } from '@/components/teacher/SubjectSettings';
import { BookOpen, Users } from 'lucide-react';

import { AuthGuard } from '@/app/chat/AuthGuard';

export default function TeacherDashboardPage() {
  // Only authenticated users can access this page

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Minimal header */}
        <header className="w-full flex flex-row items-center justify-between py-4 px-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Principia AI</span>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold text-base">T</div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex flex-col min-h-[80vh] w-full px-2 md:px-8 py-10 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900 dark:to-gray-950 transition-all duration-300">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
          <hr className="border-gray-200 dark:border-gray-800 mb-8" />

          {/* Tabs for dashboard sections */}
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="flex mb-8 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-700 rounded-xl overflow-hidden shadow-lg">
              <TabsTrigger value="curriculum" className="flex items-center gap-2 px-8 py-4 text-lg font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-indigo-700 dark:data-[state=inactive]:text-indigo-200">
                <BookOpen className="h-5 w-5" />
                <span>Curriculum & Settings</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2 px-8 py-4 text-lg font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-indigo-700 dark:data-[state=inactive]:text-indigo-200">
                <Users className="h-5 w-5" />
                <span>Student Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                  <SubjectSettings />
                </div>
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                  <CurriculumUploader />
                </div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                <SettingsControls />
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-8">
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 shadow-xl p-6">
                <StudentActivityMonitor />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </DashboardLayout>
    </AuthGuard>
  );
}
