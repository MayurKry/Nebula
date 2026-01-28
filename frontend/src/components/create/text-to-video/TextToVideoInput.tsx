
import React, { useState } from 'react';
import { Sparkles, Ratio, Zap } from 'lucide-react';
import PromptBar from '@/components/ui/PromptBar';
import PromptGuide from './PromptGuide';
import PromptBuilder from './PromptBuilder';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

interface TextToVideoInputProps {
    onGenerate: (data: { prompt: string; settings: any }) => void;
    isGenerating: boolean;
}

const TextToVideoInput: React.FC<TextToVideoInputProps> = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);

    // Default Settings
    const [settings, setSettings] = useState({
        model: 'gen3a_turbo', // 'gen3a_turbo' | 'veo3.1_fast'
        duration: 5,
        aspectRatio: '16:9',
        quality: 'Pro'
    });

    // Credit Calculation
    const estimateCredits = () => {
        const rate = settings.model === 'veo3.1_fast' ? 5 : 5; // Both are 5 per sec currently, but can be adjusted
        return settings.duration * rate;
    };

    const handleEnhance = async () => {
        if (!prompt.trim()) return;
        setIsEnhancing(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            const enhancements = [
                "cinematic lighting, 8k resolution, highly detailed",
                "volumetric fog, photorealistic, shot on 35mm",
                "dramatic angle, slow motion, award winning composition"
            ];
            const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];

            if (!prompt.includes(randomEnhancement)) {
                setPrompt(prev => `${prev}, ${randomEnhancement}`);
                toast.success("Prompt Enhanced with cinematic keywords!");
            } else {
                toast.info("Prompt is already optimized.");
            }
        } catch (error) {
            toast.error("Failed to enhance prompt.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt to generate video.");
            return;
        }
        onGenerate({ prompt, settings });
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
            <GSAPTransition animation="fade-in-up" className="w-full max-w-4xl space-y-8 z-10">

                {/* Header Section */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full mb-4">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Nebula AI Video 2.0</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-emerald-400">see?</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        transform text into cinema with our simplified professional engine.
                    </p>
                </div>

                {/* Control Grid (Visible Controls) */}
                <div className="bg-[#141414] border border-white/5 p-1 rounded-2xl flex flex-wrap items-center justify-center gap-2 md:inline-flex md:left-1/2 md:relative md:-translate-x-1/2 mb-6 shadow-2xl">

                    {/* Model Selector */}
                    <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                        {[
                            { id: 'gen3a_turbo', label: 'Fast', sub: 'Gen-3', icon: Zap, color: 'text-purple-400' },
                            { id: 'veo3.1_fast', label: 'Pro', sub: 'Veo', icon: Sparkles, color: 'text-[#00FF88]' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSettings(prev => ({ ...prev, model: m.id }))}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${settings.model === m.id
                                    ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">{m.sub}</span>
                                    <span className="text-[11px] font-bold leading-none">{m.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                    {/* Duration Selector */}
                    <div className="flex items-center gap-2">
                        {[5, 10].map(d => (
                            <button
                                key={d}
                                onClick={() => setSettings(prev => ({ ...prev, duration: d }))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${settings.duration === d
                                    ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                                    : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {d}s
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                    {/* Aspect Ratio Selector */}
                    <div className="flex items-center gap-1">
                        {['16:9', '9:16'].map(r => (
                            <button
                                key={r}
                                onClick={() => setSettings(prev => ({ ...prev, aspectRatio: r }))}
                                className={`px-3 py-2 rounded-lg transition-all border flex items-center gap-2 ${settings.aspectRatio === r
                                    ? 'bg-white text-black border-white shadow-lg'
                                    : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'
                                    }`}
                                title={`Aspect Ratio ${r}`}
                            >
                                <Ratio className={`w-3.5 h-3.5 ${r === '9:16' ? 'rotate-90' : ''}`} />
                                <span className="text-xs font-bold">{r}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Input Field */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[28px] blur-lg group-hover:blur-xl transition-all opacity-50 group-hover:opacity-100 duration-1000" />
                    <div className="relative">
                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            onEnhance={handleEnhance}
                            isGenerating={isGenerating}
                            isEnhancing={isEnhancing}
                            placeholder="Describe your scene (e.g., 'A cyberpunk street in rain, 4k')..."
                            settings={settings}
                            onSettingsChange={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
                        />
                        {/* Cost Badge */}
                        <div className="absolute -top-3 right-8 px-3 py-1 bg-[#1A1A1A] border border-white/10 rounded-full flex items-center gap-2 shadow-xl z-20">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-bold text-gray-400">EST. COST: <span className="text-[#00FF88]">{estimateCredits()} CREDITS</span></span>
                        </div>
                    </div>
                </div>

                {/* Footer Tools */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <PromptGuide />

                    <button
                        onClick={() => setShowBuilder(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-[#00FF88] hover:text-emerald-400 transition-colors uppercase tracking-wider"
                    >
                        <Zap className="w-4 h-4" />
                        Smart Prompt Builder
                    </button>
                </div>

                {showBuilder && (
                    <PromptBuilder
                        isOpen={showBuilder}
                        onClose={() => setShowBuilder(false)}
                        onApply={(newPrompt) => {
                            setPrompt(newPrompt);
                            toast.success("Structure Applied to Prompt Input");
                        }}
                        currentPrompt={prompt}
                    />
                )}

            </GSAPTransition>
        </div>
    );
};

export default TextToVideoInput;
