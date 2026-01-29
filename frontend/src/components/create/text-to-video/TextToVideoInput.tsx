import React, { useState } from 'react';
import {
    Zap,
    History,
    Settings2,
    Film,
    Clock,
    Layers,
    Sparkles
} from 'lucide-react';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

// Mini Components
import VideoStyleSelector, { videoStyles, type VideoStyle } from './VideoStyleSelector';
import AspectRatioSelector, { aspectRatios, type AspectRatio } from './AspectRatioSelector';

interface TextToVideoInputProps {
    onGenerate: (data: { prompt: string; settings: any }) => void;
    isGenerating: boolean;
}

const TextToVideoInput: React.FC<TextToVideoInputProps> = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);

    // Core Settings
    const [selectedStyle, setSelectedStyle] = useState<VideoStyle>(videoStyles[0]);
    const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
    const [duration, setDuration] = useState(5);
    const [model, setModel] = useState('gen3a_turbo');

    // Credit Calculation
    const estimateCredits = () => {
        const baseRate = 10; // Credits per generation
        const durationMultiplier = duration / 5;
        return Math.round(baseRate * durationMultiplier);
    };

    const handleEnhance = async () => {
        if (!prompt.trim()) return;
        setIsEnhancing(true);
        try {
            // Simulated enhancement logic (would normally call an API)
            await new Promise(r => setTimeout(r, 800));
            const cinematicKeywords = "cinematic lighting, ultra-realistic textures, 8k resolution, masterful composition";
            if (!prompt.toLowerCase().includes("cinematic")) {
                setPrompt(prev => `${prev}, ${cinematicKeywords}`);
                toast.success("Atmosphere Enhanced!");
            }
        } catch (error) {
            toast.error("Enhancement failed.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast.error("Please describe your cinematic vision.");
            return;
        }

        // Merge visual styles into prompt for the engine
        const finalPrompt = `${prompt}. Style: ${selectedStyle.prompt}`;

        onGenerate({
            prompt: finalPrompt,
            settings: {
                model,
                duration,
                aspectRatio: selectedRatio.value,
                styleId: selectedStyle.id
            }
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12">
            <GSAPTransition animation="fade-in-up" duration={0.8}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT PANEL: Settings & Configuration */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#0C0C0C] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl relative overflow-hidden group">
                            {/* Ambient background glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative space-y-8">
                                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="w-4 h-4 text-[#00FF88]" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Director's Controls</h3>
                                    </div>
                                    <History className="w-4 h-4 text-gray-700 hover:text-white transition-colors cursor-pointer" />
                                </div>

                                {/* Model Selector */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Engine</label>
                                    <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                                        {['gen3a_turbo', 'gen3a'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setModel(m)}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${model === m
                                                        ? 'bg-white text-black shadow-xl'
                                                        : 'text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                {m === 'gen3a_turbo' ? 'TURBO v3' : 'CINEMA v3'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <VideoStyleSelector
                                    selectedId={selectedStyle.id}
                                    onSelect={setSelectedStyle}
                                />

                                <AspectRatioSelector
                                    selectedId={selectedRatio.id}
                                    onSelect={setSelectedRatio}
                                />

                                {/* Duration Setting */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Duration</label>
                                        <span className="text-xs font-black text-[#00FF88]">{duration}s</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {[5, 10].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDuration(d)}
                                                className={`flex-1 py-3 rounded-2xl border transition-all font-black text-xs ${duration === d
                                                        ? 'bg-white/10 border-[#00FF88] text-white'
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                {d} Seconds
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Credit Estimation */}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group/cost">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#00FF88] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,136,0.3)] group-hover/cost:scale-110 transition-transform">
                                                <Zap className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase">Estimated</p>
                                                <p className="text-lg font-black tracking-tight">{estimateCredits()} Credits</p>
                                            </div>
                                        </div>
                                        <Clock className="w-5 h-5 text-gray-700" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Film, label: '4K Upscale', status: 'Ready' },
                                { icon: Layers, label: 'Multi-Scene', status: 'Active' }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                    <badge.icon className="w-4 h-4 text-purple-400" />
                                    <div>
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">{badge.status}</p>
                                        <p className="text-[10px] font-bold text-white">{badge.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Prompt & Generation */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* The Studio Stage */}
                        <div className="relative aspect-video lg:aspect-[21/9] bg-[#0C0C0C] border border-white/5 rounded-[3rem] overflow-hidden shadow-InnerHeavy group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                            {/* Dynamic Preview Placeholder */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                                <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                    <Film className="w-8 h-8 text-[#00FF88]" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Awaiting Scene Description</p>
                                    <p className="text-xs text-gray-500 font-bold">Use the prompt bar below to start your production</p>
                                </div>
                            </div>

                            {/* Tech HUD Overlay */}
                            <div className="absolute top-8 left-8 flex items-center gap-6 opacity-40">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#00FF88] rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88]">Engine Online</span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">FPS: 24</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">RES: {selectedRatio.label}</div>
                            </div>
                        </div>

                        {/* Input Hub */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all opacity-40 duration-1000" />

                            <div className="relative bg-[#0C0C0C] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl">
                                <div className="p-1">
                                    <PromptBar
                                        value={prompt}
                                        onChange={setPrompt}
                                        onGenerate={handleGenerate}
                                        onEnhance={handleEnhance}
                                        isGenerating={isGenerating}
                                        isEnhancing={isEnhancing}
                                        placeholder="Describe the cinematic scene you want to create..."
                                    />
                                </div>

                                <div className="px-8 py-4 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest hover:brightness-125 transition-all">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            PRO DIRECTOR
                                        </button>
                                        <div className="w-px h-3 bg-gray-800" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mastering Mode</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Physics</span>
                                            <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full w-2/3 bg-purple-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {[
                                "Hyper-realistic portrait of a space wanderer",
                                "Aerial shot of an ancient neon-lit city in the rain",
                                "Macro slow motion of a splash of cosmic ink",
                                "Ethereal forest with bioluminescent butterflies"
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(suggestion)}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                                >
                                    {suggestion.slice(0, 30)}...
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </GSAPTransition>
        </div>
    );
};

export default TextToVideoInput;
