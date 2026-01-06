import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video as VideoIcon, Film,
    RotateCw, Sparkles,
    X, Layers,
    Wand2, Check,
    Clock, Palette, RefreshCw,
} from 'lucide-react';
import NLEEditor from '@/components/editor/NLEEditor';
import { useGeneration } from '@/components/generation/GenerationContext';
import { StyleSelector } from '@/components/generation/AdvancedControls';
import aiService from '@/services/ai.service';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

/**
 * Text to Video Pro Editor Page
 * Features a professional-grade video editing suite interface
 * Based on the reference provided by the user.
 */

const videoStyles = [
    'Cinematic', 'Documentary', 'Surreal', 'Anime', 'Photorealistic',
    'Noir', 'Vintage', 'Sci-Fi', 'Fantasy', 'Minimalist'
];

const durations = [
    { value: 5, label: '05 sec' },
    { value: 10, label: '10 sec' },
    { value: 15, label: '15 sec' },
];

const TextToVideoPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { addJob } = useGeneration();

    // --- State Management ---
    const [workflowStep, setWorkflowStep] = useState<'input' | 'scenes' | 'editor'>('input');
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [duration, setDuration] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");

    const [project, setProject] = useState<any | null>(null);

    const [approvedScenes, setApprovedScenes] = useState<Set<string>>(new Set());





    // Load Project if ID exists
    useEffect(() => {
        if (projectId) {
            setIsGenerating(true);
            setLoadingStep("Loading Project...");
            // Simulate fetching project data
            // In a real implementation, this would call aiService.getProject(projectId)
            setTimeout(() => {
                const mockProject = {
                    projectId,
                    prompt: "Cinematic Sci-Fi Trailer (Loaded)",
                    settings: { style: "Cinematic", duration: 10 },
                    scenes: [
                        {
                            id: 'scene-1',
                            description: "A futuristic city skyline at sunset with flying cars.",
                            imageUrl: "https://image.pollinations.ai/prompt/futuristic%20city%20sunset%20cinematic?width=1280&height=720&nologo=true",
                            duration: 5,
                            properties: { opacity: 100, blendMode: 'Normal', scale: 100, rotation: 0, positionX: 0, positionY: 0, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 }
                        },
                        {
                            id: 'scene-2',
                            description: "Close up of a cybernetic eye reflecting neon lights.",
                            imageUrl: "https://image.pollinations.ai/prompt/cybernetic%20eye%20close%20up%20neon%20cinematic?width=1280&height=720&nologo=true",
                            duration: 5,
                            properties: { opacity: 100, blendMode: 'Normal', scale: 100, rotation: 0, positionX: 0, positionY: 0, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 }
                        }
                    ]
                };
                setProject(mockProject);
                setWorkflowStep('editor');
                setIsGenerating(false);
            }, 1000);
        }
    }, [projectId]);

    // --- Handlers ---
    const handleGenerateProject = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setLoadingStep("Directing AI Cast & Crew...");

        try {
            addJob({
                type: 'text-to-video',
                prompt,
                settings: { style, duration },
            });

            const data = await aiService.generateVideoProject({
                prompt,
                style,
                duration
            });

            // Initialize scene properties
            const projectWithProps = {
                ...data,
                scenes: data.scenes.map((s: any) => ({
                    ...s,
                    properties: {
                        opacity: 100,
                        blendMode: 'Normal',
                        positionX: 0,
                        positionY: 0,
                        scale: 100,
                        rotation: 0,
                        cropTop: 0,
                        cropBottom: 0,
                        cropLeft: 0,
                        cropRight: 0
                    }
                }))
            };

            setProject(projectWithProps);
            setWorkflowStep('scenes');
            toast.success("Project Storyboard Ready!");
        } catch (error: any) {
            console.error("Project generation failed:", error);
            toast.error(error.message || "Failed to generate project structure.");
        } finally {
            setIsGenerating(false);
            setLoadingStep("");
        }
    };

    const handleApproveAll = () => {
        if (!project) return;
        const allIds = project.scenes.map((s: any) => s.id);
        setApprovedScenes(new Set(allIds));
        setWorkflowStep('editor');
    };

    const toggleSceneApproval = (id: string) => {
        const next = new Set(approvedScenes);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setApprovedScenes(next);
    };



    const handleExport = () => {
        toast.promise(
            new Promise(r => setTimeout(r, 2000)).then(() => {
                setWorkflowStep('input');
                setProject(null);
                setPrompt('');
                setApprovedScenes(new Set());
                navigate('/app/create/text-to-video');
            }),
            {
                loading: 'Rendering final cinematic video...',
                success: 'Video exported successfully! Redirecting...',
                error: 'Failed to export video.'
            }
        );
    };



    const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

    const handleRegenerateScene = async (sceneId: string) => {
        if (!project || isRegenerating) return;
        const scene = project.scenes.find((s: any) => s.id === sceneId);
        if (!scene) return;

        setIsRegenerating(sceneId);
        try {
            const data = await aiService.regenerateScene(scene.description, project.settings.style);
            setProject((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    scenes: prev.scenes.map((s: any) => s.id === sceneId ? { ...s, imageUrl: data.imageUrl } : s)
                };
            });
            toast.success("Scene visual updated!");
        } catch (error) {
            toast.error("Failed to regenerate scene.");
        } finally {
            setIsRegenerating(null);
        }
    };

    const handleAnimateScene = async (sceneId: string) => {
        if (!project) return;
        const scene = project.scenes.find((s: any) => s.id === sceneId);
        if (!scene) return;

        toast.promise(aiService.animateScene(scene.imageUrl, scene.description), {
            loading: 'Initializing cinematic motion...',
            success: (data) => `Animation started! Job: ${data.jobId.slice(0, 8)}`,
            error: 'Failed to start animation.'
        });
    };



    // --- Sub-Components ---



    // --- Workflow Renderers ---

    if (workflowStep === 'input') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8 flex flex-col justify-center">
                <main className="max-w-4xl mx-auto w-full space-y-12">
                    <GSAPTransition animation="fade-in-up">
                        <div className="text-center space-y-6">
                            <div className="inline-flex p-4 bg-purple-500/10 border border-purple-500/20 rounded-[2rem] mb-2 animate-pulse">
                                <VideoIcon className="w-10 h-10 text-purple-400" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                                    Text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-blue-500">Cinema.</span>
                                </h1>
                                <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
                                    Turn any thought into a professional video project with AI orchestrated scenes.
                                </p>
                            </div>
                        </div>
                    </GSAPTransition>

                    <GSAPTransition animation="fade-in-up" delay={0.1}>
                        <div className="space-y-8 bg-[#141414] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Wand2 className="w-32 h-32 text-purple-500" />
                            </div>

                            <PromptBar
                                value={prompt}
                                onChange={setPrompt}
                                onGenerate={handleGenerateProject}
                                isGenerating={isGenerating}
                                placeholder="A cinematic trailer for a sci-fi epic set in 2099..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        <Palette className="w-3 h-3" /> Visual Aesthetic
                                    </label>
                                    <StyleSelector styles={videoStyles} selected={style} onSelect={setStyle} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Targeted Duration
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {durations.map(d => (
                                            <button
                                                key={d.value}
                                                onClick={() => setDuration(d.value)}
                                                className={`py-4 rounded-2xl text-[10px] font-black transition-all border ${duration === d.value
                                                    ? 'bg-[#00FF88] text-black border-[#00FF88] scale-105 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                                                    : 'bg-black/40 text-gray-500 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GSAPTransition>
                </main>

                {isGenerating && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
                        <div className="text-center space-y-10 max-w-sm w-full">
                            <div className="relative w-32 h-32 mx-auto">
                                <div className="absolute inset-0 border-[6px] border-purple-500/10 rounded-full" />
                                <div className="absolute inset-0 border-[6px] border-[#00FF88] border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(0,255,136,0.2)]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-[#00FF88] animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-white tracking-tight">{loadingStep}</h3>
                                <p className="text-gray-500 font-medium">Nebula AI is scriptwriting and storyboarding your vision.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (workflowStep === 'scenes' && project) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
                <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#141414]/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setWorkflowStep('input')} className="p-2 hover:bg-white/5 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Approve Storyboard</h2>
                            <p className="text-xs text-gray-500 font-medium">{project.scenes.length} Scenes Generated</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            {approvedScenes.size} / {project.scenes.length} Approved
                        </span>
                        <button
                            onClick={handleApproveAll}
                            className="px-8 py-3 bg-[#00FF88] text-black font-black text-xs rounded-2xl hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.2)] uppercase tracking-widest"
                        >
                            Open Pro Editor
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {project.scenes.map((scene: any, idx: number) => (
                                <GSAPTransition key={scene.id} animation="fade-in-up" delay={idx * 0.05}>
                                    <div className={`group relative bg-[#141414] rounded-[2rem] border transition-all overflow-hidden ${approvedScenes.has(scene.id) ? 'border-[#00FF88]' : 'border-white/5'}`}>
                                        <div className="aspect-video relative overflow-hidden">
                                            <img src={scene.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                                            <button
                                                onClick={() => toggleSceneApproval(scene.id)}
                                                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${approvedScenes.has(scene.id) ? 'bg-[#00FF88] text-black scale-110 shadow-[0_0_20px_rgba(0,255,136,0.4)]' : 'bg-black/40 backdrop-blur-md text-white border border-white/20'}`}
                                            >
                                                {approvedScenes.has(scene.id) ? <Check className="w-6 h-6" /> : <Layers className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-[#00FF88] uppercase tracking-widest">Scene {idx + 1}</span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{scene.duration} Seconds</span>
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium leading-relaxed line-clamp-3">"{scene.description}"</p>
                                            <div className="pt-2 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRegenerateScene(scene.id)}
                                                    disabled={!!isRegenerating}
                                                    className="flex-1 py-2 text-[10px] font-black text-gray-500 uppercase border border-white/5 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {isRegenerating === scene.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
                                                    Regenerate
                                                </button>
                                                <button
                                                    onClick={() => handleAnimateScene(scene.id)}
                                                    className="flex-1 py-2 text-[10px] font-black text-gray-500 uppercase border border-white/5 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Film className="w-3 h-3" />
                                                    Animate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </GSAPTransition>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (workflowStep === 'editor' && project) {
        return (
            <NLEEditor
                initialProject={project as any}
                onExport={handleExport}
                onGoBack={() => {
                    setWorkflowStep('input');
                    setProject(null);
                    setPrompt('');
                    setApprovedScenes(new Set());
                    navigate('/app/create/text-to-video');
                }}
            />
        );
    }

    return null;
};

export default TextToVideoPage;
