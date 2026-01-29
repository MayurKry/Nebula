import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Loader2, Move, Wind, ZoomIn, Eye,
    Layers, RotateCw, Folder, Play, Download,
    Camera, Maximize
} from 'lucide-react';
import { useGeneration } from '@/components/generation/GenerationContext';
import { aiService } from '@/services/ai.service';
import GenerationQueue from '@/components/generation/GenerationQueue';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

const sceneEffects = [
    { id: 'wind', label: 'Wind', icon: Wind },
    { id: 'parallax', label: 'Parallax', icon: Layers },
    { id: 'zoom', label: 'Ken Burns', icon: ZoomIn },
    { id: 'ambient', label: 'Ambience', icon: Eye },
];

const cameraMoves = [
    { id: 'static', label: 'Static' },
    { id: 'zoom-in', label: 'Zoom In' },
    { id: 'zoom-out', label: 'Zoom Out' },
    { id: 'pan-left', label: 'Pan Left' },
    { id: 'pan-right', label: 'Pan Right' },
    { id: 'orbit', label: 'Orbit' },
];

const ImageToVideoPage = () => {
    const { addJob } = useGeneration();
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        model: 'veo3.1',
        duration: 4,
        motionLevel: 50
    });
    const [cameraMove, setCameraMove] = useState('zoom-in');
    const [sceneEffect, setSceneEffect] = useState('parallax');
    const [prompt, setPrompt] = useState('');

    const handleModelChange = (model: string) => {
        setSettings(prev => ({
            ...prev,
            model,
            duration: model === 'veo3' ? 8 : 4
        }));
    };

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [results, setResults] = useState<{ thumbnail: string; url: string }[]>([]);

    useEffect(() => {
        if (location.state?.sourceImage) {
            setSourceImage(location.state.sourceImage);
            toast.info('Continuing from existing asset');
        }
    }, [location.state]);
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSourceImage(reader.result as string);
                toast.success('Image attached successfully');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!sourceImage) {
            toast.error('Please upload a source image first');
            fileInputRef.current?.click();
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setResults([]);

        try {
            // Step 1: Start real generation
            const result = await aiService.animateScene(sourceImage, prompt, {
                model: settings.model,
                duration: settings.duration,
                motionLevel: settings.motionLevel,
                cameraPath: cameraMove
            } as any);

            addJob({
                type: 'image-to-video',
                prompt: prompt || `Animate image with ${sceneEffect} effect`,
                settings: {
                    model: settings.model,
                    duration: settings.duration,
                },
            });

            // Step 2: Polling for status
            let status = 'processing';
            let videoUrl = '';
            let attempts = 0;
            const maxAttempts = 50; // 100 seconds

            while (status === 'processing' && attempts < maxAttempts) {
                setGenerationProgress(Math.min((attempts / maxAttempts) * 100 + 10, 95));
                await new Promise(r => setTimeout(r, 2000));
                const statusRes = await aiService.checkVideoStatus(result.jobId);
                status = statusRes.status;
                videoUrl = statusRes.videoUrl || '';
                attempts++;
            }

            if (status === 'completed' && videoUrl) {
                setGenerationProgress(100);
                setResults([
                    { thumbnail: sourceImage, url: videoUrl },
                ]);
                toast.success('Video animated successfully!');
            } else {
                throw new Error("Generation failed or timed out");
            }

        } catch (error: any) {
            console.error('Animation error:', error);
            toast.error('Failed to animate image.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8 flex flex-col items-center relative overflow-hidden">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <main className="w-full max-w-5xl z-10 flex flex-col items-center">

                {/* Header */}
                <GSAPTransition animation="fade-in-up" className="text-center space-y-4 pt-12 mb-12 relative w-full">
                    <button
                        onClick={() => navigate('/app/assets')}
                        className="absolute left-0 top-12 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium"
                    >
                        <RotateCw className="w-4 h-4 rotate-180" /> Back to Library
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full mb-4">
                        <Move className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Nebula Motion 2.0</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Frame to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Video</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Breathe life into static images with AI choreography. Describe the motion or use our cinematic presets.
                    </p>
                </GSAPTransition>

                {/* Control Grid (Visible Controls) */}
                <div className="w-full relative z-20">
                    <div className="bg-[#141414] border border-white/5 p-1 rounded-2xl flex flex-wrap items-center justify-center gap-2 md:inline-flex md:left-1/2 md:relative md:-translate-x-1/2 mb-6 shadow-2xl">

                        {/* Model Selector */}
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                            {['veo3.1', 'veo3'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => handleModelChange(m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${settings.model === m
                                        ? 'bg-[#00FF88] text-black border-[#00FF88]'
                                        : 'bg-transparent text-gray-500 border-transparent hover:text-white'
                                        }`}
                                >
                                    {m === 'veo3.1' ? 'Veo 3.1' : 'Veo 3.0'}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Duration Selector */}
                        <div className="flex items-center gap-2">
                            {(settings.model === 'veo3' ? [8] : [4, 6, 8]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setSettings(prev => ({ ...prev, duration: d }))}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${settings.duration === d
                                        ? 'bg-white text-black border-white shadow-lg'
                                        : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Camera Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-gray-500 border-transparent hover:text-white hover:bg-white/5 min-w-[140px]">
                                <Camera className="w-3.5 h-3.5" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Camera</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[100px]">
                                        {cameraMoves.find(c => c.id === cameraMove)?.label || 'Static'}
                                    </span>
                                </div>
                            </button>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={cameraMove}
                                onChange={(e) => setCameraMove(e.target.value)}
                            >
                                {cameraMoves.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Effect Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-gray-500 border-transparent hover:text-white hover:bg-white/5 min-w-[140px]">
                                <Wind className="w-3.5 h-3.5" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Effect</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[100px]">
                                        {sceneEffects.find(e => e.id === sceneEffect)?.label || 'Parallax'}
                                    </span>
                                </div>
                            </button>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={sceneEffect}
                                onChange={(e) => setSceneEffect(e.target.value)}
                            >
                                {sceneEffects.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Prompt Section */}
                <GSAPTransition animation="fade-in-up" delay={0.2} className="w-full max-w-4xl mb-16">
                    <div className="relative group mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[28px] blur-lg group-hover:blur-xl transition-all opacity-50 group-hover:opacity-100 duration-1000" />
                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            placeholder="Describe how parts of the image should move..."
                            onFileSelect={(file) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    setSourceImage(reader.result as string);
                                    toast.success('Frame attached successfully');
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                    </div>

                    {/* Prompt Pills / Suggestions (Outside Glow) */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 px-4">
                        {[
                            { label: 'Cinematic Pan', onClick: () => setPrompt('A slow cinematic pan across the landscape with volumetric fog moving'), icon: <Camera className="w-3 h-3" /> },
                            { label: 'Fluid Motion', onClick: () => setPrompt('Make the water flow realistically with subtle sunlight reflections'), icon: <Wind className="w-3 h-3" /> },
                        ].map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#141414] border border-white/5 hover:border-white/20 rounded-full text-[13px] font-medium text-gray-400 hover:text-white transition-all hover:bg-white/10 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </GSAPTransition>

                {/* Progress Overlay */}
                {isGenerating && (
                    <div className="w-full mb-12">
                        <div className="bg-[#141414] border border-white/10 rounded-[2rem] p-8 overflow-hidden relative shadow-2xl">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white">Animating with Physics</h3>
                                    <p className="text-gray-500 text-sm">Analyzing optical flow and depth maps...</p>
                                </div>
                                <div className="ml-auto text-orange-500 font-mono text-2xl font-black">
                                    {Math.round(generationProgress)}%
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {results.length > 0 && !isGenerating && (
                    <GSAPTransition animation="scale-in" className="w-full">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Rendered Animations</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleGenerate}
                                    className="px-4 py-2 bg-[#141414] border border-white/10 rounded-xl text-gray-400 text-xs font-bold hover:text-white flex items-center gap-2 transition-all"
                                >
                                    <RotateCw className="w-3.5 h-3.5" /> REGENERATE
                                </button>
                                <button className="px-4 py-2 bg-[#00FF88] text-black font-bold text-xs rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                    <Folder className="w-3.5 h-3.5" /> SAVE TO ASSETS
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 pb-20">
                            {results.map((video, i) => (
                                <div key={i} className="group bg-[#141414] border border-white/5 rounded-[2rem] overflow-hidden hover:border-orange-500/40 transition-all shadow-2xl">
                                    <div className="aspect-video relative overflow-hidden">
                                        <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <button className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-white hover:text-black transition-colors">
                                                <Maximize className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex items-center justify-between border-t border-white/5">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">MOTION CLIP {i + 1}</span>
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-lg"><Download className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GSAPTransition>
                )}

            </main>
            <GenerationQueue />
        </div>
    );
};

export default ImageToVideoPage;
