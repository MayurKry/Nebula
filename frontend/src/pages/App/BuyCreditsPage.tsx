import { useState } from 'react';
import { CreditCard, Zap, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface CreditPackage {
    id: string;
    credits: number;
    price: number;
    popular?: boolean;
    bonus?: number;
}

const CREDIT_PACKAGES: CreditPackage[] = [
    {
        id: 'starter',
        credits: 500,
        price: 10,
    },
    {
        id: 'pro',
        credits: 1500,
        price: 25,
        bonus: 100,
        popular: true,
    },
    {
        id: 'business',
        credits: 3000,
        price: 45,
        bonus: 300,
    },
    {
        id: 'enterprise',
        credits: 10000,
        price: 120,
        bonus: 1500,
    },
];

const BuyCreditsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePurchase = async (pkg: CreditPackage) => {
        setSelectedPackage(pkg.id);
        setIsProcessing(true);

        try {
            // TODO: Integrate with actual payment gateway (Stripe, Razorpay, etc.)
            // For now, this is a placeholder
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success(`Successfully purchased ${pkg.credits + (pkg.bonus || 0)} credits!`);

            // Redirect back to dashboard after successful purchase
            setTimeout(() => {
                navigate('/app/dashboard');
            }, 1500);
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
            setSelectedPackage(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-[#00FF88]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">Buy Credits</h1>
                            <p className="text-[#8E8E93] text-lg font-medium mt-1">
                                Power your AI creations with additional credits
                            </p>
                        </div>
                    </div>

                    {/* Current Balance */}
                    <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-[#141414] border border-white/10 rounded-2xl">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <div>
                            <p className="text-[#8E8E93] text-xs font-black uppercase tracking-widest">Current Balance</p>
                            <p className="text-white text-xl font-black tabular-nums">
                                {user?.credits?.toLocaleString() || 0} Credits
                            </p>
                        </div>
                    </div>
                </div>

                {/* Credit Packages */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CREDIT_PACKAGES.map((pkg) => {
                        const totalCredits = pkg.credits + (pkg.bonus || 0);
                        const isSelected = selectedPackage === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                className={`
                                    relative bg-[#141414] border rounded-3xl p-8 transition-all duration-300
                                    ${pkg.popular
                                        ? 'border-[#00FF88]/40 shadow-[0_0_40px_rgba(0,255,136,0.1)]'
                                        : 'border-white/10 hover:border-white/20'
                                    }
                                    ${isSelected ? 'scale-95 opacity-50' : 'hover:scale-105'}
                                `}
                            >
                                {/* Popular Badge */}
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00FF88] text-black text-xs font-black uppercase tracking-widest rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                {/* Bonus Badge */}
                                {pkg.bonus && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider rounded-full">
                                        +{pkg.bonus} Bonus
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Icon */}
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center
                                        ${pkg.popular
                                            ? 'bg-[#00FF88]/10 border border-[#00FF88]/20'
                                            : 'bg-white/5 border border-white/10'
                                        }
                                    `}>
                                        <CreditCard className={`w-7 h-7 ${pkg.popular ? 'text-[#00FF88]' : 'text-white'}`} />
                                    </div>

                                    {/* Credits */}
                                    <div>
                                        <p className="text-[#8E8E93] text-xs font-black uppercase tracking-widest mb-2">
                                            Total Credits
                                        </p>
                                        <p className="text-4xl font-black tracking-tight">
                                            {totalCredits.toLocaleString()}
                                        </p>
                                        {pkg.bonus && (
                                            <p className="text-purple-400 text-sm font-bold mt-1">
                                                {pkg.credits.toLocaleString()} + {pkg.bonus.toLocaleString()} bonus
                                            </p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black">${pkg.price}</span>
                                            <span className="text-[#8E8E93] text-sm font-medium">USD</span>
                                        </div>
                                        <p className="text-[#8E8E93] text-xs mt-1">
                                            ${(pkg.price / totalCredits).toFixed(3)} per credit
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-[#00FF88]" />
                                            <span className="text-[#8E8E93]">Instant delivery</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-[#00FF88]" />
                                            <span className="text-[#8E8E93]">Never expires</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-[#00FF88]" />
                                            <span className="text-[#8E8E93]">All AI models</span>
                                        </div>
                                    </div>

                                    {/* Purchase Button */}
                                    <button
                                        onClick={() => handlePurchase(pkg)}
                                        disabled={isProcessing}
                                        className={`
                                            w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                                            transition-all duration-300 flex items-center justify-center gap-2
                                            ${pkg.popular
                                                ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A] shadow-lg shadow-[#00FF88]/20'
                                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {isSelected ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                Purchase Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Section */}
                <div className="mt-12 p-8 bg-[#141414] border border-white/10 rounded-3xl">
                    <h3 className="text-xl font-black mb-4">Payment Information</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-[#8E8E93]">
                        <div>
                            <p className="font-bold text-white mb-2">Secure Payment</p>
                            <p>All transactions are encrypted and secure. We accept major credit cards and digital payment methods.</p>
                        </div>
                        <div>
                            <p className="font-bold text-white mb-2">Need More Credits?</p>
                            <p>For bulk purchases or enterprise plans, please contact our sales team for custom pricing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyCreditsPage;
