import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/app-sidebar';

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <AppSidebar />
            <main className="ml-60 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
