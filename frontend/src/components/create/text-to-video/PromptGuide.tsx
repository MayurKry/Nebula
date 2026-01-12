
import { useState } from 'react';
import { X, Sparkles, AlertCircle, Check, BookOpen } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const PromptGuide = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
            >
                <BookOpen className="w-4 h-4" />
                Nebula Prompt Guide
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <GSAPTransition animation="scale-in" className="relative w-full max-w-3xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-[#00FF88]" />
                                Crafting the Perfect Nebula Prompt
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/10">
                            {/* Introduction */}
                            <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    Nebula's AI Video Engine (powered by our advanced V1 and Pro models) thrives on detail.
                                    Instead of simple queries, think like a <span className="text-white font-bold">Film Director</span> describing a shot to your crew.
                                </p>
                            </div>

                            {/* The Formula */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">The Golden Formula</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                        <span className="text-[#00FF88] font-black block mb-2">1. Subject</span>
                                        <p className="text-gray-500">Who/Action?</p>
                                        <div className="mt-2 text-[10px] text-gray-400 italic">"A cybernetic samurai drawing a katana..."</div>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                        <span className="text-blue-400 font-black block mb-2">2. Environment</span>
                                        <p className="text-gray-500">Where/Context?</p>
                                        <div className="mt-2 text-[10px] text-gray-400 italic">"...in a neon-lit rain-soaked alleyway..."</div>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                        <span className="text-pink-400 font-black block mb-2">3. Lighting/Style</span>
                                        <p className="text-gray-500">Mood/Aesthetic?</p>
                                        <div className="mt-2 text-[10px] text-gray-400 italic">"...volumetric fog, cyberpunk, cinematic lighting..."</div>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                        <span className="text-amber-400 font-black block mb-2">4. Camera</span>
                                        <p className="text-gray-500">Angle/Motion?</p>
                                        <div className="mt-2 text-[10px] text-gray-400 italic">"...slow tracking shot, low angle, 8k resolution."</div>
                                    </div>
                                </div>
                            </section>

                            {/* Do's and Don'ts */}
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-wider text-xs">
                                        <Check className="w-4 h-4" /> Do This
                                    </h4>
                                    <ul className="space-y-3 text-xs text-gray-400">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span>Use specific camera movements like "dolly zoom", "pan right".</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span>Mention lighting types: "Golden hour", "Neon lights".</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-xs">
                                        <AlertCircle className="w-4 h-4" /> Avoid This
                                    </h4>
                                    <ul className="space-y-3 text-xs text-gray-400">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span>Vague descriptions like "cool video".</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span>Asking for text rendering. AI struggles with text.</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Examples */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Examples</h3>
                                <div className="space-y-3">
                                    <div className="bg-[#1A1A1A] p-4 rounded-lg border-l-4 border-[#00FF88]">
                                        <p className="text-xs font-medium text-white mb-1">Cinematic Nature</p>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                            "Hyper-realistic drone shot flying through a misty pine forest at dawn, shafts of sunlight piercing through the trees, 4k, fluid motion, cinematic color grading."
                                        </p>
                                    </div>
                                    <div className="bg-[#1A1A1A] p-4 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-xs font-medium text-white mb-1">Sci-Fi Character</p>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                            "Medium shot of a female astronaut inspecting a glowing alien artifact, reflections on helmet visor, detailed spacesuit, ambient blue lighting, dust particles floating."
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </GSAPTransition>
                </div>
            )}
        </>
    );
};

export default PromptGuide;
