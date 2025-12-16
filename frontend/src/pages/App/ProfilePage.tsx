import { useState } from 'react';
import {
    Mail, MapPin, Globe, Shield, CreditCard,
    Bell, LogOut, ChevronRight
} from 'lucide-react';
// Removed unused imports: User, Link

const ProfilePage = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <button className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium">
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Profile Info */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Identity Card */}
                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 flex items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold shadow-2xl">
                                JD
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold mb-1">John Doe</h2>
                                <p className="text-gray-400 text-sm mb-4">Pro Plan Member</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        john.doe@example.com
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        San Francisco, CA
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        English (US)
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Shield className="w-4 h-4 text-[#00FF88]" />
                                        Verified Account
                                    </div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm hover:bg-[#252525] transition-colors">
                                Edit
                            </button>
                        </div>

                        {/* Preferences */}
                        <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/5 font-semibold">Preferences</div>
                            <div className="divide-y divide-white/5">
                                <div className="p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Notifications</div>
                                            <div className="text-xs text-gray-500">Manage email and push alerts</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                </div>
                                <div className="p-4 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Billing & Plan</div>
                                            <div className="text-xs text-gray-500">Manage subscription and payment methods</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* Product Tour Card */}
                        <div className="bg-gradient-to-br from-[#00FF88]/20 to-blue-500/20 border border-[#00FF88]/30 rounded-2xl p-6 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-white mb-2">New to Nebula?</h3>
                            <p className="text-sm text-gray-300 mb-4 relative z-10">
                                Take a quick tour to learn about all the powerful features available to you.
                            </p>
                            <button
                                onClick={() => setShowOnboarding(true)}
                                className="w-full py-2 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#00FF88]/90 transition-colors relative z-10"
                            >
                                Start Product Tour
                            </button>
                            {/* Decorative blur */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#00FF88] rounded-full blur-3xl opacity-20" />
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
                            <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Recent Activity</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-300">Exported project "Nebula Demo"</p>
                                            <p className="text-xs text-gray-500">2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Onboarding Overlay */}
            {showOnboarding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8">
                    <div className="max-w-2xl text-center space-y-6">
                        <div className="w-20 h-20 bg-[#00FF88] rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                            <Globe className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">Welcome to Nebula</h2>
                        <p className="text-xl text-gray-300">
                            The ultimate AI-powered video creation platform.
                            Create stunning videos from text, images, and more.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-12">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[#00FF88] font-bold mb-2">1. Create</div>
                                <p className="text-sm text-gray-400">Start with Text-to-Video or Image-to-Video tools.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[#00FF88] font-bold mb-2">2. Edit</div>
                                <p className="text-sm text-gray-400">Refine scenes, add characters, and adjust settings.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[#00FF88] font-bold mb-2">3. Export</div>
                                <p className="text-sm text-gray-400">Render your masterpiece in 4K resolution.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowOnboarding(false)}
                            className="mt-12 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            Got it, let's go!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
