import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/app-sidebar';
import Topbar from '@/components/Topbar';
import { SidebarProvider } from '@/components/ui/sidebar';

const SuperAdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <SidebarProvider>
            <div className="h-screen bg-[#0A0A0A] flex w-full overflow-hidden">
                <AppSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={closeSidebar}
                    />
                )}

                <main className="flex-1 h-full flex flex-col w-full relative overflow-hidden">
                    <Topbar onMenuClick={toggleSidebar} />
                    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default SuperAdminLayout;
