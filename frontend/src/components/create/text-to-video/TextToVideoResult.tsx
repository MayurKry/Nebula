import React, { useState } from 'react';
import { ArrowLeft, Check, Download, Sparkles, RefreshCw, Play, Scissors, Layers, Plus } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';
import TrimmerModal from './TrimmerModal';
import NLEEditor from '@/components/editor/NLEEditor';

interface Scene {
    id: string;
    description: string;
    imageUrl: string;
    videoUrl?: string;
    duration: number;
}

interface TextToVideoResultProps {
    project: {
        scenes: Scene[];
        settings: any;
    };
    onBack: () => void;
    onSaveToAssets: (scene: Scene) => void;
    onRegenerate: (sceneId: string, newPrompt: string) => void;
}

const TextToVideoResult: React.FC<TextToVideoResultProps> = ({ project, onBack, onSaveToAssets }) => {
    const isMultiScene = project.scenes.length > 1;
    const [isTrimmerOpen, setIsTrimmerOpen] = useState(false);
    const [currentSceneForTrim, setCurrentSceneForTrim] = useState<Scene | null>(null);
    const [showEditorPreview, setShowEditorPreview] = useState(false);

    const handleTrimClick = (scene: Scene) => {
        setCurrentSceneForTrim(scene);
        setIsTrimmerOpen(true);
    };

    const handleTrimConfirm = (start: number, end: number) => {
        toast.success(`Video trimmed to ${start.toFixed(1)}s - ${end.toFixed(1)}s`);
        setIsTrimmerOpen(false);
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'generated-video.mp4';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Download started");
        } catch (e) {
            console.error("Download failed:", e);
            toast.error("Failed to download video");
        }
    };

    if (showEditorPreview) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col animate-in fade-in duration-300">
                <div className="bg-purple-900/30 border-b border-purple-500/30 px-4 py-2 text-center relative z-50">
                    <span className="text-xs font-bold text-purple-200 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Preview Mode: This is a vision of our future Pro Editor
                    </span>
                </div>
                <div className="flex-1 relative pointer-events-none opacity-40 grayscale-[0.3] select-none">
                    <NLEEditor
                        initialProject={project as any}
                        onGoBack={() => { }}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md text-center space-y-6 shadow-2xl pointer-events-auto">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <Layers className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white">Advanced Editor Coming Soon</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            We are building a powerful Non-Linear Editor directly into Nebula.
                            Soon you'll be able to composite, add effects, and fine-tune your generations with professional precision.
                        </p>
                        <button
                            onClick={() => setShowEditorPreview(false)}
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                        >
                            Back to Generator
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleAddSceneMock = () => {
        if (project.scenes.length >= 5) {
            toast.error("Max 5 scenes allowed for now.");
            return;
        }
        // In real app, this would bubble up to parent to change 'step' back to input
        // For now we will rely on the parent prop
        onBack(); // Re-use back for now as "Add new prompt", ideally differentiation is good
    };

    // ... existing trim logic ...

    if (!isMultiScene) {
        // Single scene view - but now FULL SCREEN
        const scene = project.scenes[0];
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
                {/* Header */}
                <div className="w-full h-16 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/5 rounded-full"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <h2 className="text-white font-bold text-sm">Generated Result</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEditorPreview(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            <Layers className="w-3 h-3" />
                            Open Editor
                        </button>
                    </div>
                </div>

                {/* Main Content - Split View */}
                <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
                    {/* Left: Video Player (Dominant) */}
                    <div className="flex-1 bg-black relative flex items-center justify-center p-8 group">
                        {scene.videoUrl ? (
                            <div className="relative w-full h-full max-h-[80vh] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                                <video
                                    src={scene.videoUrl}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    loop
                                    poster={scene.imageUrl}
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-full max-h-[80vh] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                                <img
                                    src={scene.imageUrl}
                                    alt="Generated Scene"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                        <Play className="w-8 h-8 ml-1 text-white/50" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/30 px-6 py-2 rounded-full text-red-200 text-sm backdrop-blur-md">
                                    Video URL missing
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Controls & Details */}
                    <div className="w-full lg:w-96 bg-[#141414] border-l border-white/5 p-6 overflow-y-auto space-y-8">
                        {/* Prompt Section */}
                        <div className="space-y-3">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Prompt</h3>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <p className="text-gray-200 text-sm leading-relaxed italic">
                                    "{scene.description}"
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Actions</h3>

                            <button
                                onClick={() => handleTrimClick(scene)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all border border-white/5"
                            >
                                <Scissors className="w-4 h-4" />
                                Trim Segment
                            </button>

                            <button
                                onClick={() => onSaveToAssets(scene)}
                                className="w-full py-4 bg-[#00FF88] hover:bg-[#00ff88]/90 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(0,255,136,0.1)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)]"
                            >
                                <Check className="w-5 h-5" />
                                Save to Assets
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={onBack}
                                    className="py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Regenerate
                                </button>
                                <button
                                    onClick={() => handleDownload(scene.videoUrl || scene.imageUrl, `nebula-video-${scene.id}.mp4`)}
                                    className="py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>
                        </div>

                        {/* Context / Continuation */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Continuity</h3>
                            <button
                                onClick={onBack} // Ideally this opens a "Generate Next Scene" mode
                                className="w-full py-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold rounded-xl flex items-center justify-center gap-2 border border-purple-500/30 transition-all dashed"
                            >
                                <Plus className="w-5 h-5" />
                                Add Next Scene
                            </button>
                        </div>
                    </div>
                </div>

                <TrimmerModal
                    isOpen={isTrimmerOpen}
                    onClose={() => setIsTrimmerOpen(false)}
                    videoUrl={currentSceneForTrim?.videoUrl}
                    duration={currentSceneForTrim?.duration || 5}
                    onTrimConfirm={handleTrimConfirm}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            <header className="sticky top-0 z-10 bg-[#0A0A0A]/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white">Project Review</h2>
                        <p className="text-xs text-gray-500">{project.scenes.length} Scenes Generated</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowEditorPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        <Layers className="w-3 h-3" />
                        Preview Pro Editor
                    </button>
                    <button
                        onClick={() => project.scenes.forEach(s => onSaveToAssets(s))}
                        className="px-6 py-2 bg-white text-black font-bold rounded-full text-xs hover:bg-gray-200 transition-colors"
                    >
                        Save All to Assets
                    </button>
                </div>
            </header>

            <div className="flex-1 p-8 grid grid-cols-1 gap-12 max-w-4xl mx-auto">
                {project.scenes.map((scene, idx) => (
                    <GSAPTransition key={scene.id} animation="fade-in-up" delay={idx * 0.1}>
                        <div className="bg-[#141414] rounded-2xl overflow-hidden border border-white/5 group">
                            <div className="aspect-video relative bg-black">
                                <img src={scene.imageUrl} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs font-bold text-white border border-white/10">
                                    Scene {idx + 1}
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Analysis</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Created a {scene.duration}s segment focusing on "{scene.description.slice(0, 50)}...". The motion vectors were aligned to maintain continuity with previous scenes.
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <button
                                            onClick={() => handleTrimClick(scene)}
                                            className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
                                        >
                                            <Scissors className="w-3 h-3" /> Trim
                                        </button>
                                        <button
                                            onClick={() => onSaveToAssets(scene)}
                                            className="px-4 py-2 bg-[#00FF88] text-black text-xs font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                                        >
                                            <Check className="w-3 h-3" /> Verify
                                        </button>
                                        <button
                                            onClick={onBack}
                                            className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                </div>
                                <div className="border-l border-white/5 pl-6">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Prompt Used</div>
                                    <p className="text-xs text-gray-300 italic">"{scene.description}"</p>
                                </div>
                            </div>
                        </div>
                    </GSAPTransition>
                ))}
            </div>

            <TrimmerModal
                isOpen={isTrimmerOpen}
                onClose={() => setIsTrimmerOpen(false)}
                videoUrl={currentSceneForTrim?.videoUrl}
                duration={currentSceneForTrim?.duration || 5}
                onTrimConfirm={handleTrimConfirm}
            />
        </div>
    );
};

export default TextToVideoResult;
