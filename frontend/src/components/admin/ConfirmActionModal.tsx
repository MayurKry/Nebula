import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmationType?: 'danger' | 'warning' | 'info';
    requiresTyping?: boolean;
    typingText?: string;
    isLoading?: boolean;
}

const ConfirmActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmationType = 'danger',
    requiresTyping = false,
    typingText = '',
    isLoading = false,
}: ConfirmActionModalProps) => {
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const canConfirm = !requiresTyping || inputValue === typingText;

    const getButtonColor = () => {
        switch (confirmationType) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 border-red-500/20';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500/20';
            case 'info':
                return 'bg-[#00FF88] hover:bg-[#00CC6A] text-black border-[#00FF88]/20';
            default:
                return 'bg-red-600 hover:bg-red-700 border-red-500/20';
        }
    };

    const handleConfirm = () => {
        if (canConfirm && !isLoading) {
            onConfirm();
            setInputValue('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confirmationType === 'danger' ? 'bg-red-500/10 border border-red-500/20' :
                                confirmationType === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                    'bg-[#00FF88]/10 border border-[#00FF88]/20'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${confirmationType === 'danger' ? 'text-red-500' :
                                    confirmationType === 'warning' ? 'text-yellow-500' :
                                        'text-[#00FF88]'
                                }`} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#8E8E93] hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-[#8E8E93] mb-6 font-medium leading-relaxed">{message}</p>

                {/* Typing Confirmation */}
                {requiresTyping && (
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-white mb-2">
                            Type <span className="text-[#00FF88]">{typingText}</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={typingText}
                            className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#00FF88] transition-all font-mono"
                            autoFocus
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                        className={`flex-1 px-4 py-3 border rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal;
