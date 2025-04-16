import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsControls } from '@/components/teacher/SettingsControls';
import { CurriculumUploader } from '@/components/teacher/CurriculumUploader';
import { StudentActivityMonitor } from '@/components/teacher/StudentActivityMonitor';
import { SubjectSettings } from '@/components/teacher/SubjectSettings';
import { BookOpen, Users, Info } from 'lucide-react';

import { AuthGuard } from '@/app/chat/AuthGuard';

export default function TeacherDashboardPage() {
  // Only authenticated users can access this page
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex flex-col h-full p-4 md:p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/90 px-4 py-2 rounded-lg border border-indigo-500/30 shadow-md shadow-indigo-500/20">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>Configure your AI teaching assistant and monitor student activity</span>
            </div>
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-gray-800/90 border border-indigo-500/30 rounded-xl overflow-hidden flex-wrap shadow-lg shadow-indigo-500/10">
              <TabsTrigger value="curriculum" className="flex items-center gap-2 h-12 border-r border-indigo-500/20 data-[state=active]:bg-indigo-600/30 data-[state=active]:text-indigo-300">
                <BookOpen className="h-4.5 w-4.5" />
                <span>Curriculum & Settings</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2 h-12 data-[state=active]:bg-indigo-600/30 data-[state=active]:text-indigo-300">
                <Users className="h-4.5 w-4.5" />
                <span>Student Activity</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubjectSettings className="shadow-lg shadow-indigo-500/10 border border-indigo-500/20 bg-gray-800/70" />
                <CurriculumUploader className="shadow-lg shadow-indigo-500/10 border border-indigo-500/20 bg-gray-800/70" />
              </div>
              <div>
                <SettingsControls className="shadow-lg shadow-indigo-500/10 border border-indigo-500/20 bg-gray-800/70" />
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6 mt-0">
              <div>
                <StudentActivityMonitor className="shadow-lg shadow-indigo-500/10 border border-indigo-500/20 bg-gray-800/70" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
