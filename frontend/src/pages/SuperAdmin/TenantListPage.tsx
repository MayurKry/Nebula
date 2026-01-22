import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Shield, Box, MoreVertical, Plus } from 'lucide-react';
import { adminApi, type Tenant } from '@/api/admin.api';
import { toast } from 'sonner';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CreateTenantModal from '@/components/admin/CreateTenantModal';

const TenantListPage = () => {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [planFilter, setPlanFilter] = useState<string>('');
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!loading && tenants.length > 0) {
            gsap.from('.tenant-row', {
                y: 10,
                opacity: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out'
            });
        }
    }, { scope: container, dependencies: [loading, tenants] });

    useEffect(() => {
        fetchTenants();
    }, [statusFilter, planFilter]);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            if (planFilter) params.planId = planFilter;
            if (search) params.search = search;

            const response = await adminApi.listTenants(params);
            setTenants(response?.data?.data?.tenants || []);
        } catch (error: any) {
            console.error('Failed to fetch tenants:', error);
            toast.error('Failed to load tenants');
            setTenants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchTenants();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20';
            case 'SUSPENDED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'LOCKED_PAYMENT_FAIL': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            default: return 'text-gray-400 bg-white/5 border-white/10';
        }
    };

    const getPlanBadge = (plan: any) => {
        if (plan.isCustom) {
            return <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/30 shadow-lg shadow-purple-500/5">Custom</span>;
        }
        return <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">{plan.id}</span>;
    };

    return (
        <div ref={container} className="space-y-10 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <GSAPTransition animation="fade-in-up" duration={0.8}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tight">Tenant Management</h1>
                        <p className="text-[#8E8E93] text-lg font-medium">Configure and monitor your ecosystem entities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-[#141414] border border-white/10 p-1 rounded-xl flex">
                            <button className="px-4 py-2 text-xs font-bold bg-[#00FF88] text-[#0A0A0A] rounded-lg shadow-lg shadow-[#00FF88]/10">Listings</button>
                            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">Analytics</button>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-3 bg-[#00FF88] hover:bg-[#00CC6A] text-[#0A0A0A] rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Tenant</span>
                        </button>
                    </div>
                </div>
            </GSAPTransition>

            <CreateTenantModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => fetchTenants()}
            />

            {/* Filters Bar */}
            <GSAPTransition animation="fade-in-up" duration={1} delay={0.2}>
                <div className="flex flex-col lg:flex-row gap-4 p-2 bg-[#141414]/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93] group-focus-within:text-[#00FF88] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-[#8E8E93] focus:outline-none transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="h-10 w-px bg-white/5 hidden lg:block self-center" />

                    <div className="flex flex-wrap items-center gap-3 px-2 py-2 lg:py-0">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-black text-[#8E8E93] uppercase tracking-widest">
                            <Filter className="w-3 h-3" /> Filters:
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-[#00FF88] transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>

                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-[#00FF88] transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Plans</option>
                            <option value="FREE">Free</option>
                            <option value="PRO">Pro</option>
                            <option value="TEAM">Team</option>
                            <option value="CUSTOM">Custom</option>
                        </select>
                    </div>
                </div>
            </GSAPTransition>

            {/* Table */}
            <GSAPTransition animation="fade-in-up" duration={1} delay={0.4}>
                <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em] w-[40%]">Tenant Entity</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Package</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Balance</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Scale</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Security</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em] w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="inline-flex items-center gap-3 text-[#8E8E93] font-medium animate-pulse">
                                                <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-ping" />
                                                Synchronizing tenant data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : tenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-[#8E8E93] font-medium bg-white/[0.01]">
                                            No platform entities found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    tenants.map((tenant) => (
                                        <tr
                                            key={tenant._id}
                                            onClick={() => navigate(`/admin/tenants/${tenant._id}`)}
                                            className="tenant-row group hover:bg-white/5 cursor-pointer transition-all duration-300"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-white/10 flex items-center justify-center group-hover:border-[#00FF88]/30 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all">
                                                        <Shield className="w-5 h-5 text-[#8E8E93] group-hover:text-[#00FF88] transition-colors" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-lg group-hover:text-[#00FF88] transition-colors tracking-tight">{tenant.name}</div>
                                                        <div className="text-[#8E8E93] text-[10px] font-black font-mono tracking-tighter uppercase mt-0.5">{tenant._id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {getPlanBadge(tenant.plan)}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-black text-lg tabular-nums tracking-tight">{tenant.credits.balance.toLocaleString()}</span>
                                                    <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mt-1">CP</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-[#8E8E93] font-bold">
                                                    <Box className="w-4 h-4 text-[#8E8E93]" />
                                                    <span>{tenant.userCount} users</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${getStatusColor(tenant.status)}`}>
                                                    {tenant.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <button className="p-2 text-[#8E8E93] hover:text-white transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </GSAPTransition>
        </div>
    );
};

export default TenantListPage;
