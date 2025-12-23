import { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    Loader2, Video as VideoIcon, Upload, Camera, Film,
    RotateCw, Wand2, Download, Play, Pause, Music,
    Edit3, GripHorizontal, SkipBack, SkipForward
} from 'lucide-react';
import { useGeneration } from '@/components/generation/GenerationContext';
import { AdvancedPanel, StyleSelector } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';
import aiService, { type GenerateVideoProjectResponse, type VideoProjectScene } from '@/services/ai.service';

const videoStyles = [
    'Cinematic', 'Documentary', 'Surreal', 'Anime', 'Photorealistic',
    'Noir', 'Vintage', 'Sci-Fi', 'Fantasy', 'Minimalist'
];

const cameraPaths = [
    'Static', 'Slow Pan', 'Zoom In', 'Zoom Out', 'Orbit', 'Dolly', 'Drone Shot', 'Handheld'
];

const durations = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '60 seconds' },
];

const TextToVideoPage = () => {
    const { addJob } = useGeneration();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Input States
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [cameraPath, setCameraPath] = useState('Slow Pan');
    const [duration, setDuration] = useState(30);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [advancedSettings, setAdvancedSettings] = useState({
        cameraAngle: 'Eye Level',
        depth: 50,
        fidelity: 80,
        colorTemperature: 50,
    });

    // Generation States
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>("");

    // Editor States
    const [project, setProject] = useState<GenerateVideoProjectResponse | null>(null);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [scriptContent, setScriptContent] = useState("");

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

        // Find which scene encompasses the current time
        // Assuming equal distribution for now or using scene durations if available
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

        // Also update active scene immediately
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
        setProject(null);

        try {
            // Step 1: Request Project Generation from Backend
            // We use the real service now instead of simulation
            const data = await aiService.generateVideoProject({
                prompt,
                style,
                duration
            });

            // Simulate steps for UX (since the backend mocks wait time)
            setLoadingStep("Creating Storyboard Scenes...");
            await new Promise(r => setTimeout(r, 1000));

            setLoadingStep("Composing Audio Track...");
            await new Promise(r => setTimeout(r, 800));

            setLoadingStep("Finalizing Project...");
            await new Promise(r => setTimeout(r, 500));

            setProject(data);
            setScriptContent(data.script);
            if (data.scenes.length > 0) {
                setActiveSceneId(data.scenes[0].id);
            }

            // Also add to queue for history tracking (optional)
            addJob({
                type: 'text-to-video',
                prompt,
                settings: { style, duration, ...advancedSettings },
            });

        } catch (error) {
            console.error("Failed to generate project:", error);
            // Handle error (show toast etc)
        } finally {
            setIsGenerating(false);
            setLoadingStep("");
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

    // Editor View
    if (project) {
        const activeScene = project.scenes.find(s => s.id === activeSceneId) || project.scenes[0];


        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
                {/* Header / Project Bar */}
                <header className="border-b border-white/10 bg-[#141414] px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-white font-bold text-lg flex items-center gap-2">
                            <VideoIcon className="w-5 h-5 text-purple-500" />
                            {project.prompt.slice(0, 30)}...
                        </h1>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>ID: {project.projectId}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{project.settings.language || "English"} ({project.settings.region || "US"})</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{duration}s</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setProject(null)}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                        >
                            Back to Create
                        </button>
                        <button className="px-4 py-2 bg-[#00FF88] text-black font-medium text-sm rounded-lg flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Video
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    {/* Left: Script & Characters */}
                    <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col">
                        <div className="flex border-b border-white/10">
                            <button className="flex-1 py-3 text-xs font-medium text-white border-b-2 border-purple-500 bg-white/5">Script</button>
                            <button className="flex-1 py-3 text-xs font-medium text-gray-500 hover:text-white">Characters</button>
                        </div>

                        {/* Script Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1 block">Voice Tone</label>
                                <select className="w-full bg-[#1A1A1A] border border-white/10 text-xs text-white rounded p-1.5 focus:border-purple-500 outline-none">
                                    <option>Confident Narrative</option>
                                    <option>Whispering Mystery</option>
                                    <option>Cheerul Energetic</option>
                                </select>
                            </div>
                            <textarea
                                value={scriptContent}
                                onChange={(e) => setScriptContent(e.target.value)}
                                className="w-full h-[500px] bg-transparent text-gray-300 text-sm resize-none outline-none leading-relaxed font-mono"
                                spellCheck={false}
                            />
                        </div>

                        {/* Character List (Mock preview for now) */}
                        <div className="p-4 border-t border-white/10">
                            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Cast</h3>
                            <div className="space-y-2">
                                {project.characters?.map(char => (
                                    <div key={char.id} className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-white/5 hover:border-purple-500/50 cursor-pointer transition-colors">
                                        <img src={char.avatarUrl} className="w-8 h-8 rounded-full bg-gray-700" />
                                        <div className="overflow-hidden">
                                            <div className="text-xs text-white font-medium truncate">{char.name}</div>
                                            <div className="text-[10px] text-gray-500 truncate">{char.accent}</div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-1.5 text-xs text-purple-400 border border-dashed border-purple-500/30 rounded hover:bg-purple-500/10 transition-colors">
                                    + Add Character
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Middle: Scene Preview & Timeline */}
                    <section className="flex-1 flex flex-col bg-[#0F0F0F]">
                        {/* Preview Area */}
                        <div className="flex-1 p-6 flex flex-col items-center justify-center relative border-b border-white/10">
                            {/* Scene Image */}
                            <div className="relative aspect-video w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 group">
                                <img
                                    src={activeScene.imageUrl}
                                    alt={activeScene.description}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={togglePlay}
                                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-all transform hover:scale-110"
                                    >
                                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs">
                                        <div className="text-gray-400">Current Scene</div>
                                        <div className="text-white font-medium">
                                            {new Date(currentTime * 1000).toISOString().substr(14, 8)} / {new Date(duration * 1000).toISOString().substr(14, 8)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-black/60 backdrop-blur text-white rounded-lg hover:bg-purple-600 transition-colors" title="Regenerate Visual">
                                            <RotateCw className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-black/60 backdrop-blur text-white rounded-lg hover:bg-purple-600 transition-colors" title="Edit Motion">
                                            <GripHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Prompt for Active Scene */}
                        <div className="px-6 pb-4">
                            <div className="bg-[#1A1A1A] p-2 rounded-lg border border-white/5 flex gap-2">
                                <input
                                    type="text"
                                    value={activeScene.description}
                                    onChange={(e) => handleSceneUpdate(activeScene.id, { description: e.target.value })}
                                    className="flex-1 bg-transparent text-xs text-gray-300 outline-none px-2"
                                    placeholder="Scene description..."
                                />
                                <button className="p-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30">
                                    <Wand2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Enhanced Timeline */}
                        <div className="h-64 bg-[#141414] flex flex-col border-t-2 border-black">
                            {/* Toolbar */}
                            <div className="h-10 bg-[#1A1A1A] border-b border-white/5 flex items-center px-4 justify-between">
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="hover:text-white" onClick={() => setCurrentTime(0)}><SkipBack className="w-4 h-4" /></button>
                                    <button className="hover:text-white" onClick={togglePlay}>
                                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                    <button className="hover:text-white" onClick={() => setCurrentTime(duration)}><SkipForward className="w-4 h-4" /></button>
                                    <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
                                    <span className="text-xs font-mono">{new Date(currentTime * 1000).toISOString().substr(14, 8)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Zoom</span>
                                        <input type="range" className="w-20 h-1 bg-gray-700 rounded-full appearance-none accent-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Tracks Area */}
                            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative">
                                <div className="min-w-full h-full flex flex-col" style={{ width: `${Math.max(100, (duration * 20) / 10)}%` }}>

                                    {/* Track 1: Video/Scenes */}
                                    <div className="flex-1 border-b border-white/5 relative bg-[#0A0A0A]/50 flex items-center px-2 gap-1 py-1">
                                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-[#1A1A1A] z-10 border-r border-white/10 flex items-center justify-center text-xs text-gray-400 font-medium">Video</div>
                                        <div className="ml-24 flex gap-1 h-full w-full">
                                            {project.scenes.map((scene) => (
                                                <div
                                                    key={scene.id}
                                                    onClick={() => setActiveSceneId(scene.id)}
                                                    className={`h-full min-w-[120px] flex-1 relative group cursor-pointer border rounded overflow-hidden transition-all ${activeSceneId === scene.id ? 'border-purple-500 ring-1 ring-purple-500' : 'border-white/10 border-dashed opacity-80 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img src={scene.imageUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                                        <span className="text-[10px] text-white font-mono truncate w-full">{scene.description}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Track 2: Voice */}
                                    <div className="h-16 border-b border-white/5 relative bg-[#0A0A0A]/30 flex items-center px-2 py-1">
                                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-[#1A1A1A] z-10 border-r border-white/10 flex items-center justify-center text-xs text-gray-400 font-medium">Voice</div>
                                        <div className="ml-24 flex gap-2 h-full w-full relative">
                                            {/* Mock Voice Blocks */}
                                            {project.tracks?.filter(t => t.type === 'voice').map((track) => (
                                                <div
                                                    key={track.id}
                                                    className="absolute h-10 top-2 bg-blue-500/20 border border-blue-500/50 rounded-md flex items-center px-2 overflow-hidden cursor-move hover:bg-blue-500/30"
                                                    style={{
                                                        left: `${(track.startTime / duration) * 100}%`,
                                                        width: `${(track.duration / duration) * 100}%`
                                                    }}
                                                >
                                                    <div className="text-[10px] text-blue-200 truncate">{track.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Track 3: Music */}
                                    <div className="h-16 relative bg-[#0A0A0A]/30 flex items-center px-2 py-1">
                                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-[#1A1A1A] z-10 border-r border-white/10 flex items-center justify-center text-xs text-gray-400 font-medium">Music</div>
                                        <div className="ml-24 flex gap-2 h-full w-full relative">
                                            {project.tracks?.filter(t => t.type === 'music').map((track) => (
                                                <div
                                                    key={track.id}
                                                    className="absolute h-10 top-2 bg-green-500/20 border border-green-500/50 rounded-md flex items-center px-2 overflow-hidden"
                                                    style={{
                                                        left: `${(track.startTime / duration) * 100}%`,
                                                        width: `${(track.duration / duration) * 100}%`
                                                    }}
                                                >
                                                    <Music className="w-3 h-3 text-green-400 mr-2" />
                                                    <div className="text-[10px] text-green-200 truncate">{track.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Playhead */}
                                    <div
                                        className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-75"
                                        style={{ left: `calc(96px + ${(currentTime / duration) * 100}%)` }} // 96px is offset for labels
                                    >
                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500 -ml-[6px]"></div>
                                    </div>

                                    {/* Clickable Overlay for Seeking */}
                                    <div
                                        className="absolute inset-0 z-10 cursor-crosshair ml-24" // ml-24 to match track offset
                                        onClick={handleTimelineClick}
                                    />

                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right: Inspector / Motion / Mixer */}
                    <aside className="w-72 border-l border-white/10 bg-[#0A0A0A] flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Scene Properties</h3>

                            {/* Motion Controls */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-300">Camera Motion</span>
                                        <span className="text-[#00FF88]">{activeScene.cameraPath}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Static', 'Pan', 'Zoom', 'Orbit'].map(m => (
                                            <button
                                                key={m}
                                                className={`py-1.5 text-[10px] rounded border ${activeScene.cameraPath?.includes(m) ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-300">Motion Intensity</span>
                                        <span className="text-gray-500">{activeScene.motionIntensity || 50}%</span>
                                    </div>
                                    <input type="range" className="w-full h-1 bg-gray-700 rounded-full appearance-none accent-purple-500" defaultValue={50} />
                                </div>
                            </div>
                        </div>

                        {/* Audio Mixer */}
                        <div className="p-4 flex-1">
                            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Audio Mixer</h3>
                            <div className="space-y-4">
                                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-blue-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Voices</span>
                                        <span className="text-[10px] text-gray-500">100%</span>
                                    </div>
                                    <input type="range" className="w-full h-1 bg-gray-700 rounded-full appearance-none accent-blue-500" defaultValue={100} />
                                </div>
                                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-green-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Music</span>
                                        <span className="text-[10px] text-gray-500">50%</span>
                                    </div>
                                    <input type="range" className="w-full h-1 bg-gray-700 rounded-full appearance-none accent-green-500" defaultValue={50} />
                                </div>
                                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-orange-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> SFX</span>
                                        <span className="text-[10px] text-gray-500">75%</span>
                                    </div>
                                    <input type="range" className="w-full h-1 bg-gray-700 rounded-full appearance-none accent-orange-500" defaultValue={75} />
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        );
    }

    // Input View (Create Mode)
    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all`}>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Video Project</h1>
                    <p className="text-gray-400">Transform your idea into a complete video with script, scenes, and audio.</p>
                </div>

                {/* Prompt Section */}
                <section className="mb-6">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 relative group focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video scene you want to create... (e.g., 'A cyberpunk detective walking through rainy neon streets, investigating a mystery')"
                            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[120px] text-lg"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Enhance Prompt">
                                <Wand2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Controls Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Style */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-2">Video Style</label>
                        <StyleSelector styles={videoStyles} selected={style} onSelect={setStyle} icon={<Film className="w-4 h-4 text-[#00FF88]" />} />
                    </div>

                    {/* Camera Path */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-2">Camera Path</label>
                        <StyleSelector styles={cameraPaths} selected={cameraPath} onSelect={setCameraPath} icon={<Camera className="w-4 h-4 text-[#00FF88]" />} />
                    </div>

                    {/* Duration */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-2">Total Duration</label>
                        <div className="flex gap-2">
                            {durations.map(d => (
                                <button
                                    key={d.value}
                                    onClick={() => setDuration(d.value)}
                                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${duration === d.value
                                        ? 'bg-[#00FF88] text-[#0A0A0A] font-medium'
                                        : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reference Image */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-2">Reference Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleReferenceUpload}
                            className="hidden"
                        />
                        {referenceImage ? (
                            <div className="relative">
                                <img src={referenceImage} alt="Reference" className="w-full h-16 object-cover rounded-lg" />
                                <button
                                    onClick={() => setReferenceImage(null)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 rounded text-white hover:bg-black/70"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 border border-dashed border-white/20 rounded-lg text-gray-500 text-sm hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload
                            </button>
                        )}
                    </div>
                </section>

                {/* Advanced Panel */}
                <section className="mb-8">
                    <AdvancedPanel settings={advancedSettings} onChange={setAdvancedSettings} />
                </section>

                {/* Generate Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xl rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg shadow-purple-500/20 transform hover:scale-105"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                {loadingStep || "Generating..."}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" />
                                Generate Project
                            </>
                        )}
                    </button>
                </div>

                {/* Feature Highlights */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mt-12 py-8 border-t border-white/5">
                    <div className="p-4">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-200 font-medium mb-1">AI Scriptwriter</h3>
                        <p className="text-gray-500 text-sm">Automatically generates professional scripts and storyboards from your prompt.</p>
                    </div>
                    <div className="p-4">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400">
                            <VideoIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-200 font-medium mb-1">Scene Control</h3>
                        <p className="text-gray-500 text-sm">Edit individual scenes, camera angles, and visual details precisely.</p>
                    </div>
                    <div className="p-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                            <Music className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-200 font-medium mb-1">Smart Audio</h3>
                        <p className="text-gray-500 text-sm">Matches background music and effects to the mood of your video.</p>
                    </div>
                </section>
            </main>

            <GenerationQueue />
        </div>
    );
};

export default TextToVideoPage;
