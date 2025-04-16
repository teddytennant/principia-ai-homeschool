import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className={cn(
            "flex h-screen w-full text-sm",
            "bg-neutral-900 text-gray-100" // Dark background, light text
        )}>
            {/* Placeholder for a potential Teacher-specific Sidebar - can be added later */}
            {/* <aside className="w-64 flex-shrink-0 bg-neutral-800 border-r border-neutral-700 p-4">
                Teacher Sidebar Content
            </aside> */}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-auto">
                {/* Consider adding a standard Header component here if needed */}
                {/* For now, padding is added within the page */}
                {children}
            </main>
        </div>
    );
};
