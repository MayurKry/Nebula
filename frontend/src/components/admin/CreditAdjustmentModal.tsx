import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

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
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const numAmount = parseInt(amount);

        // Validation
        if (!numAmount || numAmount <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        if (type === 'deduct' && numAmount > currentBalance) {
            setError(`Cannot deduct more than current balance (${currentBalance})`);
            return;
        }

        if (!reason.trim()) {
            setError('Reason is required');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(numAmount, reason, type);
            // Reset form
            setAmount('');
            setReason('');
            setType('grant');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to adjust credits');
        } finally {
            setIsLoading(false);
        }
    };

    const newBalance = type === 'grant'
        ? currentBalance + (parseInt(amount) || 0)
        : currentBalance - (parseInt(amount) || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tight">Adjust Credits</h2>
                    <button
                        onClick={onClose}
                        className="text-[#8E8E93] hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tenant Info */}
                <div className="bg-[#1F1F1F] border border-white/10 rounded-xl p-4 mb-6">
                    <p className="text-[#8E8E93] text-sm font-medium mb-1">Tenant</p>
                    <p className="text-white font-bold text-lg">{tenantName}</p>
                    <p className="text-[#8E8E93] text-sm mt-2">
                        Current Balance: <span className="text-[#00FF88] font-bold">{currentBalance.toLocaleString()}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-3">Action Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType('grant')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${type === 'grant'
                                        ? 'bg-[#00FF88]/10 text-[#00FF88] border-2 border-[#00FF88]'
                                        : 'bg-[#1F1F1F] text-[#8E8E93] border border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <Plus className="w-5 h-5" />
                                Grant Credits
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('deduct')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${type === 'deduct'
                                        ? 'bg-red-500/10 text-red-500 border-2 border-red-500'
                                        : 'bg-[#1F1F1F] text-[#8E8E93] border border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <Minus className="w-5 h-5" />
                                Deduct Credits
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                            required
                            className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#00FF88] transition-all font-mono text-lg"
                        />
                        {amount && (
                            <p className="mt-2 text-sm font-medium">
                                New Balance: <span className={`font-bold ${newBalance >= 0 ? 'text-[#00FF88]' : 'text-red-500'}`}>
                                    {newBalance.toLocaleString()}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why you are adjusting credits..."
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#00FF88] transition-all resize-none"
                        />
                        <p className="mt-1 text-xs text-[#8E8E93]">This will be logged for audit purposes</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 border rounded-xl font-bold transition-all disabled:opacity-50 ${type === 'grant'
                                    ? 'bg-[#00FF88] hover:bg-[#00CC6A] text-black border-[#00FF88]/20'
                                    : 'bg-red-600 hover:bg-red-700 text-white border-red-500/20'
                                }`}
                        >
                            {isLoading ? 'Processing...' : type === 'grant' ? 'Grant Credits' : 'Deduct Credits'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreditAdjustmentModal;
