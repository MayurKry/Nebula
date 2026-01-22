import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { Activity, Users, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const AnalyticsPage = () => {
    const [period, setPeriod] = useState<'24h' | '7d'>('24h');
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, [period]);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            // In a real app, 'cycle' would be passed if selected
            const response = await adminApi.getUsageAnalytics(period as any);
            setMetrics(response.data.data.metrics);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-[#8E8E93] text-center mt-20">Loading analytics...</div>;
    if (!metrics) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <GSAPTransition animation="fade-in-up">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">System Analytics</h1>
                        <p className="text-[#8E8E93] text-lg font-medium">Operational visibility & usage metrics</p>
                    </div>
                    <div className="flex bg-[#141414] border border-white/10 rounded-xl p-1">
                        {['24h', '7d'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === p ? 'bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/10' : 'text-[#8E8E93] hover:text-white'
                                    }`}
                            >
                                {p === '24h' ? 'Last 24 Hours' : 'Last 7 Days'}
                            </button>
                        ))}
                    </div>
                </div>
            </GSAPTransition>

            {/* Health Stats */}
            <GSAPTransition animation="fade-in-up" delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#141414] border border-white/10 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">Generations</span>
                        </div>
                        <p className="text-3xl font-black text-white">{metrics.health.totalGenerations.toLocaleString()}</p>
                        <p className="text-[#8E8E93] text-xs font-bold mt-2 uppercase tracking-wide">Total Requests</p>
                    </div>

                    <div className="bg-[#141414] border border-white/10 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">Failures</span>
                        </div>
                        <p className="text-3xl font-black text-white">{metrics.health.totalErrors.toLocaleString()}</p>
                        <p className="text-red-400 text-xs font-bold mt-2 uppercase tracking-wide">{metrics.health.errorRate.toFixed(2)}% Error Rate</p>
                    </div>

                    <div className="bg-[#141414] border border-white/10 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                            </div>
                            <span className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">Health</span>
                        </div>
                        <p className="text-3xl font-black text-white">{metrics.health.errorRate > 5 ? 'Degraded' : 'Healthy'}</p>
                        <p className="text-[#8E8E93] text-xs font-bold mt-2 uppercase tracking-wide">System Status</p>
                    </div>
                </div>
            </GSAPTransition>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Usage */}
                <GSAPTransition animation="fade-in-up" delay={0.2}>
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-[#00FF88]" />
                            <h3 className="text-xl font-black text-white tracking-tight">Usage by Feature</h3>
                        </div>
                        <div className="space-y-6">
                            {metrics.usageByFeature.map((item: any) => (
                                <div key={item._id}>
                                    <div className="flex justify-between text-sm mb-2 font-bold">
                                        <span className="text-white">{item._id}</span>
                                        <span className="text-[#8E8E93]">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00FF88]"
                                            style={{ width: `${(item.count / Math.max(...metrics.usageByFeature.map((i: any) => i.count))) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {metrics.usageByFeature.length === 0 && <p className="text-[#8E8E93] text-center">No usage data</p>}
                        </div>
                    </div>
                </GSAPTransition>

                {/* Tenant Usage */}
                <GSAPTransition animation="fade-in-up" delay={0.3}>
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Users className="w-5 h-5 text-purple-400" />
                            <h3 className="text-xl font-black text-white tracking-tight">Usage by Tenant Type</h3>
                        </div>
                        <div className="space-y-6">
                            {metrics.usageByTenantType.map((item: any) => (
                                <div key={item._id}>
                                    <div className="flex justify-between text-sm mb-2 font-bold">
                                        <span className="text-white">{item._id}</span>
                                        <span className="text-[#8E8E93]">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${(item.count / Math.max(1, ...metrics.usageByTenantType.map((i: any) => i.count))) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {metrics.usageByTenantType.length === 0 && <p className="text-[#8E8E93] text-center">No data</p>}
                        </div>
                    </div>
                </GSAPTransition>
            </div>
        </div>
    );
};

export default AnalyticsPage;
