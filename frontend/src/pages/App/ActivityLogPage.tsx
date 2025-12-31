import { useState, useEffect } from 'react';
import {
    Clock,
    Activity as ActivityIcon,
    Zap,
    User,
    Settings,
    ShieldAlert,
    LogIn,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { userService, type Activity } from '@/services/user.service';
import { formatDistanceToNow } from 'date-fns';

const ActivityLogPage = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchActivityLog();
    }, []);

    const fetchActivityLog = async () => {
        setLoading(true);
        try {
            const data = await userService.getActivityLog(50);
            setActivities(data.activities);
        } catch (err: any) {
            console.error('Failed to fetch activity log:', err);
            setError('Failed to load your recent activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'generation': return <Zap className="w-4 h-4 text-[#00FF88]" />;
            case 'login': return <LogIn className="w-4 h-4 text-blue-400" />;
            case 'profile_update': return <User className="w-4 h-4 text-purple-400" />;
            case 'settings_change': return <Settings className="w-4 h-4 text-orange-400" />;
            case 'security_alert': return <ShieldAlert className="w-4 h-4 text-red-400" />;
            default: return <ActivityIcon className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: Activity['status']) => {
        switch (status) {
            case 'success': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'failure': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.action.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || activity.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
            <GSAPTransition animation="fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Activity Log</h1>
                        <p className="text-gray-400 text-sm">Review your account and generation history in detail.</p>
                    </div>
                </div>
            </GSAPTransition>

            <GSAPTransition animation="fade-in-up" delay={0.1}>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00FF88] transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
                        />
                    </div>
                    <div className="flex bg-[#141414] border border-white/10 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                        {['all', 'generation', 'login', 'security_alert'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filterType === type
                                    ? 'bg-[#00FF88]/10 text-[#00FF88]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {type.charAt(0)?.toUpperCase() + type.slice(1).replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </GSAPTransition>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#00FF88] animate-spin mb-4" />
                    <p className="text-gray-400 text-sm animate-pulse">Retrieving logs...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchActivityLog}
                        className="px-6 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredActivities.length === 0 ? (
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ActivityIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No activity found</h3>
                    <p className="text-gray-400 text-sm">We couldn't find any activities matching your criteria.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredActivities.map((activity, index) => (
                        <GSAPTransition key={activity._id} animation="fade-in-up" delay={index * 0.05}>
                            <div className="group bg-[#141414] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all flex items-start gap-4">
                                <div className={`mt-1 p-2.5 rounded-xl border ${getStatusColor(activity.status)} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#00FF88] transition-colors">
                                            {activity.action}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                                        {activity.description}
                                    </p>

                                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                                                <span key={key} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400 lowercase italic">
                                                    {key}: <span className="text-gray-300 not-italic">{String(value)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden sm:flex items-center self-stretch bg-white/5 px-2 rounded-xl group-hover:bg-[#00FF88]/10 group-hover:text-[#00FF88] transition-all cursor-pointer">
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </GSAPTransition>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityLogPage;
