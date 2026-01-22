import { useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { Search, Clock } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const SupportPage = () => {
    const [tenantId, setTenantId] = useState('');
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!tenantId) return;
        setLoading(true);
        setSearched(true);
        try {
            const response = await adminApi.getSupportTimeline(tenantId);
            setTimeline(response.data.data.timeline);
        } catch (error) {
            console.error(error);
            setTimeline([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <GSAPTransition animation="fade-in-up">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Support Tools</h1>
                    <p className="text-[#8E8E93] text-lg font-medium">Diagnose tenant issues with deep dive timelines</p>
                </div>
            </GSAPTransition>

            <GSAPTransition animation="fade-in-up" delay={0.1}>
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-2xl">
                    <label className="block text-sm font-bold text-white mb-2">Target Tenant ID</label>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                            <input
                                type="text"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                placeholder="Enter Tenant ID..."
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-[#00FF88] text-black font-black rounded-xl hover:bg-[#00CC6A] transition-colors"
                        >
                            Lookup Timeline
                        </button>
                    </div>
                </div>
            </GSAPTransition>

            {searched && (
                <GSAPTransition animation="fade-in-up" delay={0.2}>
                    <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden p-8">
                        <h3 className="text-xl font-black text-white mb-6">Activity Timeline</h3>

                        {loading ? (
                            <p className="text-[#8E8E93]">Loading timeline...</p>
                        ) : timeline.length === 0 ? (
                            <p className="text-[#8E8E93]">No activity found for this tenant.</p>
                        ) : (
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                {timeline.map((item) => (
                                    <div key={item._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#1F1F1F] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <Clock className="w-4 h-4 text-[#8E8E93]" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1F1F1F] p-4 rounded-xl border border-white/10 shadow hover:border-white/20 transition-colors">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-white">{item.feature}</div>
                                                <time className="font-mono text-xs text-[#8E8E93]">{new Date(item.createdAt).toLocaleString()}</time>
                                            </div>
                                            <div className="text-[#8E8E93] text-sm">
                                                Status: <span className={item.status === 'COMPLETED' ? 'text-[#00FF88]' : 'text-red-400'}>{item.status}</span>
                                            </div>
                                            <div className="text-[#8E8E93] text-xs mt-2">
                                                {item.provider} • {item.latencyMs}ms
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </GSAPTransition>
            )}
        </div>
    );
};

export default SupportPage;
