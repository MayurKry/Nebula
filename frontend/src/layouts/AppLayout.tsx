import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/app-sidebar';
import Topbar from '@/components/Topbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <div className="min-h-screen bg-[#0A0A0A] flex w-full">
                    <AppSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                    {/* Overlay for mobile */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={closeSidebar}
                        />
                    )}

                    <main className="flex-1 min-h-screen flex flex-col w-full">
                        <Topbar onMenuClick={toggleSidebar} />
                        <div className="flex-1 overflow-x-hidden">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    );
};

export default AppLayout;

