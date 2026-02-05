import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertOctagon, Activity } from 'lucide-react';
import { adminApi, type DashboardMetrics } from '@/api/admin.api';

// Static cost assumption: $0.002 per credit
const COST_PER_CREDIT = 0.002;

const FinancialsPage = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await adminApi.getDashboardMetrics();
                setMetrics(response.data.data);
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="text-[#8E8E93] animate-pulse">Loading financial data...</div>;
    if (!metrics) return <div className="text-red-400">Unable to load financial data.</div>;

    const estimatedCost24h = metrics.credits.consumed24h * COST_PER_CREDIT;
    const estimatedTotalCost = metrics.credits.totalConsumed * COST_PER_CREDIT;

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tight">Financial Overview</h1>
                <p className="text-[#8E8E93] text-lg font-medium">Infrastructure cost monitoring and burn rate analysis</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="stat-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-[#00FF88]/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-[#00FF88]" />
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-xs font-black uppercase tracking-widest">Est. Cost (24h)</p>
                            <p className="text-2xl font-black text-white">${estimatedCost24h.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-xs font-black uppercase tracking-widest">Total Spend (Life)</p>
                            <p className="text-2xl font-black text-white">${estimatedTotalCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-xs font-black uppercase tracking-widest">Burn Rate</p>
                            <p className="text-2xl font-black text-white">{metrics.credits.consumed24h.toLocaleString()} credits/day</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* High Velocity Warning */}
            {metrics.highVelocityTenants.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                        <AlertOctagon className="w-8 h-8 text-red-500 shrink-0" />
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight mb-2">Cost Spike Detected</h3>
                            <p className="text-gray-400 mb-6 max-w-2xl">
                                {metrics.highVelocityTenants.length} tenants are consuming credits at an abnormal rate (&gt;500/day).
                                Review these accounts immediately to prevent cost overruns.
                            </p>

                            <div className="space-y-4">
                                {metrics.highVelocityTenants.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                                        <div>
                                            <span className="text-white font-bold">{item.tenant?.name || 'Unknown Tenant'}</span>
                                            <span className="text-gray-500 text-sm ml-2">({item.transactionCount} txns)</span>
                                        </div>
                                        <div className="text-red-400 font-bold font-mono">
                                            -${(item.consumption24h * COST_PER_CREDIT).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialsPage;
