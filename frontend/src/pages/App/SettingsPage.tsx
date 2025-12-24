import { useState } from 'react';
import { CreditCard, Zap, Bell } from 'lucide-react';

const SettingsPage = () => {
    // Mock Data - In real app, this comes from user context/API
    const [subscription] = useState({
        plan: 'Nebula Pro',
        status: 'Active',
        renewalDate: 'Jan 24, 2026',
        price: '$29.99/mo'
    });

    const [usage] = useState({
        credits: { total: 1000, used: 450, remaining: 550 },
        storage: { total: '100 GB', used: '24 GB' }
    });

    const [preferences, setPreferences] = useState({
        defaultModel: 'Nebula Pro',
        defaultAspectRatio: '16:9',
        emailNotifications: true,
        highQualityPreviews: true,
        privacyMode: false
    });

    const percentageUsed = (usage.credits.used / usage.credits.total) * 100;

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-8 text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your subscription, preferences, and usage.</p>
                </div>

                {/* Subscription & Usage - Side by Side on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subscription Card */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Current Plan</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                        {subscription.plan}
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                        {subscription.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                                <CreditCard className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-gray-400">Price</span>
                                <span>{subscription.price}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-gray-400">Next Renewal</span>
                                <span>{subscription.renewalDate}</span>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                            Manage Subscription
                        </button>
                    </div>

                    {/* Usage Card */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Credit Usage</h2>
                                <p className="text-sm text-gray-400">Monthly generation allowance</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                                <Zap className="w-6 h-6 text-[#00FF88]" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-3xl font-bold">{usage.credits.remaining}</span>
                                <span className="text-sm text-gray-400 mb-1">/ {usage.credits.total} credits active</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A]"
                                    style={{ width: `${percentageUsed}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                <span>{percentageUsed}% used</span>
                                <span>Resets in 14 days</span>
                            </div>
                        </div>

                        <button className="w-full py-2.5 border border-white/10 hover:bg-white/5 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            Buy More Credits
                        </button>
                    </div>
                </div>

                {/* Generator Preferences */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <SlidersIcon className="w-5 h-5 text-purple-500" />
                        Generation Preferences
                    </h3>
                    <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Default Model</h4>
                                <p className="text-sm text-gray-400">Preferred AI model for new projects</p>
                            </div>
                            <select
                                value={preferences.defaultModel}
                                onChange={(e) => setPreferences({ ...preferences, defaultModel: e.target.value })}
                                className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                            >
                                <option>Nebula Turbo (Faster)</option>
                                <option>Nebula Pro (Quality)</option>
                            </select>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Default Aspect Ratio</h4>
                                <p className="text-sm text-gray-400">Standard format for your content</p>
                            </div>
                            <div className="flex gap-2">
                                {['16:9', '9:16', '1:1'].map(ratio => (
                                    <button
                                        key={ratio}
                                        onClick={() => setPreferences({ ...preferences, defaultAspectRatio: ratio })}
                                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${preferences.defaultAspectRatio === ratio
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                            : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">High Quality Previews</h4>
                                <p className="text-sm text-gray-400">Generate higher resolution previews (Uses more credits)</p>
                            </div>
                            <Toggle
                                enabled={preferences.highQualityPreviews}
                                onToggle={(val) => setPreferences({ ...preferences, highQualityPreviews: val })}
                            />
                        </div>
                    </div>
                </section>

                {/* Account & Notification Settings */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" />
                        Notifications & Privacy
                    </h3>
                    <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Email Notifications</h4>
                                <p className="text-sm text-gray-400">Receive emails when long generations compile</p>
                            </div>
                            <Toggle
                                enabled={preferences.emailNotifications}
                                onToggle={(val) => setPreferences({ ...preferences, emailNotifications: val })}
                            />
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Privacy Mode</h4>
                                <p className="text-sm text-gray-400">Don't use my generations to train public models</p>
                            </div>
                            <Toggle
                                enabled={preferences.privacyMode}
                                onToggle={(val) => setPreferences({ ...preferences, privacyMode: val })}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// Helper Components
const SlidersIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 21v-7" />
        <path d="M4 10V3" />
        <path d="M12 21v-9" />
        <path d="M12 8V3" />
        <path d="M20 21v-5" />
        <path d="M20 12V3" />
        <path d="M1 14h6" />
        <path d="M9 8h6" />
        <path d="M17 16h6" />
    </svg>
);

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: (val: boolean) => void }) => (
    <button
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-[#00FF88]' : 'bg-gray-700'}`}
    >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
);

export default SettingsPage;
