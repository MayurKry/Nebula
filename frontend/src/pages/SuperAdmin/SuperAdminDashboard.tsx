import { useEffect, useState, useRef } from 'react';
import { Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { adminApi, type DashboardMetrics } from '@/api/admin.api';
import { toast } from 'sonner';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const SuperAdminDashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!loading && metrics) {
            const cards = gsap.utils.toArray('.dashboard-card');
            cards.forEach((card: any) => {
                card.addEventListener('mouseenter', () => {
                    gsap.to(card, { y: -4, scale: 1.02, duration: 0.3, ease: 'power2.out' });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.inOut' });
                });
            });
        }
    }, { scope: container, dependencies: [loading, metrics] });

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await adminApi.getDashboardMetrics();
            setMetrics(response.data.data);
        } catch (error: any) {
            console.error('Failed to fetch metrics:', error);
            toast.error('Failed to load dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#8E8E93] animate-pulse font-medium">Loading platform metrics...</div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 font-bold">
                    Failed to load metrics. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div ref={container} className="space-y-12 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <GSAPTransition animation="fade-in-up" duration={0.8}>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white tracking-tight">Platform Control</h1>
                    <p className="text-[#8E8E93] text-lg font-medium">Real-time overview of Nebula Studio's ecosystem</p>
                </div>
            </GSAPTransition>

            {/* Metrics Grid */}
            <GSAPTransition animation="fade-in-up" duration={1} delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Tenants */}
                    <div className="dashboard-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-[#00FF88]/20 transition-all shadow-lg cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#00FF88]" />
                            </div>
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-right">Tenants</span>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white">{metrics.tenants.total}</p>
                            <div className="mt-3 flex gap-3 text-xs font-bold uppercase tracking-wider">
                                <span className="text-[#00FF88]">{metrics.tenants.active} Active</span>
                                <span className="text-red-400/80">{metrics.tenants.suspended} Suspended</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Credits */}
                    <div className="dashboard-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-all shadow-lg cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-right">Credits</span>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white">
                                {metrics.credits.totalBalance.toLocaleString()}
                            </p>
                            <p className="text-[#8E8E93] text-xs mt-3 font-bold uppercase tracking-wider">
                                {metrics.credits.totalIssued.toLocaleString()} total issued
                            </p>
                        </div>
                    </div>

                    {/* 24h Consumption */}
                    <div className="dashboard-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-[#00FF88]/20 transition-all shadow-lg cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-[#00FF88]" />
                            </div>
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-right">Consumption</span>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white">
                                {metrics.credits.consumed24h.toLocaleString()}
                            </p>
                            <p className="text-[#8E8E93] text-xs mt-3 font-bold uppercase tracking-wider">
                                Last 24 hours
                            </p>
                        </div>
                    </div>

                    {/* High Velocity Alerts */}
                    <div className={`dashboard-card bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-yellow-500/20 transition-all shadow-lg cursor-default ${metrics.highVelocityTenants.length > 0 ? 'ring-1 ring-yellow-500/20' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metrics.highVelocityTenants.length > 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5 border border-white/10'}`}>
                                <AlertTriangle className={`w-6 h-6 ${metrics.highVelocityTenants.length > 0 ? 'text-yellow-400' : 'text-gray-500'}`} />
                            </div>
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-right">Alerts</span>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white">
                                {metrics.highVelocityTenants.length}
                            </p>
                            <p className="text-[#8E8E93] text-xs mt-3 font-bold uppercase tracking-wider">
                                High Velocity Items
                            </p>
                        </div>
                    </div>
                </div>
            </GSAPTransition>

            {/* High Velocity Tenants List */}
            {metrics.highVelocityTenants.length > 0 && (
                <GSAPTransition animation="fade-in-up" duration={1} delay={0.4}>
                    <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-black text-white tracking-tight">Critical Activity Monitoring</h2>
                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">Action Required</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {metrics.highVelocityTenants.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-lg group-hover:text-yellow-400 transition-colors">{item.tenant?.name || 'Unknown'}</p>
                                            <p className="text-[#8E8E93] text-sm font-medium">
                                                {item.transactionCount} transactions in 24h
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-yellow-400 font-black text-2xl tracking-tight">
                                            {item.consumption24h.toLocaleString()}
                                        </p>
                                        <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest mt-1">credits consumed</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </GSAPTransition>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
