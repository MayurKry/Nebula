import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CreditCard, Lock, ArrowLeft, Check, Shield
} from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const resource = location.state?.resource;

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!resource) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">No resource selected</h2>
                    <button
                        onClick={() => navigate('/app/library')}
                        className="px-6 py-3 bg-[#00FF88] text-black font-bold rounded-xl hover:bg-[#00CC6A] transition-colors"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success('Payment successful! Resource added to your library.');
        setIsProcessing(false);
        navigate('/app/library');
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-4xl mx-auto space-y-8">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/app/library')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Library
                </button>

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4">
                        <div className="inline-flex p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-2">
                            <CreditCard className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Checkout</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Complete your purchase to unlock premium resources
                        </p>
                    </div>
                </GSAPTransition>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Payment Form */}
                    <GSAPTransition animation="fade-in-up" delay={0.1} className="lg:col-span-2">
                        <div className="bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                <Lock className="w-5 h-5 text-[#00FF88]" />
                                <span className="text-sm font-bold text-gray-400">Secure Payment</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Card Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            required
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/40 transition-colors"
                                        />
                                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                    </div>
                                </div>

                                {/* Card Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/40 transition-colors"
                                    />
                                </div>

                                {/* Expiry and CVV */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="text"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            required
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/40 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                            placeholder="123"
                                            maxLength={3}
                                            required
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/40 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Security Notice */}
                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                    <Shield className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-gray-400">
                                        <p className="font-bold text-white mb-1">Your payment is secure</p>
                                        <p>We use industry-standard encryption to protect your payment information.</p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Pay ${resource.price}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </GSAPTransition>

                    {/* Order Summary */}
                    <GSAPTransition animation="fade-in-up" delay={0.2} className="lg:col-span-1">
                        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 space-y-6 sticky top-8">
                            <h3 className="text-lg font-bold text-white">Order Summary</h3>

                            {/* Resource Preview */}
                            <div className="space-y-3">
                                <div className="aspect-video rounded-xl overflow-hidden">
                                    <img
                                        src={resource.thumbnail}
                                        alt={resource.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">{resource.title}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">{resource.description}</p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white font-bold">${resource.price}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Tax</span>
                                    <span className="text-white font-bold">$0.00</span>
                                </div>
                                <div className="flex items-center justify-between text-lg pt-3 border-t border-white/5">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-[#00FF88] font-black">${resource.price}</span>
                                </div>
                            </div>

                            {/* What's Included */}
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">What's Included</p>
                                <div className="space-y-2">
                                    {[
                                        'Lifetime access',
                                        'Commercial license',
                                        'Free updates',
                                        'Premium support'
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                            <Check className="w-4 h-4 text-[#00FF88]" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GSAPTransition>

                </div>

            </main>
        </div>
    );
};

export default PaymentPage;
