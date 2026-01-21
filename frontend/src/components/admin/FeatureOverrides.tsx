import { useState, useEffect } from 'react';
import { adminApi, type Tenant, type Feature } from '@/api/admin.api';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';

interface FeatureOverridesProps {
    tenant: Tenant;
    onUpdate: () => void;
}

const FeatureOverrides = ({ tenant, onUpdate }: FeatureOverridesProps) => {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const response = await adminApi.getAllFeatures();
            setFeatures(response.data.data.features);
        } catch (error) {
            console.error('Failed to fetch features:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (featureId: string, isOverride: boolean) => {
        setProcessingId(featureId);
        try {
            if (isOverride) {
                // Remove override (revert to default)
                await adminApi.removeFeatureOverride(tenant._id, featureId);
                toast.success('Feature override removed');
            } else {
                // Add override (force enable)
                await adminApi.addFeatureOverride(tenant._id, featureId);
                toast.success('Feature override added');
            }
            onUpdate();
        } catch (error: any) {
            toast.error('Failed to update feature override');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="text-[#8E8E93]">Loading features...</div>;

    const overrides = tenant.featureOverrides || [];

    return (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
                <h3 className="text-white font-black text-lg tracking-tight">Feature Access Control</h3>
                <p className="text-[#8E8E93] text-sm">Override global plan settings for specific features</p>
            </div>

            <div className="space-y-3">
                {features.map((feature) => {
                    const isOverridden = overrides.includes(feature.featureId);
                    // Assuming feature is enabled if it's in overrides OR if it's globally enabled (simplification, real logic depends on plan)
                    // For this UI, we treat 'override' as 'explicitly enabled for this tenant'

                    return (
                        <div key={feature.featureId} className="flex items-center justify-between p-4 bg-[#1F1F1F] rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${feature.isGloballyEnabled ? 'bg-[#00FF88]' : 'bg-red-500'}`} />
                                <div>
                                    <p className="text-white font-bold">{feature.name}</p>
                                    <p className="text-[#8E8E93] text-xs font-mono">{feature.featureId}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {feature.isGloballyEnabled ? (
                                    <span className="text-xs font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 py-1 rounded">GLOBAL ON</span>
                                ) : (
                                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3" /> GLOBAL KILL
                                    </span>
                                )}

                                <button
                                    onClick={() => handleToggle(feature.featureId, isOverridden)}
                                    disabled={!!processingId}
                                    className={`
                    px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${isOverridden
                                            ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A]'
                                            : 'bg-white/5 text-[#8E8E93] hover:bg-white/10 hover:text-white border border-white/10'}
                  `}
                                >
                                    {processingId === feature.featureId ? '...' : isOverridden ? 'OVERRIDDEN' : 'DEFAULT'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeatureOverrides;
