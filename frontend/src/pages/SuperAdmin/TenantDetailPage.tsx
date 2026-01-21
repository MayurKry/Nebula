import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Users, Settings, ArrowLeft, Ban, CheckCircle } from 'lucide-react';
import { adminApi, type Tenant } from '@/api/admin.api';
import CreditAdjustmentModal from '@/components/admin/CreditAdjustmentModal';
import ConfirmActionModal from '@/components/admin/ConfirmActionModal';
import PlanConfiguration from '@/components/admin/PlanConfiguration';
import FeatureOverrides from '@/components/admin/FeatureOverrides';
import { toast } from 'sonner';

const TenantDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'users' | 'config'>('overview');

    // Modal states
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

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
            <div className="flex items-center justify-center h-64">
                <div className="text-[#8E8E93]">Loading tenant details...</div>
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
        { id: 'overview', label: 'Overview', icon: Settings },
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/tenants')}
                        className="w-10 h-10 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-[#00FF88]/20 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">{tenant.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[#8E8E93] font-medium">{tenant.type}</span>
                            <span className={`px-3 py-1 text-xs rounded-lg border font-bold ${getStatusColor(tenant.status)}`}>
                                {tenant.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {tenant.status === 'ACTIVE' ? (
                        <button
                            onClick={() => setShowSuspendModal(true)}
                            className="px-4 py-2 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500 font-bold hover:bg-red-600/20 transition-all flex items-center gap-2"
                        >
                            <Ban className="w-4 h-4" />
                            Suspend
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowActivateModal(true)}
                            className="px-4 py-2 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-xl text-[#00FF88] font-bold hover:bg-[#00FF88]/20 transition-all flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Activate
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-all font-bold text-sm
                  ${activeTab === tab.id
                                        ? 'border-[#00FF88] text-[#00FF88]'
                                        : 'border-transparent text-[#8E8E93] hover:text-white'
                                    }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black mb-4 tracking-tight">Plan Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[#8E8E93] text-sm font-medium">Plan Type</p>
                                    <p className="text-white font-bold text-lg">{tenant.plan.id}</p>
                                </div>
                                <div>
                                    <p className="text-[#8E8E93] text-sm font-medium">Custom Plan</p>
                                    <p className="text-white font-bold">{tenant.plan.isCustom ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black mb-4 tracking-tight">Credit Summary</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[#8E8E93] text-sm font-medium">Current Balance</p>
                                    <p className="text-white font-black text-3xl">{tenant.credits.balance.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <p className="text-[#8E8E93] font-medium">Issued</p>
                                        <p className="text-[#00FF88] font-bold">{tenant.credits.lifetimeIssued.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#8E8E93] font-medium">Consumed</p>
                                        <p className="text-red-400 font-bold">{tenant.credits.lifetimeConsumed.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'credits' && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowCreditModal(true)}
                                className="px-6 py-3 bg-[#00FF88] text-black rounded-xl font-black hover:bg-[#00CC6A] transition-all"
                            >
                                Adjust Credits
                            </button>
                        </div>

                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black mb-4 tracking-tight">Recent Transactions</h3>
                            <div className="space-y-3">
                                {tenant.recentTransactions && tenant.recentTransactions.length > 0 ? (
                                    tenant.recentTransactions.map((txn: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-[#1F1F1F] rounded-xl border border-white/10">
                                            <div>
                                                <p className="text-white font-bold">{txn.type}</p>
                                                <p className="text-[#8E8E93] text-sm font-medium">{new Date(txn.createdAt).toLocaleString()}</p>
                                                {txn.reason && <p className="text-[#8E8E93] text-xs mt-1">{txn.reason}</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-lg ${txn.type === 'CONSUMPTION' || txn.type === 'DEDUCT' ? 'text-red-400' : 'text-[#00FF88]'}`}>
                                                    {txn.type === 'CONSUMPTION' || txn.type === 'DEDUCT' ? '-' : '+'}{txn.amount}
                                                </p>
                                                <p className="text-[#8E8E93] text-sm font-medium">Balance: {txn.balanceAfter}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[#8E8E93] text-center py-8">No transactions yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-black mb-4 tracking-tight">Users ({tenant.users?.length || 0})</h3>
                        <div className="space-y-3">
                            {tenant.users && tenant.users.length > 0 ? (
                                tenant.users.map((user: any) => (
                                    <div key={user._id} className="flex items-center justify-between p-4 bg-[#1F1F1F] rounded-xl border border-white/10">
                                        <div>
                                            <p className="text-white font-bold">{user.firstName} {user.lastName}</p>
                                            <p className="text-[#8E8E93] text-sm font-medium">{user.email}</p>
                                        </div>
                                        <span className="px-3 py-1 text-xs rounded-lg bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 font-bold">
                                            {user.role}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#8E8E93] text-center py-8">No users found</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-6">
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
                title="Suspend Tenant"
                message={`Are you sure you want to suspend "${tenant.name}"? This will prevent all users from accessing the platform.`}
                confirmText="Suspend Tenant"
                confirmationType="danger"
                requiresTyping={true}
                typingText={tenant.name}
                isLoading={actionLoading}
            />

            <ConfirmActionModal
                isOpen={showActivateModal}
                onClose={() => setShowActivateModal(false)}
                onConfirm={handleActivate}
                title="Activate Tenant"
                message={`Are you sure you want to activate "${tenant.name}"? Users will regain access to the platform.`}
                confirmText="Activate Tenant"
                confirmationType="info"
                isLoading={actionLoading}
            />
        </div>
    );
};

export default TenantDetailPage;
