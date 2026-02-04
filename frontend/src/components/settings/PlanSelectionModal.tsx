import React, { useState } from 'react';
import { Check, X, Zap } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

interface PlanSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: string;
    onSelectPlan: (planId: string) => Promise<void>;
}

const plans = [
    {
        id: 'FREE',
        name: 'Starter',
        price: '0',
        features: ['100 AI credits/month', 'Basic rendering', '720p resolution'],
        credits: 100
    },
    {
        id: 'PRO',
        name: 'Creator',
        price: '79',
        features: ['1,000 AI credits/month', 'Priority rendering', '4K resolution', 'All AI engines'],
        credits: 1000
    },
    {
        id: 'TEAM',
        name: 'Team',
        price: '249',
        features: ['5,000 AI credits/month', 'Team workspace', 'Unlimited resolution', 'API access'],
        credits: 5000
    }
];

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({ isOpen, onClose, currentPlan, onSelectPlan }) => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!selectedPlan || selectedPlan === currentPlan.toUpperCase()) return;
        setIsSubmitting(true);
        try {
            await onSelectPlan(selectedPlan);
            onClose();
        } catch (error) {
            console.error('Failed to switch plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <GSAPTransition animation="scale-in" className="w-full max-w-4xl">
                <div className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white">Upgrade Your Experience</h2>
                            <p className="text-gray-400 text-sm">Choose the plan that fits your creative needs</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Plans Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === plan.id
                                    ? 'border-[#00FF88] bg-[#00FF88]/5'
                                    : plan.id === currentPlan.toUpperCase()
                                        ? 'border-purple-500/50 bg-purple-500/5'
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                                    }`}
                            >
                                {plan.id === currentPlan.toUpperCase() && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Current Plan
                                    </span>
                                )}

                                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-black text-white">${plan.price}</span>
                                    <span className="text-gray-500 text-sm">/mo</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                                            <Check className="w-4 h-4 text-[#00FF88] flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-orange-400" />
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase">Credits Awarded</div>
                                        <div className="text-sm font-bold text-white">{plan.credits} Credits</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                        <p className="text-xs text-gray-500 max-w-md">
                            Plan changes take effect immediately. Credits are awarded instantly upon selection.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedPlan || selectedPlan === currentPlan.toUpperCase() || isSubmitting}
                                className="px-8 py-2 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                                {selectedPlan === currentPlan.toUpperCase() ? 'Current Plan' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            </GSAPTransition>
        </div>
    );
};

export default PlanSelectionModal;
