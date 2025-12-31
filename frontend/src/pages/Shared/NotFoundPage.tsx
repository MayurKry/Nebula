import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF88]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />

            <GSAPTransition animation="scale-in" duration={1.2}>
                <div className="text-center relative z-10">
                    <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/20 to-transparent opacity-20 select-none">
                        404
                    </h1>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
                        <GSAPTransition animation="fade-in-up" delay={0.4}>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                Lost in Nebula?
                            </h2>
                        </GSAPTransition>

                        <GSAPTransition animation="fade-in-up" delay={0.6}>
                            <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto mb-10 leading-relaxed">
                                The page you are looking for has drifted into deep space or never existed in this dimension.
                            </p>
                        </GSAPTransition>

                        <GSAPTransition animation="fade-in-up" delay={0.8}>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-full font-medium transition-all group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Go Back
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#00FF88] text-[#0A0A0A] hover:bg-[#00FF88]/90 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]"
                                >
                                    <Home className="w-4 h-4" />
                                    Return Home
                                </button>
                            </div>
                        </GSAPTransition>
                    </div>
                </div>
            </GSAPTransition>

            {/* Decorative Stars */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotFoundPage;
