import React, { useState } from 'react';
import { Sparkles, Camera, Zap, Palette, Video, Plus, X, ArrowRight } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

interface PromptBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (prompt: string) => void;
    currentPrompt?: string;
}

const CATEGORIES = {
    camera: {
        icon: Camera,
        color: "text-amber-400",
        label: "Camera Movement",
        options: [
            "Static Shot", "Slow Pan Right", "Tracking Shot", "Drone Flyover",
            "Low Angle", "High Angle", "Dolly Zoom", "Handheld Shake", "FPV"
        ]
    },
    lighting: {
        icon: Zap,
        color: "text-blue-400",
        label: "Lighting",
        options: [
            "Natural Lighting", "Golden Hour", "Cinematic Lighting", "Neon Cyberpunk",
            "Volumetric Fog", "Studio Softbox", "Hard Shadows", "Bioluminescent"
        ]
    },
    style: {
        icon: Palette,
        color: "text-pink-400",
        label: "Style & Film",
        options: [
            "Photorealistic", "35mm Film Grain", "Analog VHS", "Anime Style",
            "Unreal Engine 5", "Cinematic 8k", "Vintage 90s", "Black and White"
        ]
    },
    motion: {
        icon: Video,
        color: "text-green-400",
        label: "Motion Speed",
        options: [
            "Slow Motion", "Hyperlapse", "Fluid Motion", "Fast Paced", "Freeze Frame"
        ]
    }
};

const PromptBuilder: React.FC<PromptBuilderProps> = ({ isOpen, onClose, onApply, currentPrompt = "" }) => {
    // Determine initial state based on current prompt
    const [subject, setSubject] = useState(currentPrompt);
    const [selections, setSelections] = useState<Record<string, string>>({});

    const handleSelect = (category: string, value: string) => {
        setSelections(prev => ({
            ...prev,
            [category]: prev[category] === value ? "" : value // Toggle
        }));
    };

    const buildFullPrompt = () => {
        const parts = [subject.trim()];

        // Order matters for Gen-4 guide: Subject -> Style -> Camera -> Lighting -> Motion
        if (selections.style) parts.push(selections.style);
        if (selections.camera) parts.push(selections.camera);
        if (selections.lighting) parts.push(selections.lighting);
        if (selections.motion) parts.push(selections.motion);

        return parts.filter(Boolean).join(", ");
    };

    const handleApply = () => {
        onApply(buildFullPrompt());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

            <GSAPTransition animation="scale-in" className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#141414]">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#00FF88]" />
                            Gen-4 Prompt Architect
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">based on RunwayML Best Practices</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8">

                    {/* Left Column: Subject Input */}
                    <div className="space-y-6">
                        <section>
                            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 block">1. The Subject</label>
                            <textarea
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Describe who, what, and where... (e.g. A futuristic samurai walking through a neon market)"
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00FF88]/50 resize-none text-base"
                            />
                            <p className="text-[10px] text-gray-500 mt-2">
                                *Focus on clarity. Describe the main action clearly.
                            </p>
                        </section>

                        <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Preview</h3>
                            <div className="text-sm text-[#00FF88] font-mono leading-relaxed">
                                {buildFullPrompt() || "Start typing..."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Modifiers */}
                    <div className="space-y-6">
                        <label className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 block">2. Enhance the Shot</label>

                        {Object.entries(CATEGORIES).map(([key, category]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                    <category.icon className={`w-3 h-3 ${category.color}`} />
                                    {category.label}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {category.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleSelect(key, option)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${selections[key] === option
                                                    ? `bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]`
                                                    : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {option}
                                            {selections[key] === option && <Plus className="w-2 h-2 inline ml-1" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#141414] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-8 py-2 rounded-lg text-sm font-bold bg-[#00FF88] text-black hover:bg-[#00CC6A] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                    >
                        Use Prompt <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </GSAPTransition>
        </div>
    );
};

export default PromptBuilder;
