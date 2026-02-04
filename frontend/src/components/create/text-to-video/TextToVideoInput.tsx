
import React, { useState } from 'react';
import { Sparkles, Ratio, Zap, Camera, Palette } from 'lucide-react';
import PromptBar from '@/components/ui/PromptBar';
import PromptGuide from './PromptGuide';
import PromptBuilder from './PromptBuilder';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

interface TextToVideoInputProps {
    onGenerate: (data: { prompt: string; settings: any }) => void;
    isGenerating: boolean;
    initialPrompt?: string;
}

const TextToVideoInput: React.FC<TextToVideoInputProps> = ({ onGenerate, isGenerating, initialPrompt = '' }) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    // Handle initial prompt from parent
    React.useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);

    // Default Settings
    const [settings, setSettings] = useState({
        model: 'veo3.1', // 'veo3.1' | 'veo3'
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

                {/* Control Hub */}
                <div className="flex flex-col items-center gap-4 w-full max-w-5xl mx-auto mb-8 relative z-20">

                    {/* Primary Controls (Tech Specs) */}
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-wrap items-center justify-center gap-2 shadow-2xl">

                        {/* Model Selector */}
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                            {['veo3.1', 'veo3'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setSettings(prev => ({
                                        ...prev,
                                        model: m,
                                        duration: m === 'veo3' ? 8 : (prev.duration === 8 ? 8 : 4)
                                    }))}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${settings.model === m
                                        ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                                        : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {m === 'veo3.1' ? 'Veo 3.1' : 'Veo 3.0'}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

                        {/* Duration Selector */}
                        <div className="flex items-center gap-1">
                            {(settings.model === 'veo3' ? [8] : [4, 6, 8]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setSettings(prev => ({ ...prev, duration: d }))}
                                    className={`w-10 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${settings.duration === d
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

                        {/* Aspect Ratio Selector */}
                        <div className="flex items-center gap-1">
                            {['16:9', '9:16'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setSettings(prev => ({ ...prev, aspectRatio: r }))}
                                    className={`px-3 py-2 rounded-lg transition-all border flex items-center gap-2 ${settings.aspectRatio === r
                                        ? 'bg-white/10 text-white border-white/20'
                                        : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Ratio className={`w-3.5 h-3.5 ${r === '9:16' ? 'rotate-90' : ''}`} />
                                    <span className="text-xs font-bold">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Creative Controls (Prompt Builder Integration) */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {[
                            { id: 'camera', label: 'Camera', icon: Camera, options: ["Static Shot", "Slow Pan Right", "Tracking Shot", "Drone Flyover", "Dolly Zoom", "FPV"] },
                            { id: 'lighting', label: 'Lighting', icon: Zap, options: ["Cinematic", "Natural", "Cyberpunk", "Golden Hour", "Studio", "Dark & Moody"] },
                            { id: 'style', label: 'Film Look', icon: Palette, options: ["Photorealistic", "35mm Film", "Analog VHS", "Anime", "Black & White", "Vintage"] }
                        ].map((control) => (
                            <div key={control.id} className="relative group">
                                <select
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !prompt.includes(val)) {
                                            setPrompt(prev => prev ? `${prev}, ${val}` : val);
                                            toast.success(`Added ${control.label}: ${val}`);
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="" disabled>Select {control.label}</option>
                                    {control.options.map(opt => (
                                        <option key={opt} value={opt} className="bg-black text-white">{opt}</option>
                                    ))}
                                </select>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                    <control.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00FF88] transition-colors" />
                                    <span className="text-xs font-bold text-gray-300 group-hover:text-white">{control.label}</span>
                                </button>
                            </div>
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
