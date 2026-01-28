import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, HelpCircle, BookOpen, ChevronDown, Menu, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FeedbackModal from './FeedbackModal';
import NotificationDropdown from './NotificationDropdown';

interface TopbarProps {
    onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-white/10 bg-[#0A0A0A]/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden transition-colors rounded-lg hover:bg-white/5"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Left side (Breadcrumbs or Page Title - placeholder for now) */}
                <div className="text-gray-400 text-sm hidden sm:block">
                    {/* Breadcrumbs could go here */}
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-4">

                {/* Website Link */}
                <a
                    href="https://nebula-fe.vercel.app" // Updated marketing site URL
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    title="Go to Website"
                >
                    <BookOpen className="w-5 h-5" />
                </a>

                {/* Feedback Module */}
                <FeedbackModal />

                {/* Notifications Module */}
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center text-[#0A0A0A] font-bold text-sm">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-white group-hover:text-[#00FF88] transition-colors">{user?.name || 'User'}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#141414] border border-white/10 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm font-medium text-white">{user?.email || 'user@example.com'}</p>
                            </div>

                            <div className="p-1">
                                <Link
                                    to="/app/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                {user?.role === 'super_admin' && (
                                    <Link
                                        to={window.location.pathname.startsWith('/admin') ? '/app/dashboard' : '/admin/dashboard'}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#00FF88] hover:bg-[#00FF88]/10 rounded-lg transition-colors font-bold"
                                    >
                                        <Crown className="w-4 h-4" />
                                        {window.location.pathname.startsWith('/admin') ? 'Return to App' : 'Administration'}
                                    </Link>
                                )}
                                <Link
                                    to="/resources"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Knowledge & Resources
                                </Link>
                                <Link
                                    to="/help"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    Help & Support
                                </Link>
                            </div>

                            <div className="h-px bg-white/5 my-1" />

                            <div className="p-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
