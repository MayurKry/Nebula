import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CreditCard, Users, Settings, ArrowLeft,
    Ban, CheckCircle, Shield, Activity,
    Zap, Gem, History
} from 'lucide-react';
import { adminApi, type Tenant } from '@/api/admin.api';
import CreditAdjustmentModal from '@/components/admin/CreditAdjustmentModal';
import ConfirmActionModal from '@/components/admin/ConfirmActionModal';
import PlanConfiguration from '@/components/admin/PlanConfiguration';
import FeatureOverrides from '@/components/admin/FeatureOverrides';
import { toast } from 'sonner';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const TenantDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'users' | 'config'>('overview');
    const container = useRef<HTMLDivElement>(null);

    // Modal states
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useGSAP(() => {
        if (!loading && tenant) {
            gsap.from('.detail-card', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    }, { scope: container, dependencies: [loading, tenant] });

    useEffect(() => {
        if (id) {
            fetchTenant();
        }
    }, [id]);

    const fetchTenant = async () => {
        try {
            const response = await adminApi.getTenantById(id!);
            setTenant(response.data.data.tenant);
        } catch (error: any) {
            console.error('Failed to fetch tenant:', error);
            toast.error('Failed to load tenant details');
        } finally {
            setLoading(false);
        }
    };

    const handleCreditAdjustment = async (amount: number, reason: string, type: 'grant' | 'deduct') => {
        try {
            if (type === 'grant') {
                await adminApi.grantCredits(id!, amount, reason);
                toast.success(`Successfully granted ${amount} credits`);
            } else {
                await adminApi.deductCredits(id!, amount, reason);
                toast.success(`Successfully deducted ${amount} credits`);
            }
            await fetchTenant(); // Refresh data
        } catch (error: any) {
            throw error; // Let modal handle the error
        }
    };

    const handleSuspend = async () => {
        setActionLoading(true);
        try {
            await adminApi.suspendTenant(id!, 'Suspended by admin');
            toast.success('Tenant suspended successfully');
            setShowSuspendModal(false);
            await fetchTenant();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to suspend tenant');
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivate = async () => {
        setActionLoading(true);
        try {
            await adminApi.activateTenant(id!);
            toast.success('Tenant activated successfully');
            setShowActivateModal(false);
            await fetchTenant();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to activate tenant');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <div className="w-12 h-12 border-4 border-white/5 border-t-[#00FF88] rounded-full animate-spin" />
                <div className="text-[#8E8E93] font-bold uppercase tracking-[0.2em] text-[10px]">Accessing Record...</div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-400 mb-4">Tenant not found</div>
                <button
                    onClick={() => navigate('/admin/tenants')}
                    className="px-4 py-2 bg-[#00FF88] text-black rounded-xl font-bold hover:bg-[#00CC6A] transition-all"
                >
                    Back to Tenants
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Shield },
        { id: 'credits', label: 'Credits', icon: CreditCard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'config', label: 'Configuration', icon: Settings },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20';
            case 'SUSPENDED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'LOCKED_PAYMENT_FAIL': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-[#8E8E93] bg-[#8E8E93]/10 border-[#8E8E93]/20';
        }
    };

    return (
        <div ref={container} className="space-y-10 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <GSAPTransition animation="fade-in-up" duration={0.8}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/admin/tenants')}
                            className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-[#00FF88]/40 hover:bg-[#1A1A1A] transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-white tracking-tight">{tenant.name}</h1>
                                <span className={`px-4 py-1.5 text-[10px] rounded-full border font-black uppercase tracking-widest ${getStatusColor(tenant.status)}`}>
                                    {tenant.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[#8E8E93] font-bold text-xs uppercase tracking-widest">{tenant.type}</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[#8E8E93] font-mono text-[10px] uppercase tracking-tighter">{tenant._id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {tenant.status === 'ACTIVE' ? (
                            <button
                                onClick={() => setShowSuspendModal(true)}
                                className="px-6 py-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-600/20 hover:border-red-500/40 transition-all flex items-center gap-2"
                            >
                                <Ban className="w-4 h-4" />
                                Suspend Account
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowActivateModal(true)}
                                className="px-6 py-3 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-2xl text-[#00FF88] font-black text-xs uppercase tracking-widest hover:bg-[#00FF88]/20 hover:border-[#00FF88]/40 transition-all flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Activate Account
                            </button>
                        )}
                    </div>
                </div>
            </GSAPTransition>

            {/* Premium Tabs */}
            <GSAPTransition animation="fade-in-up" duration={1} delay={0.2}>
                <div className="flex gap-2 p-1 bg-[#141414] border border-white/5 rounded-2xl inline-flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest
                                    ${activeTab === tab.id
                                        ? 'bg-[#00FF88] text-[#0A0A0A] shadow-[0_10px_20px_-5px_rgba(0,255,136,0.3)]'
                                        : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </GSAPTransition>

            {/* Tab Content */}
            <div className="space-y-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="detail-card bg-[#141414] border border-white/5 rounded-[2rem] p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                                    <Gem className="w-6 h-6 text-[#00FF88]" />
                                </div>
                                <h3 className="text-white font-black text-lg uppercase tracking-tight">Plan Package</h3>
                            </div>
                            <div className="space-y-4 pt-2">
                                <div>
                                    <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Tier Assignment</p>
                                    <p className="text-white font-black text-2xl tracking-tight uppercase">{tenant.plan.id}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <span className={tenant.plan.isCustom ? 'text-purple-400' : 'text-gray-500'}>
                                        {tenant.plan.isCustom ? '✓ Custom Enterprise Limits' : 'Standard Public Plan'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-card bg-[#141414] border border-white/5 rounded-[2rem] p-8 space-y-6 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight">Credit Repository</h3>
                                </div>
                                <button
                                    onClick={() => setShowCreditModal(true)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Adjust Fuel
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2">
                                <div>
                                    <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Available Balance</p>
                                    <p className="text-white font-black text-4xl tabular-nums tracking-tighter">{tenant.credits.balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Authorized</p>
                                    <p className="text-[#00FF88] font-black text-2xl tabular-nums tracking-tight">{tenant.credits.lifetimeIssued.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Burned</p>
                                    <p className="text-red-400 font-black text-2xl tabular-nums tracking-tight">{tenant.credits.lifetimeConsumed.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'credits' && (
                    <div className="space-y-8">
                        <div className="detail-card bg-[#141414] border border-white/5 rounded-[2rem] p-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <History className="w-32 h-32 text-white/[0.02] -rotate-12" />
                            </div>
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-[#00FF88]" />
                                    </div>
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight">Transaction Ledger</h3>
                                </div>
                                <button
                                    onClick={() => setShowCreditModal(true)}
                                    className="px-6 py-3 bg-[#00FF88] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_10px_20px_-5px_rgba(0,255,136,0.3)] transition-all"
                                >
                                    Modify Fuel Levels
                                </button>
                            </div>
                            <div className="space-y-4 relative z-10">
                                {tenant.recentTransactions && tenant.recentTransactions.length > 0 ? (
                                    tenant.recentTransactions.map((txn: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-[1.5rem] border border-white/5 transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${txn.type === 'CONSUMPTION' || txn.type === 'DEDUCT'
                                                        ? 'bg-red-500/5 border-red-500/10 text-red-400'
                                                        : 'bg-[#00FF88]/5 border-[#00FF88]/10 text-[#00FF88]'
                                                    }`}>
                                                    {txn.type === 'CONSUMPTION' || txn.type === 'DEDUCT' ? <Zap className="w-5 h-5 rotate-180" /> : <Zap className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-black uppercase text-[10px] tracking-widest mb-0.5">{txn.type}</p>
                                                    <p className="text-[#8E8E93] text-xs font-bold">{new Date(txn.createdAt).toLocaleString()}</p>
                                                    {txn.reason && <p className="text-gray-600 text-[10px] mt-1 italic font-medium">// {txn.reason}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-xl tabular-nums tracking-tighter ${txn.type === 'CONSUMPTION' || txn.type === 'DEDUCT' ? 'text-red-400' : 'text-[#00FF88]'}`}>
                                                    {txn.type === 'CONSUMPTION' || txn.type === 'DEDUCT' ? '-' : '+'}{txn.amount.toLocaleString()}
                                                </p>
                                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">Bal: {txn.balanceAfter.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                            <History className="w-8 h-8 text-gray-700" />
                                        </div>
                                        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No spectral movements recorded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="detail-card bg-[#141414] border border-white/5 rounded-[2rem] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-[#00FF88]" />
                                </div>
                                <h3 className="text-white font-black text-lg uppercase tracking-tight">Access Directory</h3>
                            </div>
                            <span className="text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.2em]">{tenant.users?.length || 0} Registered Entities</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tenant.users && tenant.users.length > 0 ? (
                                tenant.users.map((user: any) => (
                                    <div key={user._id} className="flex items-center justify-between p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all">
                                        <div>
                                            <p className="text-white font-black text-lg tracking-tight">{user.firstName} {user.lastName}</p>
                                            <p className="text-[#8E8E93] text-xs font-medium mt-0.5">{user.email}</p>
                                        </div>
                                        <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-[#141414] border border-white/10 text-gray-400">
                                            {user.role}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-20 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Workspace is vacant</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <PlanConfiguration tenant={tenant} onUpdate={fetchTenant} />
                        <FeatureOverrides tenant={tenant} onUpdate={fetchTenant} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreditAdjustmentModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onSubmit={handleCreditAdjustment}
                tenantName={tenant.name}
                currentBalance={tenant.credits.balance}
            />

            <ConfirmActionModal
                isOpen={showSuspendModal}
                onClose={() => setShowSuspendModal(false)}
                onConfirm={handleSuspend}
                title="Suspend Authorization"
                message={`Suspend access for "${tenant.name}"? All users under this entity will be immediately disconnected from platform services.`}
                confirmText="Lock Access"
                confirmationType="danger"
                requiresTyping={true}
                typingText={tenant.name}
                isLoading={actionLoading}
            />

            <ConfirmActionModal
                isOpen={showActivateModal}
                onClose={() => setShowActivateModal(false)}
                onConfirm={handleActivate}
                title="Restore Authorization"
                message={`Activate Nebula services for "${tenant.name}"? All registered entities will regain immediate access.`}
                confirmText="Enable Access"
                confirmationType="info"
                isLoading={actionLoading}
            />
        </div>
    );
};

export default TenantDetailPage;

