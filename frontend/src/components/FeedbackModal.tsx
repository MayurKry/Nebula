import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Bug, Sparkles, MessageCircle, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';

const FeedbackModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post('/support/feedback', {
                category,
                rating,
                message
            });

            if (response.data.success) {
                setIsSuccess(true);
                toast.success('We hear you! Thanks for the feedback.');

                setTimeout(() => {
                    setIsOpen(false);
                    setTimeout(() => {
                        setIsSuccess(false);
                        setMessage('');
                        setRating(0);
                        setCategory('general');
                    }, 400);
                }, 2000);
            }
        } catch (error: any) {
            console.error('Feedback Error:', error);
            toast.error('Sync failed. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
            {/* Ultra-Blur Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[12px] pointer-events-auto transition-opacity duration-500 animate-in fade-in"
                onClick={() => !isSubmitting && setIsOpen(false)}
            />

            {/* Modal Content Wrapper */}
            <div className="relative w-full max-w-xl mx-4 pointer-events-auto overflow-hidden">
                <div
                    ref={modalRef}
                    className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                    {/* Futuristic Background Accents */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00FF88]/10 blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                    {isSuccess ? (
                        <div className="py-24 px-12 text-center space-y-8 relative z-10 flex flex-col items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#00FF88] blur-2xl opacity-20 animate-pulse" />
                                <div className="w-24 h-24 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-[2rem] flex items-center justify-center relative rotate-12 transition-transform hover:rotate-0 duration-500">
                                    <CheckCircle2 className="w-12 h-12 text-[#0A0A0A]" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-white tracking-tighter">MISSION COMPLETE</h2>
                                <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-xs mx-auto">
                                    Your feedback has been transmitted to our engineering team.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-3 text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nebula Core Integrated</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full max-h-[85vh]">
                            {/* Premium Header */}
                            <div className="px-10 pt-10 pb-6 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/10 flex items-center justify-center group shadow-inner">
                                        <Sparkles className="w-7 h-7 text-[#00FF88] group-hover:rotate-12 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Feedback</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Improvement System</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form Area with Scrollable Body */}
                            <div className="px-10 pb-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                                <form onSubmit={handleSubmit} className="space-y-10">

                                    {/* Category Selection - New Horizontal Style */}
                                    <div className="space-y-5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] flex items-center gap-3">
                                            <div className="h-px flex-1 bg-white/5" />
                                            Select Category
                                            <div className="h-px flex-1 bg-white/5" />
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'general', label: 'Inquiry', icon: MessageCircle, color: 'text-blue-400' },
                                                { id: 'bug', label: 'Glitch', icon: Bug, color: 'text-red-400' },
                                                { id: 'feature', label: 'Ideate', icon: Sparkles, color: 'text-[#00FF88]' }
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id as any)}
                                                    className={`py-5 px-3 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-3 group relative overflow-hidden ${category === cat.id
                                                        ? 'bg-white/[0.05] border-[#00FF88]/40 shadow-[0_12px_24px_-8px_rgba(0,255,136,0.3)]'
                                                        : 'bg-transparent border-white/[0.03] hover:border-white/10 hover:bg-white/[0.02]'
                                                        }`}
                                                >
                                                    {category === cat.id && (
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF88]/30" />
                                                    )}
                                                    <cat.icon className={`w-6 h-6 transition-all duration-500 ${category === cat.id ? cat.color + ' scale-110' : 'text-gray-600 group-hover:text-gray-400'
                                                        }`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${category === cat.id ? 'text-white' : 'text-gray-600'
                                                        }`}>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Unified Rating & Input Box */}
                                    <div className="space-y-5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] flex items-center gap-3">
                                            <div className="h-px flex-1 bg-white/5" />
                                            Your Input
                                            <div className="h-px flex-1 bg-white/5" />
                                        </label>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6 focus-within:border-[#00FF88]/20 transition-all duration-500 shadow-inner">
                                            {/* Rating Stars - Large & Aesthetic */}
                                            <div className="flex items-center justify-between pb-6 border-b border-white/[0.03]">
                                                <span className="text-xs font-bold text-gray-400">Rate Experience</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setRating(star)}
                                                            className="p-1.5 transition-all hover:scale-125 group relative"
                                                        >
                                                            <Star
                                                                className={`w-7 h-7 transition-all duration-300 ${rating >= star
                                                                    ? 'fill-[#00FF88] text-[#00FF88] drop-shadow-[0_0_12px_rgba(0,255,136,0.4)]'
                                                                    : 'text-gray-800'
                                                                    }`}
                                                            />
                                                            {rating === star && (
                                                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00FF88]" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Textarea Wrapper */}
                                            <div className="relative">
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                                                    placeholder="Transmitting thoughts to the Nebula Core..."
                                                    required
                                                    className="w-full h-44 bg-transparent text-white placeholder-gray-700 focus:outline-none transition-all text-sm leading-relaxed resize-none font-medium custom-scrollbar"
                                                />
                                                <div className="absolute bottom-0 right-0 flex items-center gap-2">
                                                    <span className={`text-[9px] font-black tracking-[0.1em] ${message.length > 900 ? 'text-red-400' : 'text-gray-600'}`}>
                                                        {message.length} <span className="text-gray-800">/</span> 1000
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button - High Tech Style */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !message.trim()}
                                            className="relative w-full py-5 bg-[#00FF88] text-[#050505] font-black rounded-[1.5rem] overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,255,136,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed"
                                        >
                                            {/* Dynamic scan line effect */}
                                            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />

                                            <div className="relative flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[11px] font-black">
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                                                        <span>Processing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Submit Signal</span>
                                                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                                                    </>
                                                )}
                                            </div>
                                        </button>

                                        <div className="flex flex-col items-center gap-4 mt-8">
                                            <div className="flex items-center gap-6">
                                                <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest cursor-default">Encrypted</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest cursor-default">Realtime</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest cursor-default">Anonymous</span>
                                            </div>
                                            <p className="text-[9px] text-[#00FF88]/40 font-bold uppercase tracking-[0.2em]">
                                                nebula systems interface v2.4.0
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="hidden sm:flex items-center gap-2.5 px-5 py-2 text-[10px] font-black text-gray-400 hover:text-[#00FF88] border border-white/5 hover:border-[#00FF88]/30 bg-white/[0.02] hover:bg-[#00FF88]/5 rounded-full transition-all duration-300 group overflow-hidden relative uppercase tracking-widest"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Feedback</span>
            </button>

            {/* Mobile icon version */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex sm:hidden p-3 text-gray-400 hover:text-[#00FF88] transition-all rounded-2xl hover:bg-[#00FF88]/10 border border-transparent hover:border-[#00FF88]/20"
            >
                <MessageSquare className="w-5 h-5" />
            </button>

            {isOpen && createPortal(modalContent, document.body)}
        </>
    );
};

export default FeedbackModal;
