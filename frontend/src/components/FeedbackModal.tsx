import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bug, Sparkles, MessageCircle, Star, CheckCircle2 } from 'lucide-react';
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (!isSubmitting) setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                toast.success('Thank you for your feedback!');

                setTimeout(() => {
                    setIsOpen(false);
                    setIsSuccess(false);
                    setMessage('');
                    setRating(0);
                    setCategory('general');
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            // Error is handled by axios interceptor toast, but we can add more if needed
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-[#00FF88] border border-white/5 hover:border-[#00FF88]/20 bg-white/5 hover:bg-[#00FF88]/10 rounded-full transition-all group"
            >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feedback</span>
            </button>

            {/* Mobile icon version */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex sm:hidden p-2 text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5"
            >
                <MessageSquare className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        ref={modalRef}
                        className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-400"
                    >
                        {isSuccess ? (
                            <div className="py-20 px-10 text-center space-y-6">
                                <div className="w-20 h-20 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-full flex items-center justify-center mx-auto scale-110 animate-bounce">
                                    <CheckCircle2 className="w-10 h-10 text-[#00FF88]" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white">Feedback Received!</h2>
                                    <p className="text-gray-400 font-medium">Your input helps us build the future of Nebula.</p>
                                </div>
                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest pt-4">Closing in a few seconds...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#00FF88]/10 flex items-center justify-center border border-[#00FF88]/20">
                                            <Sparkles className="w-5 h-5 text-[#00FF88]" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white tracking-tight">Send Feedback</h2>
                                            <p className="text-xs text-gray-500 font-medium">Help us improve your experience</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Body */}
                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    {/* Categories */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">What's on your mind?</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'general', label: 'General', icon: MessageCircle },
                                                { id: 'bug', label: 'Bug Report', icon: Bug },
                                                { id: 'feature', label: 'Feature', icon: Sparkles }
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id as any)}
                                                    className={`py-3 px-2 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${category === cat.id ? 'bg-[#00FF88]/10 border-[#00FF88]/30' : 'bg-[#1A1A1A] border-white/5 hover:border-white/20'}`}
                                                >
                                                    <cat.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${category === cat.id ? 'text-[#00FF88]' : 'text-gray-500'}`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${category === cat.id ? 'text-white' : 'text-gray-500'}`}>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">How's your experience so far?</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setRating(star)}
                                                    className="p-1 transition-all hover:scale-125 hover:-rotate-12"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 transition-colors ${rating >= star ? 'fill-[#00FF88] text-[#00FF88]' : 'text-gray-800'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Your message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what you think..."
                                            required
                                            className="w-full h-32 px-5 py-4 bg-[#1A1A1A] border border-white/5 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-[#00FF88]/30 focus:ring-1 focus:ring-[#00FF88]/30 transition-all text-sm resize-none"
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !message.trim()}
                                            className="w-full py-4 bg-[#00FF88] text-[#0A0A0A] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#00FF88]/10 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
                                                    Sending...
                                                </div>
                                            ) : (
                                                <>
                                                    Submit Feedback
                                                    <Send className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-gray-600 font-medium text-center mt-4">
                                            By submitting, you agree to our <span className="underline cursor-pointer hover:text-gray-400">Terms of Service</span>.
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackModal;
