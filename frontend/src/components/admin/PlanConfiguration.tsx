import { useState } from 'react';
import { adminApi, type Tenant } from '@/api/admin.api';
import { toast } from 'sonner';
import { Edit2, Save, X } from 'lucide-react';

interface PlanConfigurationProps {
    tenant: Tenant;
    onUpdate: () => void;
}

const PLANS = ['FREE', 'PRO', 'TEAM', 'CUSTOM'];

const PlanConfiguration = ({ tenant, onUpdate }: PlanConfigurationProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        basePlanId: tenant.plan.id,
        maxUsers: tenant.plan.customLimits?.maxUsers || 1,
        monthlyCredits: tenant.plan.customLimits?.monthlyCredits || 100,
        expiresAt: tenant.plan.customLimits?.expiresAt ? new Date(tenant.plan.customLimits.expiresAt).toISOString().split('T')[0] : '',
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await adminApi.assignCustomPlan(tenant._id, {
                basePlanId: formData.basePlanId,
                customLimits: formData.basePlanId === 'CUSTOM' ? {
                    maxUsers: parseInt(formData.maxUsers as any),
                    monthlyCredits: parseInt(formData.monthlyCredits as any),
                    expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
                    features: [] // Handled separately
                } : undefined
            });

            toast.success('Plan configuration updated successfully');
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update plan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white font-black text-lg tracking-tight">Plan Configuration</h3>
                    <p className="text-[#8E8E93] text-sm">Manage tenant plan and custom limits</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-white/5 rounded-lg text-[#00FF88] transition-all"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 hover:bg-white/5 rounded-lg text-red-400 transition-all"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-2 hover:bg-white/5 rounded-lg text-[#00FF88] transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="animate-spin">⌛</span> : <Save className="w-5 h-5" />}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Plan Selection */}
                <div>
                    <label className="block text-sm font-bold text-[#8E8E93] mb-2">Base Plan</label>
                    {isEditing ? (
                        <select
                            value={formData.basePlanId}
                            onChange={(e) => setFormData({ ...formData, basePlanId: e.target.value })}
                            className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88] transition-all font-medium"
                        >
                            {PLANS.map(plan => (
                                <option key={plan} value={plan}>{plan}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-white font-bold text-lg">{tenant.plan.id}</div>
                    )}
                </div>

                {/* Custom Limits */}
                {(isEditing ? formData.basePlanId === 'CUSTOM' : tenant.plan.isCustom) && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h4 className="text-[#00FF88] font-bold text-sm uppercase tracking-wider">Custom Limits</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#8E8E93] mb-2">Monthly Credits</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.monthlyCredits}
                                        onChange={(e) => setFormData({ ...formData, monthlyCredits: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                    />
                                ) : (
                                    <div className="text-white font-bold">{tenant.plan.customLimits?.monthlyCredits?.toLocaleString() || 'N/A'}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#8E8E93] mb-2">Max Users</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.maxUsers}
                                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                    />
                                ) : (
                                    <div className="text-white font-bold">{tenant.plan.customLimits?.maxUsers || 'N/A'}</div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-[#8E8E93] mb-2">Plan Expiry</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                    />
                                ) : (
                                    <div className="text-white font-bold">
                                        {tenant.plan.customLimits?.expiresAt
                                            ? new Date(tenant.plan.customLimits.expiresAt).toLocaleDateString()
                                            : 'Never'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanConfiguration;
