import { useEffect, useState } from 'react';
import { Power, PowerOff, AlertTriangle, ShieldAlert, Zap, Lock } from 'lucide-react';
import { adminApi, type Feature } from '@/api/admin.api';
import ConfirmActionModal from '@/components/admin/ConfirmActionModal';
import { toast } from 'sonner';

const FeatureManagementPage = () => {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const response = await adminApi.getAllFeatures();
            setFeatures(response.data.data.features);
        } catch (error: any) {
            console.error('Failed to fetch features:', error);
            toast.error('Failed to load features');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleClick = (feature: Feature) => {
        setSelectedFeature(feature);
        setShowConfirmModal(true);
    };

    const handleConfirmToggle = async (reason?: string) => {
        if (!selectedFeature) return;

        setActionLoading(true);
        try {
            const isEnabling = !selectedFeature.isGloballyEnabled;
            await adminApi.toggleGlobalFeature(
                selectedFeature.featureId,
                isEnabling,
                reason || (isEnabling ? 'Re-enabling feature' : 'Emergency shutdown')
            );

            toast.success(`Feature ${isEnabling ? 'enabled' : 'disabled'} successfully`);
            setShowConfirmModal(false);
            await fetchFeatures();
        } catch (error: any) {
            toast.error('Failed to toggle feature');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white tracking-tight">Feature Control</h1>
                    <p className="text-[#8E8E93] text-lg font-medium">Global governance and emergency protocols</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest text-right">Emergency Mode Available</span>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-500/10 blur-[80px] -mr-16 -mt-16 group-hover:bg-yellow-500/20 transition-all duration-1000" />
                <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 relative z-10">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <p className="text-yellow-500 font-black text-2xl tracking-tight">Global Infrastructure Override</p>
                    <p className="text-yellow-400/60 mt-2 font-medium max-w-2xl leading-relaxed">
                        These controls exercise immediate privilege over all tenant configurations. Disabling a core feature will terminate all active processes platform-wide. Use with extreme caution.
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-[200px] bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : (
                    features.map((feature) => (
                        <div
                            key={feature.featureId}
                            className={`
                                feature-card border rounded-2xl p-6 transition-all duration-500 relative overflow-hidden group shadow-xl
                                ${feature.isGloballyEnabled
                                    ? 'bg-[#141414] border-white/5 hover:border-[#00FF88]/30'
                                    : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
                                        ${feature.isGloballyEnabled
                                            ? 'bg-[#00FF88]/10 text-[#00FF88] group-hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                                            : 'bg-red-500/10 text-red-500'
                                        }
                                    `}>
                                        {feature.isGloballyEnabled ? <Power className="w-6 h-6" /> : <PowerOff className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg tracking-tight group-hover:text-white transition-colors">{feature.name}</h3>
                                        <p className="text-[#8E8E93] text-[10px] font-black font-mono tracking-tighter uppercase mt-0.5">{feature.featureId}</p>
                                    </div>
                                </div>

                                <div className={`
                                    px-3 py-1 rounded-full text-[10px] font-black tracking-[0.1em] border transition-all duration-500
                                    ${feature.isGloballyEnabled
                                        ? 'bg-[#00FF88]/5 text-[#00FF88] border-[#00FF88]/20 group-hover:bg-[#00FF88]/10'
                                        : 'bg-red-500/5 text-red-500 border-red-500/20'}
                                `}>
                                    {feature.isGloballyEnabled ? 'OPERATIONAL' : 'OFFLINE'}
                                </div>
                            </div>

                            {!feature.isGloballyEnabled && feature.disabledReason && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl relative overflow-hidden">
                                    <div className="absolute right-0 bottom-0 p-2 opacity-10">
                                        <Lock className="w-8 h-8 text-red-500" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                        <ShieldAlert className="w-4 h-4 text-red-500" />
                                        <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">Protocol Restriction</p>
                                    </div>
                                    <p className="text-red-400 text-sm font-medium leading-relaxed relative z-10">"{feature.disabledReason}"</p>
                                    {feature.disabledAt && (
                                        <p className="text-red-400/40 text-[10px] mt-2 font-black tracking-widest uppercase">
                                            {new Date(feature.disabledAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => handleToggleClick(feature)}
                                className={`
                                    w-full px-4 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3
                                    ${feature.isGloballyEnabled
                                        ? 'bg-transparent text-gray-500 hover:text-red-500 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30'
                                        : 'bg-[#00FF88] text-[#0A0A0A] hover:opacity-90 shadow-lg shadow-[#00FF88]/10'
                                    }
                                `}
                            >
                                <Zap className={`w-4 h-4 ${feature.isGloballyEnabled ? 'hidden' : 'block'}`} />
                                {feature.isGloballyEnabled ? 'Initiate Shutdown' : 'Restore Operation'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <ConfirmActionModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => handleConfirmToggle()}
                title={selectedFeature?.isGloballyEnabled ? 'Confirm Emergency Shutdown?' : 'Confirm Operation Restore?'}
                message={selectedFeature?.isGloballyEnabled
                    ? `Initiating shut-down protocol for ${selectedFeature?.name}. This action will revoke access for all nodes and tenants immediately.`
                    : `Restoring full operational status to ${selectedFeature?.name} module.`
                }
                confirmText={selectedFeature?.isGloballyEnabled ? 'Execute Shutdown' : 'Confirm Restore'}
                confirmationType={selectedFeature?.isGloballyEnabled ? 'danger' : 'info'}
                requiresTyping={selectedFeature?.isGloballyEnabled}
                typingText={selectedFeature?.isGloballyEnabled ? 'SHUTDOWN' : undefined}
                isLoading={actionLoading}
            />
        </div>
    );
};

export default FeatureManagementPage;
