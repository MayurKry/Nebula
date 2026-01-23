import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, ShieldAlert, CheckCircle, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
    const modalRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (isOpen) {
            gsap.fromTo(modalRef.current,
                { scale: 0.95, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
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

    const canConfirm = !requiresTyping || inputValue === typingText;

    const getColors = () => {
        switch (confirmationType) {
            case 'danger':
                return {
                    bg: 'bg-red-600',
                    text: 'text-red-500',
                    border: 'border-red-500/20',
                    shadow: 'shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)]',
                    icon: ShieldAlert
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-600',
                    text: 'text-yellow-500',
                    border: 'border-yellow-500/20',
                    shadow: 'shadow-[0_20px_40px_-10px_rgba(202,138,4,0.3)]',
                    icon: AlertTriangle
                };
            case 'info':
                return {
                    bg: 'bg-[#00FF88]',
                    text: 'text-[#00FF88]',
                    border: 'border-[#00FF88]/20',
                    shadow: 'shadow-[0_20px_40px_-10px_rgba(0,255,136,0.3)]',
                    icon: ShieldCheck
                };
            default:
                return {
                    bg: 'bg-red-600',
                    text: 'text-red-500',
                    border: 'border-red-500/20',
                    shadow: 'shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)]',
                    icon: ShieldAlert
                };
        }
    };

    const colors = getColors();
    const Icon = colors.icon;

    const handleConfirm = () => {
        if (canConfirm && !isLoading) {
            onConfirm();
            setInputValue('');
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in active:opacity-100"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-w-md w-full overflow-hidden"
            >
                <div className="p-8 sm:p-10 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 border-white/5 relative ${colors.text} bg-white/[0.02]`}>
                            <div className={`absolute inset-0 rounded-[2rem] blur-2xl opacity-20 ${colors.bg}`} />
                            <Icon className="w-10 h-10 relative z-10" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-white tracking-widest uppercase">{title}</h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed px-4">{message}</p>
                        </div>

                        {requiresTyping && (
                            <div className="w-full space-y-3 pt-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Type <span className="text-white">"{typingText}"</span> to authorize</label>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={typingText}
                                    className="w-full px-6 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-800 focus:outline-none focus:border-white/10 transition-all text-center font-mono text-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="flex gap-4 w-full pt-4">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 px-6 py-4 bg-[#141414] border border-white/5 rounded-2xl text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-30"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!canConfirm || isLoading}
                                className={`flex-[2] relative group overflow-hidden px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 disabled:grayscale ${colors.bg} ${confirmationType === 'info' ? 'text-[#0A0A0A]' : 'text-white'} ${colors.shadow}`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                                <div className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    <span>{isLoading ? 'Processing...' : confirmText}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ConfirmActionModal;
