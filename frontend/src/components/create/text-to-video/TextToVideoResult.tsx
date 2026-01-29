import React, { useState } from 'react';
import {
    Share2,
    RotateCw,
    Sparkles,
    ChevronRight,
    Clock,
    Layers,
    History,
    Zap,
    Film,
    ArrowLeft,
    Download
} from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import VideoTheater from './VideoTheater';

interface Scene {
    id: string;
    description: string;
    imageUrl: string;
    videoUrl?: string;
    duration: number;
}

interface TextToVideoResultProps {
    data: {
        scenes: Scene[];
        settings: any;
    };
    onPrimaryAction: () => void; // Usually 'Back to Generator'
}

const TextToVideoResult: React.FC<TextToVideoResultProps> = ({ data, onPrimaryAction }) => {
    const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
    const activeScene = data.scenes[selectedSceneIndex];

    const handleDownload = async () => {
        if (!activeScene.videoUrl) return;
        try {
            const response = await fetch(activeScene.videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nebula-video-${activeScene.id}.mp4`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00FF88]/30">
            {/* Ambient background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FF88]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <GSAPTransition animation="fade-in" duration={1}>
                {/* Header Context */}
                <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
                    <button
                        onClick={onPrimaryAction}
                        className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Studio
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-2xl">
                            <Zap className="w-4 h-4 text-[#00FF88]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88]">Master Quality Render</span>
                        </div>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <main className="relative max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                        {/* LEFT: Central Theater */}
                        <div className="lg:col-span-8 space-y-8">
                            <VideoTheater
                                videoUrl={activeScene.videoUrl || ''}
                                thumbnailUrl={activeScene.imageUrl}
                                title={activeScene.description}
                                onDownload={handleDownload}
                            />

                            {/* Film Strip Selection (if multiple variations/scenes) */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scene Variations</h3>
                                    <span className="text-[10px] font-black text-gray-700">{data.scenes.length} Mastered</span>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {data.scenes.map((scene, idx) => (
                                        <button
                                            key={scene.id}
                                            onClick={() => setSelectedSceneIndex(idx)}
                                            className={`relative flex-shrink-0 w-48 aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedSceneIndex === idx
                                                    ? 'border-[#00FF88] scale-105 shadow-[0_10px_20px_rgba(0,255,136,0.2)]'
                                                    : 'border-white/5 grayscale hover:grayscale-0'
                                                }`}
                                        >
                                            <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <RotateCw className="w-6 h-6 text-white" />
                                            </div>
                                        </button>
                                    ))}
                                    {/* Quick Re-roll Slot */}
                                    <button className="flex-shrink-0 w-48 aspect-video rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all text-gray-600 hover:text-white">
                                        <PlusIcon className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">New Variation</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Post-Production & Analysis */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-[#0C0C0C] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Film className="w-4 h-4 text-purple-400" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Neural Analysis</h3>
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                        <p className="text-sm font-medium text-gray-300 italic leading-relaxed">
                                            "{activeScene.description}"
                                        </p>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {activeScene.duration}s
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5" />
                                                4K Upscale
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Studio Actions */}
                                <div className="space-y-4">
                                    <button className="w-full py-4 bg-[#00FF88] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_20px_40px_rgba(0,255,136,0.1)]">
                                        <Download className="w-5 h-5" />
                                        EXPORT MASTER
                                    </button>
                                    <button className="w-full py-4 bg-white/5 border border-white/5 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        ENHANCE MOTION
                                    </button>
                                </div>

                                {/* Upgrades Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                    <button className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-all text-left group">
                                        <History className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors mb-2" />
                                        <p className="text-[9px] font-black text-gray-500 uppercase">Version</p>
                                        <p className="text-[11px] font-bold text-white">v1.2 (Latest)</p>
                                    </button>
                                    <button className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-all text-left group">
                                        <Layers className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors mb-2" />
                                        <p className="text-[9px] font-black text-gray-500 uppercase">Format</p>
                                        <p className="text-[11px] font-bold text-white">MP4 (H.265)</p>
                                    </button>
                                </div>
                            </div>

                            {/* Promotional / Pro Callout */}
                            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2rem] p-8 space-y-4 shadow-xl group">
                                <h4 className="text-xl font-black tracking-tightest leading-tight">Unlock Infinite Cinema with Pro.</h4>
                                <p className="text-white/70 text-xs font-medium leading-relaxed">
                                    Get 4K Cinematic renders, priority queueing, and advanced camera controls.
                                </p>
                                <button className="w-full py-3 bg-white text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                                    UPGRADE NOW
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </GSAPTransition>
        </div>
    );
};

// Help helper
const PlusIcon = (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export default TextToVideoResult;
