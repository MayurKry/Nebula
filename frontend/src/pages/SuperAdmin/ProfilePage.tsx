import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/api/admin.api';
import {
    Shield, Mail, Globe, Lock, Activity,
    Server, Fingerprint, AlertTriangle, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [systemStats, setSystemStats] = useState({ health: '-', nodes: '-', alerts: 0 });

    useEffect(() => {
        fetchSystemStatus();
    }, []);

    const fetchSystemStatus = async () => {
        try {
            const res = await adminApi.getSystemHealth();
            setSystemStats(res.data.data);
        } catch (error) {
            console.error("Failed to fetch system status", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleEnable2FA = () => {
        toast.info("2FA Setup initiated. Please check your email for the code.");
    };

    const handleLockdown = () => {
        toast.error("EMERGENCY LOCKDOWN PROTOCOL INITIATED. All non-admin sessions suspended.", { duration: 5000 });
        // In real app, call adminApi.triggerLockdown()
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 p-4 md:p-8">
            <GSAPTransition animation="fade-in-up">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Admin Profile</h1>
                        <p className="text-[#8E8E93] text-lg font-medium">System Administrator Identity & Security</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 text-sm font-bold uppercase tracking-wider">Super Admin Access</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-red-400 hover:text-red-300 md:hidden flex items-center gap-2 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </GSAPTransition>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identity Card */}
                <GSAPTransition animation="fade-in-up" delay={0.1}>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all duration-500" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-white/10 flex items-center justify-center shadow-2xl">
                                        <span className="text-4xl font-black text-white">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 bg-[#00FF88] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border-4 border-[#141414]">
                                        Online
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 w-full text-center md:text-left">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{user?.firstName} {user?.lastName}</h2>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                            <div className="flex items-center gap-2 text-[#8E8E93]">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm font-medium">{user?.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#8E8E93]">
                                                <Globe className="w-4 h-4" />
                                                <span className="text-sm font-medium">Global Admin</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5 text-left">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-1">Role Permission</div>
                                            <div className="text-white font-mono text-sm">ROOT_ACCESS</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-1">Session ID</div>
                                            <div className="text-white font-mono text-sm truncate">{user?._id || 'sess_unknown'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-purple-400" />
                                Security Configuration
                            </h3>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                                            <Fingerprint className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Two-Factor Authentication</div>
                                            <div className="text-[#8E8E93] text-xs">Recommended for Super Admin accounts</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleEnable2FA}
                                        className="w-full sm:w-auto px-4 py-2 bg-purple-500/20 text-purple-400 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-purple-500/30 transition-colors"
                                    >
                                        Enable
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Emergency Lockdown</div>
                                            <div className="text-[#8E8E93] text-xs">Suspend all non-admin access immediately</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLockdown}
                                        className="w-full sm:w-auto px-4 py-2 bg-red-500/10 text-red-500 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                                    >
                                        Trigger
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </GSAPTransition>

                {/* System Sidebar */}
                <GSAPTransition animation="fade-in-up" delay={0.2}>
                    <div className="space-y-6">
                        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6">
                            <h3 className="text-sm font-black text-[#8E8E93] uppercase tracking-widest mb-6">System Status</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl bg-[#00FF88]/10`}>
                                        <Activity className={`w-5 h-5 text-[#00FF88]`} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{systemStats.health}</div>
                                        <div className="text-[#8E8E93] text-xs font-bold uppercase tracking-wide">System Health</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl bg-[#00FF88]/10`}>
                                        <Server className={`w-5 h-5 text-[#00FF88]`} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{systemStats.nodes}</div>
                                        <div className="text-[#8E8E93] text-xs font-bold uppercase tracking-wide">Active Nodes</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${systemStats.alerts > 0 ? 'bg-red-500/10' : 'bg-[#00FF88]/10'}`}>
                                        <Shield className={`w-5 h-5 ${systemStats.alerts > 0 ? 'text-red-500' : 'text-[#00FF88]'}`} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{systemStats.alerts}</div>
                                        <div className="text-[#8E8E93] text-xs font-bold uppercase tracking-wide">Security Alerts</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Audit Logs</h3>
                            <p className="text-sm text-[#8E8E93] mb-4">View detailed records of all administrative actions performed by this account.</p>
                            <button
                                onClick={() => navigate('/admin/observability/logs')}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-colors border border-white/10"
                            >
                                View My Logs
                            </button>
                        </div>
                    </div>
                </GSAPTransition>
            </div>
        </div>
    );
};

export default ProfilePage;
