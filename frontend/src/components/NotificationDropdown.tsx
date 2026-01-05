import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';

interface Notification {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    link?: string;
}

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/support/notifications');
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put('/support/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const markAsRead = async (id: string, isAlreadyRead: boolean) => {
        if (isAlreadyRead) return;
        try {
            await axiosInstance.put(`/support/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5 relative group"
            >
                <Bell className={`w-5 h-5 transition-transform ${isOpen ? 'scale-110' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#00FF88] text-[#0A0A0A] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0A0A] group-hover:scale-110 transition-transform">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div>
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                                You have {unreadCount} unread alerts
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold text-[#00FF88] hover:text-[#00CC6A] uppercase tracking-widest transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="py-20 text-center">
                                <div className="w-8 h-8 border-2 border-[#00FF88]/30 border-t-[#00FF88] rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Loading alerts...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => markAsRead(notification._id, notification.read)}
                                        className={`p-5 transition-colors cursor-pointer group hover:bg-white/[0.02] ${!notification.read ? 'bg-[#00FF88]/[0.02]' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${!notification.read ? 'border-[#00FF88]/20 bg-[#00FF88]/10' : 'border-white/5 bg-white/5'}`}>
                                                    {getTypeIcon(notification.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                    {notification.description}
                                                </p>
                                                {notification.link && (
                                                    <Link
                                                        to={notification.link}
                                                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00FF88] mt-3 uppercase tracking-widest hover:gap-2 transition-all"
                                                    >
                                                        View Details
                                                        <Check className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>
                                            {!notification.read && (
                                                <div className="mt-1.5">
                                                    <div className="w-2 h-2 bg-[#00FF88] rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <Search className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                                <p className="text-sm text-gray-600 font-medium">All caught up!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                        <Link
                            to="/app/activity"
                            className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                        >
                            View All Activity
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
