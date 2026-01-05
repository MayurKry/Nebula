import { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    Video as VideoIcon, Upload, Camera, Film,
    RotateCw, Download, Play, Pause, Music,
    Edit3, SkipBack, SkipForward,
    X, Layers, ChevronDown
} from 'lucide-react';
import { useGeneration } from '@/components/generation/GenerationContext';
import { StyleSelector } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';
import aiService, { type GenerateVideoProjectResponse, type VideoProjectScene } from '@/services/ai.service';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';

const videoStyles = [
    'Cinematic', 'Documentary', 'Surreal', 'Anime', 'Photorealistic',
    'Noir', 'Vintage', 'Sci-Fi', 'Fantasy', 'Minimalist'
];

const cameraPaths = [
    'Static', 'Slow Pan', 'Zoom In', 'Zoom Out', 'Orbit', 'Dolly', 'Drone Shot', 'Handheld'
];

const durations = [
    { value: 5, label: '05 sec' },
    { value: 10, label: '10 sec' },
    { value: 15, label: '15 sec' },
];

const TextToVideoPage = () => {
    const { addJob } = useGeneration();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Input States
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [cameraPath, setCameraPath] = useState('Slow Pan');
    const [duration, setDuration] = useState(5);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);

    // Generation States
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>("");

    // Editor States
    const [project, setProject] = useState<GenerateVideoProjectResponse | null>(null);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const playbackInterval = useRef<NodeJS.Timeout | null>(null);

    // Playback Logic
    useEffect(() => {
        if (isPlaying) {
            playbackInterval.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= duration) {
                        setIsPlaying(false);
                        return 0; // Loop or stop
                    }
                    return prev + 0.1; // 100ms updates
                });
            }, 100);
        } else {
            if (playbackInterval.current) clearInterval(playbackInterval.current);
        }
        return () => {
            if (playbackInterval.current) clearInterval(playbackInterval.current);
        };
    }, [isPlaying, duration]);

    // Sync Active Scene with Time
    useEffect(() => {
        if (!project || !isPlaying) return;

        let elapsedTime = 0;
        const currentScene = project.scenes.find(scene => {
            const sceneEnd = elapsedTime + (scene.duration || (duration / project.scenes.length));
            if (currentTime >= elapsedTime && currentTime < sceneEnd) {
                return true;
            }
            elapsedTime = sceneEnd;
            return false;
        });

        if (currentScene && currentScene.id !== activeSceneId) {
            setActiveSceneId(currentScene.id);
        }
    }, [currentTime, project, isPlaying, duration, activeSceneId]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;
        setCurrentTime(newTime);

        if (project) {
            let elapsedTime = 0;
            const scene = project.scenes.find(s => {
                const sDuration = s.duration || (duration / project.scenes.length);
                if (newTime >= elapsedTime && newTime < elapsedTime + sDuration) return true;
                elapsedTime += sDuration;
                return false;
            });
            if (scene) setActiveSceneId(scene.id);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setLoadingStep("Analyzing Prompt & Generating Script...");

        try {
            const data = await aiService.generateVideoProject({
                prompt,
                style,
                duration
            });

            setLoadingStep("Creating Storyboard Scenes...");
            await new Promise(r => setTimeout(r, 1000));

            setLoadingStep("Composing Audio Track...");
            await new Promise(r => setTimeout(r, 800));

            setLoadingStep("Finalizing Project...");
            await new Promise(r => setTimeout(r, 500));

            setProject(data);
            if (data.scenes.length > 0) {
                setActiveSceneId(data.scenes[0].id);
            }

            addJob({
                type: 'text-to-video',
                prompt,
                settings: { style, duration },
            });

        } catch (error) {
            console.error("Failed to generate project:", error);
            alert("Failed to generate project. Please try again.");
        } finally {
            setIsGenerating(false);
            setLoadingStep("");
        }
    };

    const handleEnhance = async () => {
        if (!prompt.trim()) return;
        setIsEnhancing(true);
        try {
            const res = await aiService.enhancePrompt(prompt);
            setPrompt(res.enhanced);
        } catch (err) {
            console.error(err);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setReferenceImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleSceneUpdate = (sceneId: string, updates: Partial<VideoProjectScene>) => {
        if (!project) return;

        const updatedScenes = project.scenes.map(scene =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
        );

        setProject({
            ...project,
            scenes: updatedScenes
        });
    };

    const handleRegenerateScene = async () => {
        if (!project || !activeSceneId || isRegenerating) return;

        const activeScene = project.scenes.find(s => s.id === activeSceneId);
        if (!activeScene) return;

        setIsRegenerating(true);
        try {
            const data = await aiService.regenerateScene(activeScene.description, project.settings.style);
            handleSceneUpdate(activeSceneId, { imageUrl: data.imageUrl });
        } catch (error) {
            console.error("Failed to regenerate:", error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleAnimateScene = async () => {
        if (!project || !activeSceneId || isRegenerating) return;

        const activeScene = project.scenes.find(s => s.id === activeSceneId);
        if (!activeScene) return;

        setIsRegenerating(true);
        try {
            const data = await aiService.animateScene(activeScene.imageUrl!, activeScene.description);
            alert(`Animation started for scene! Job ID: ${data.jobId}`);
        } catch (error) {
            console.error("Failed to animate:", error);
        } finally {
            setIsRegenerating(false);
        }
    };

    // Editor View
    if (project) {
        const activeScene = project.scenes.find(s => s.id === activeSceneId) || project.scenes[0];

        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
                <header className="border-b border-white/10 bg-[#141414] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setProject(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-white font-bold text-lg flex items-center gap-2">
                                {project.prompt.slice(0, 40)}...
                            </h1>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                <span className="text-purple-400">{project.settings.style}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span>{duration}s Duration</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span>{project.scenes.length} Scenes</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-white text-black font-bold text-sm rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                            <Download className="w-4 h-4" />
                            EXPORT VIDEO
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    <aside className="w-80 border-r border-white/10 bg-[#0A0A0A] flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Story Script</h3>
                                <button className="p-1.5 hover:bg-white/5 rounded text-gray-400"><Edit3 className="w-4 h-4" /></button>
                            </div>
                            <div className="bg-[#141414] rounded-xl p-3 border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <p className="text-sm text-gray-400 leading-relaxed italic">"{project.script}"</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Scenes</h3>
                            {project.scenes.map((scene, idx) => (
                                <div
                                    key={scene.id}
                                    onClick={() => setActiveSceneId(scene.id)}
                                    className={`group p-2 rounded-2xl border transition-all cursor-pointer ${activeSceneId === scene.id ? 'bg-purple-500/10 border-purple-500/50' : 'bg-[#141414] border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                                            <img src={scene.imageUrl} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <Play className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <span className="text-[10px] font-black text-gray-600 block mb-1">SCENE {idx + 1}</span>
                                            <p className="text-xs text-gray-300 truncate">{scene.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <section className="flex-1 flex flex-col bg-[#0F0F0F] relative">
                        <div className="flex-1 p-8 flex flex-col items-center justify-center">
                            <div className="relative aspect-video w-full max-w-5xl bg-black rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 group">
                                <img
                                    src={activeScene.imageUrl}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={togglePlay}
                                        className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                                    >
                                        {isPlaying ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-black ml-1" />}
                                    </button>
                                </div>
                                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                    <div className="space-y-2 max-w-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded italic">ACTIVE SCENE</span>
                                            <span className="text-white/60 text-xs font-mono">{activeScene.duration || 1.2}s</span>
                                        </div>
                                        <p className="text-white text-lg font-medium leading-tight">
                                            {activeScene.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleRegenerateScene}
                                            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10"
                                            title="Regenerate Visual"
                                        >
                                            <RotateCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button
                                            onClick={handleAnimateScene}
                                            className="p-3 bg-[#00FF88] rounded-2xl text-black hover:scale-105 transition-all shadow-lg"
                                            title="Animate this Scene"
                                        >
                                            <Film className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-48 bg-[#141414] border-t border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <SkipBack className="w-4 h-4 cursor-pointer hover:text-white" />
                                        <button onClick={togglePlay}>
                                            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                                        </button>
                                        <SkipForward className="w-4 h-4 cursor-pointer hover:text-white" />
                                    </div>
                                    <span className="text-sm font-mono text-gray-400 tabular-nums">
                                        {currentTime.toFixed(1)}s / {duration}s
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Add Scene"><Layers className="w-4 h-4" /></button>
                                    <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Add Audio"><Music className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="relative h-12 bg-black/40 rounded-xl overflow-hidden cursor-crosshair" onClick={handleTimelineClick}>
                                <div className="absolute inset-0 flex">
                                    {project.scenes.map((scene, i) => (
                                        <div
                                            key={i}
                                            className={`h-full border-r border-white/5 transition-colors ${activeSceneId === scene.id ? 'bg-purple-500/20' : 'hover:bg-white/5'}`}
                                            style={{ width: `${100 / project.scenes.length}%` }}
                                        />
                                    ))}
                                </div>
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-[#00FF88] z-10 shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                                    style={{ left: `${(currentTime / duration) * 100}%` }}
                                >
                                    <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-[#00FF88] rounded-full border-2 border-black" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="w-72 border-l border-white/10 bg-[#0A0A0A] p-6 space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Camera Paths</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {cameraPaths.slice(0, 6).map(path => (
                                    <button
                                        key={path}
                                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${activeScene.cameraPath === path ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-[#141414] border-white/5 text-gray-500 hover:text-white'}`}
                                    >
                                        {path.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Audio Mix</h3>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                            <span>DYNAMIC SCORE</span>
                                            <span>80%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: '80%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                            <span>AI NARRATION</span>
                                            <span>100%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#00FF88]" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Voice Model (ElevenLabs)</label>
                                    <button className="w-full bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-purple-500/40 transition-all text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">R</div>
                                            <div>
                                                <p className="text-xs font-bold text-white">Rachel</p>
                                                <p className="text-[9px] text-gray-500">American • Narrative</p>
                                            </div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Quick Styles</h3>
                            <div className="space-y-2">
                                {videoStyles.slice(0, 4).map(s => (
                                    <button key={s} className="w-full py-2.5 bg-[#141414] border border-white/5 rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/10 transition-all text-left px-4">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-6xl mx-auto space-y-12">
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4 pt-4 mb-4">
                        <div className="inline-flex p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-2">
                            <VideoIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Video</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Nebula's cinematic engine creates full video projects with choreographed scenes, scripts, and high-fidelity scores.
                        </p>
                    </div>
                </GSAPTransition>

                <GSAPTransition animation="fade-in-up" delay={0.1}>
                    <div className="space-y-8">
                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            onEnhance={handleEnhance}
                            isGenerating={isGenerating}
                            isEnhancing={isEnhancing}
                            placeholder="State your cinematic vision..."
                            actions={[
                                { label: 'Cinematic Noir', onClick: () => setPrompt('A tense film noir scene in a smoke-filled room, detective lighting, deep shadows'), icon: <Camera className="w-3 h-3" /> },
                                { label: 'Nature Doc', onClick: () => setPrompt('A majestic snow leopard stalking through a blizzard in the Himalayas, 8k nature documentary style'), icon: <Film className="w-3 h-3" /> },
                                { label: 'Space Odyssey', onClick: () => setPrompt('A massive space station orbiting a ringed gas giant, cinematic scale, epic orchestral mood'), icon: <Sparkles className="w-3 h-3" /> },
                            ]}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl">
                                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Visual Style</label>
                                <StyleSelector styles={videoStyles} selected={style} onSelect={setStyle} icon={<Film className="w-4 h-4 text-purple-400" />} />
                            </div>

                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl">
                                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Camera Path</label>
                                <StyleSelector styles={cameraPaths} selected={cameraPath} onSelect={setCameraPath} icon={<Camera className="w-4 h-4 text-purple-400" />} />
                            </div>

                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl">
                                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Target Duration</label>
                                <div className="flex gap-2">
                                    {durations.map(d => (
                                        <button
                                            key={d.value}
                                            onClick={() => setDuration(d.value)}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${duration === d.value
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-[#1A1A1A] text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {d.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl">
                                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Visual Reference</label>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleReferenceUpload} className="hidden" />
                                {referenceImage ? (
                                    <div className="relative group/ref">
                                        <img src={referenceImage} className="w-full h-[38px] object-cover rounded-lg" />
                                        <button onClick={() => setReferenceImage(null)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-lg text-white opacity-0 group-hover/ref:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-gray-600 text-[10px] font-bold hover:border-white/30 transition-all flex items-center justify-center gap-2">
                                        <Upload className="w-3 h-3" /> UPLOAD IMAGE
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </GSAPTransition>

                {isGenerating && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                        <div className="text-center space-y-8 max-w-md w-full">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <VideoIcon className="w-8 h-8 text-purple-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white tracking-tight">{loadingStep}</h3>
                                <p className="text-gray-500 text-sm">Building your cinematic project...</p>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 animate-pulse" style={{ width: '60%' }} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <GenerationQueue />
        </div>
    );
};

export default TextToVideoPage;
