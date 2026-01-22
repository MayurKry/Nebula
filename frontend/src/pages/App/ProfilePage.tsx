import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/api/user.api';
import {
    Mail, Shield, CreditCard,
    LogOut, ChevronRight, User, Key, X, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [stats, setStats] = useState<any>(null);

    // Edit States
    const [editingProfile, setEditingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            });
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await userApi.getProfile();
            setStats(res.data.data.stats);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userApi.updateProfile(profileData);
            toast.success("Profile updated successfully");
            setEditingProfile(false);
            // Ideally force refresh user context here
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await userApi.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
            toast.success("Password changed successfully");
            setChangingPassword(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        }
    };

    const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");
    const fullName = `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim();

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Identity Card */}
                        <GSAPTransition animation="fade-in-up">
                            <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />

                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl md:text-4xl font-bold shadow-2xl border-4 border-[#141414] relative z-10">
                                        {initials}
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#00FF88] border-4 border-[#141414] rounded-full z-20" />
                                </div>

                                <div className="flex-1 text-center sm:text-left z-10 w-full">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">{fullName}</h2>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#00FF88] mb-6">
                                        {user?.role === 'tenant_admin' ? 'Organization Admin' : 'Creator'}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-gray-400">
                                        <div className="flex items-center gap-2 justify-center sm:justify-start bg-black/20 p-2 rounded-lg">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-center sm:justify-start bg-black/20 p-2 rounded-lg">
                                            <Shield className="w-4 h-4 text-[#00FF88]" />
                                            <span>Verified Account</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GSAPTransition>

                        {/* Forms or Settings Menu */}
                        <GSAPTransition animation="fade-in-up" delay={0.1}>
                            <div className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden">
                                {editingProfile ? (
                                    <div className="p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold">Edit Profile</h3>
                                            <button onClick={() => setEditingProfile(false)}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                                        </div>
                                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-gray-500">First Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.firstName}
                                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FF88] focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.lastName}
                                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FF88] focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-4 flex justify-end">
                                                <button type="submit" className="px-6 py-2 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00FF88]/90">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : changingPassword ? (
                                    <div className="p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold">Change Password</h3>
                                            <button onClick={() => setChangingPassword(false)}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                                        </div>
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-gray-500">Old Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.oldPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FF88] focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-gray-500">New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FF88] focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-gray-500">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#00FF88] focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="pt-4 flex justify-end">
                                                <button type="submit" className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
                                                    Update Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        <div className="p-4 bg-white/5 border-b border-white/5 text-xs font-bold uppercase tracking-wider text-gray-400">Account Settings</div>

                                        <button onClick={() => setEditingProfile(true)} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white mb-1">Personal Information</div>
                                                    <div className="text-sm text-gray-500">Update your name and contact details</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                        </button>

                                        <button onClick={() => setChangingPassword(true)} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                                                    <Key className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white mb-1">Security</div>
                                                    <div className="text-sm text-gray-500">Change password and 2FA</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                        </button>

                                        <button className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                                    <CreditCard className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white mb-1">Billing & Plan</div>
                                                    <div className="text-sm text-gray-500">Manage subscription and billing history</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </GSAPTransition>
                    </div>

                    {/* Sidebar */}
                    <GSAPTransition animation="fade-in-up" delay={0.2}>
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Resource Usage</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-gray-300">Credits</span>
                                            <span className="text-white font-mono">{stats?.credits || user?.credits || 0} / 1000</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#00FF88] rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(((stats?.credits || user?.credits || 0) / 1000) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-gray-300">Storage</span>
                                            <span className="text-white font-mono">{((stats?.storage || 0) / (1024 * 1024 * 1024)).toFixed(1)}GB / 5.0GB</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(((stats?.storage || 0) / (5 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Tour CTA */}
                            <div className="bg-gradient-to-br from-[#00FF88]/10 to-blue-500/10 border border-[#00FF88]/20 rounded-3xl p-6 relative overflow-hidden">
                                <h3 className="text-lg font-bold text-white mb-2 relative z-10">Revisit Onboarding</h3>
                                <p className="text-sm text-gray-400 mb-6 relative z-10">
                                    Need a refresher? Retake the product tour anytime.
                                </p>
                                <button
                                    onClick={() => setShowOnboarding(true)}
                                    className="w-full py-3 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#00FF88]/90 transition-colors relative z-10"
                                >
                                    Start Tour
                                </button>
                            </div>
                        </div>
                    </GSAPTransition>
                </div>
            </div>

            {/* Simple Onboarding Overlay - Reused */}
            {showOnboarding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8">
                    <div className="max-w-2xl w-full text-center space-y-6">
                        <div className="w-20 h-20 bg-[#00FF88] rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                            <Globe className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">Nebula Tour</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-8 md:mt-12">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[#00FF88] font-bold mb-2">1. Create</div>
                                <p className="text-sm text-gray-400">Generate Text-to-Video in seconds.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[#00FF88] font-bold mb-2">2. Edit</div>
                                <p className="text-sm text-gray-400">Use the Storyboard Editor for fine control.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[#00FF88] font-bold mb-2">3. Campaigns</div>
                                <p className="text-sm text-gray-400">Scale up with batch content creation.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowOnboarding(false)}
                            className="mt-8 md:mt-12 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            Close Tour
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
