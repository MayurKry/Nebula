import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Minus, Zap, ShieldAlert, History } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CreditAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, reason: string, type: 'grant' | 'deduct') => Promise<void>;
    tenantName: string;
    currentBalance: number;
}

const CreditAdjustmentModal = ({
    isOpen,
    onClose,
    onSubmit,
    tenantName,
    currentBalance,
}: CreditAdjustmentModalProps) => {
    const [type, setType] = useState<'grant' | 'deduct'>('grant');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (isOpen) {
            gsap.fromTo(modalRef.current,
                { y: 30, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power4.out' }
            );
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount);

        if (!numAmount || numAmount <= 0) return;
        if (type === 'deduct' && numAmount > currentBalance) return;
        if (!reason.trim()) return;

        setIsLoading(true);
        try {
            await onSubmit(numAmount, reason, type);
            setAmount('');
            setReason('');
            setType('grant');
            onClose();
        } catch (err: any) {
            // Error managed by parent toast
        } finally {
            setIsLoading(false);
        }
    };

    const newBalance = type === 'grant'
        ? currentBalance + (parseInt(amount) || 0)
        : currentBalance - (parseInt(amount) || 0);

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-w-lg w-full overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-[#00FF88]/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="p-8 sm:p-10 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${type === 'grant' ? 'bg-[#00FF88]/5 border-[#00FF88]/20 text-[#00FF88]' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                                <Zap className={`w-6 h-6 ${type === 'deduct' ? 'rotate-180' : ''}`} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-widest uppercase">Fuel Adjustment</h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-0.5">Nebula Energy Controller</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 bg-[#141414] border border-white/5 rounded-3xl mb-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Entity</span>
                            <span className="text-white font-black uppercase text-sm tracking-tight">{tenantName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Available Reserve</span>
                            <span className="text-[#00FF88] font-black text-xl tabular-nums">{currentBalance.toLocaleString()} <span className="text-[10px] opacity-50 ml-1">CP</span></span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-3 p-1 bg-[#141414] border border-white/5 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setType('grant')}
                                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === 'grant' ? 'bg-white/5 text-[#00FF88] border border-white/10' : 'text-gray-600 hover:text-white'}`}
                            >
                                <Plus className="w-3 h-3" />
                                Grant Fuel
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('deduct')}
                                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === 'deduct' ? 'bg-red-500/5 text-red-500 border border-red-500/10' : 'text-gray-600 hover:text-white'}`}
                            >
                                <Minus className="w-3 h-3" />
                                Deduct Fuel
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Quantum Amount</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        min="1"
                                        required
                                        className="w-full px-6 py-5 bg-[#141414] border border-white/5 rounded-3xl text-white placeholder-gray-800 focus:outline-none focus:border-white/10 transition-all font-black text-2xl tabular-nums"
                                    />
                                    {amount && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Flux Result</p>
                                            <p className={`text-xs font-black tabular-nums transition-colors ${newBalance >= 0 ? 'text-[#00FF88]' : 'text-red-500'}`}>
                                                {newBalance.toLocaleString()} CP
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Authorization Reason</label>
                                <div className="relative group">
                                    <History className="absolute left-6 top-6 w-5 h-5 text-gray-700 group-focus-within:text-white transition-colors" />
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Ledger entry description..."
                                        required
                                        rows={3}
                                        className="w-full pl-16 pr-6 py-5 bg-[#141414] border border-white/5 rounded-3xl text-white placeholder-gray-800 focus:outline-none focus:border-white/10 transition-all resize-none text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-8 py-5 bg-[#141414] border border-white/5 rounded-[1.5rem] text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !amount || !reason}
                                className={`flex-[2] overflow-hidden relative group px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 disabled:grayscale ${type === 'grant' ? 'bg-[#00FF88] text-[#0A0A0A] hover:shadow-[0_20px_40px_-10px_rgba(0,255,136,0.3)]' : 'bg-red-600 text-white hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)]'}`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                                <div className="relative flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldAlert className="w-4 h-4" />
                                            <span>Authorize Shift</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CreditAdjustmentModal;
