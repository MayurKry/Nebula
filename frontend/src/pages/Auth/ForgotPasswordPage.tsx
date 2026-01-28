import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row overflow-hidden">
            {/* Left Side: Video Showreel */}
            <div className="relative md:w-1/2 h-[30vh] md:h-screen overflow-hidden border-r border-white/5">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="https://cdn.pixabay.com/video/2016/10/21/6044-188286505_large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

                {/* Logo and Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between z-10">
                    <div className="inline-flex items-center gap-2">
                        <img src="/nebula-logo.png" alt="Nebula" className="h-10 object-contain brightness-0 invert" />
                    </div>

                    <div className="max-w-md space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
                            Secure Your <br />
                            <span className="text-[#00FF88]">Nebula Account.</span>
                        </h2>
                        <p className="text-base text-gray-300 font-medium leading-relaxed opacity-80">
                            Reset your password to get back to creating stunning AI content.
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00FF88] rounded-full" /> GEN-3 ALPHA</span>
                        <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00FF88] rounded-full" /> MULTI-MODAL</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Part */}
            <div className="md:w-1/2 h-screen flex flex-col bg-[#0A0A0A] z-20 overflow-y-auto custom-scrollbar">
                <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-20">
                    <div className="w-full max-w-sm space-y-8">
                        {isSubmitted ? (
                            // Success state
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-[#00FF88]/10 flex items-center justify-center mx-auto border border-[#00FF88]/20">
                                    <CheckCircle className="w-10 h-10 text-[#00FF88]" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black text-white tracking-tight">Check your email</h1>
                                    <p className="text-gray-400">
                                        We've sent a password reset link to <br />
                                        <span className="text-white font-bold">{email}</span>
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-[#00FF88] hover:underline font-bold"
                                    >
                                        try again
                                    </button>
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest hover:text-[#00FF88] transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Back to sign in
                                </Link>
                            </div>
                        ) : (
                            // Form state
                            <>
                                <div className="space-y-2 text-center">
                                    <h1 className="text-3xl font-black text-white tracking-tight">Forgot password?</h1>
                                    <p className="text-gray-400">
                                        No worries, we'll send you reset instructions.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email address"
                                                required
                                                className="w-full px-5 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl text-sm"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                SENDING LINK...
                                            </div>
                                        ) : (
                                            'SEND RESET LINK'
                                        )}
                                    </button>
                                </form>

                                <div className="text-center pt-4">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest hover:text-[#00FF88] transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3" />
                                        Back to sign in
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-8 text-center bg-[#0A0A0A]">
                    <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[.2em]">© 2026 Nebula Creative. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
