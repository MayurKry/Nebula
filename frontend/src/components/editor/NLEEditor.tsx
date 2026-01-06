
import { useState, useRef, useEffect } from 'react';
import {
    Video as VideoIcon, Film,
    RotateCw, Play, Pause, Music,
    X, ChevronDown, ChevronRight,
    Maximize2, Volume2, Move, Scissors,
    Type, Wand2, Share2, SkipBack, SkipForward,
    Lock, Download
} from 'lucide-react';
import { toast } from 'sonner';
import type { GenerateVideoProjectResponse, VideoProjectScene } from '@/services/ai.service';

export interface InteractiveScene extends VideoProjectScene {
    properties?: {
        opacity: number;
        blendMode: string;
        positionX: number;
        positionY: number;
        scale: number;
        rotation: number;
        cropTop: number;
        cropBottom: number;
        cropLeft: number;
        cropRight: number;
    };
    subtitle?: string; // User-editable subtitle text
}

export interface InteractiveProject extends Omit<GenerateVideoProjectResponse, 'scenes'> {
    scenes: InteractiveScene[];
}

interface NLEEditorProps {
    initialProject: InteractiveProject;
    onExport?: () => void;
    onGoBack?: () => void;
}

const NLEEditor = ({ initialProject, onExport, onGoBack }: NLEEditorProps) => {
    const [project, setProject] = useState<InteractiveProject>(initialProject);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(project.scenes[0]?.id || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [timelineZoom, setTimelineZoom] = useState(50);
    const [selectedTool, setSelectedTool] = useState('move');
    const [volume, setVolume] = useState(80);
    const [activeTabLeft, setActiveTabLeft] = useState<'properties' | 'layers'>('properties');
    const [expandedAccordions, setExpandedAccordions] = useState<string[]>(['compositing', 'transform', 'subtitle', 'timing']);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [activeTrackType, setActiveTrackType] = useState<'video' | 'subtitle'>('video');

    const timelineRef = useRef<HTMLDivElement>(null);

    // Ensure scenes have properties if missing
    useEffect(() => {
        if (!project) return;
        const initializedScenes = project.scenes.map(scene => ({
            ...scene,
            properties: scene.properties || {
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
            },
            subtitle: scene.subtitle || scene.description?.split('.')[0] || "Enter subtitle..."
        }));
        // Only update if there are changes to avoid loop
        if (JSON.stringify(initializedScenes) !== JSON.stringify(project.scenes)) {
            setProject(prev => ({ ...prev, scenes: initializedScenes }));
        }
    }, []);

    const duration = project?.settings.duration || 30;

    // Timeline Playback Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + 0.1;
                    if (next >= duration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, duration]);

    // Sync Active Scene with Time
    useEffect(() => {
        if (!project || isPlaying) return;

        let elapsed = 0;
        const scene = project.scenes.find((s: InteractiveScene) => {
            const sDur = s.duration || (duration / project.scenes.length);
            if (currentTime >= elapsed && currentTime < elapsed + sDur) return true;
            elapsed += sDur;
            return false;
        });

        if (scene && scene.id !== activeSceneId) {
            setActiveSceneId(scene.id);
        }
    }, [currentTime, project, isPlaying, duration, activeSceneId]);

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pos = Math.max(0, Math.min(1, x / rect.width));
        setCurrentTime(pos * duration);
    };

    const handleExportProject = async () => {
        if (onExport) {
            onExport();
            return;
        }

        toast.promise(
            new Promise(r => setTimeout(r, 2000)),
            {
                loading: 'Rendering final cinematic video...',
                success: 'Video exported successfully!',
                error: 'Failed to export video.'
            }
        );
    };

    const toggleAccordion = (id: string) => {
        setExpandedAccordions(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const updateActiveSceneProperty = (key: string, value: any) => {
        if (!project || !activeSceneId) return;
        setProject(prev => ({
            ...prev,
            scenes: prev.scenes.map(s => {
                if (s.id !== activeSceneId) return s;
                const defaultProps = {
                    opacity: 100, blendMode: 'Normal', positionX: 0, positionY: 0,
                    scale: 100, rotation: 0, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0
                };
                return {
                    ...s,
                    properties: { ...(s.properties || defaultProps), [key]: value },
                    subtitle: key === 'subtitle' ? value : s.subtitle
                };
            })
        }));
    };

    const RenderPropertiesPanel = () => {
        const activeScene = project?.scenes.find(s => s.id === activeSceneId) || project?.scenes[0];
        const props = activeScene?.properties || {
            opacity: 100, blendMode: 'Normal', positionX: 0, positionY: 0, scale: 100, rotation: 0,
            cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0
        };

        if (activeTabLeft !== 'properties') return <div className="p-4 text-gray-500 text-sm">Layers panel placeholder</div>;

        return (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Compositing */}
                <div className="border-b border-white/5">
                    <button
                        onClick={() => toggleAccordion('compositing')}
                        className="w-full px-4 py-3 flex items-center justify-between font-serif text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Compositing
                        {expandedAccordions.includes('compositing') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {expandedAccordions.includes('compositing') && (
                        <div className="px-4 pb-4 space-y-4">
                            <div className="space-y-1 relative group">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Opacity</span>
                                    <span className="font-mono text-[#00FF88]">{props.opacity}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={props.opacity}
                                    onChange={(e) => updateActiveSceneProperty('opacity', parseInt(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FF88]"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-400 block mb-1">Blend Mode</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {['Normal', 'Multiply', 'Screen', 'Overlay', 'Add', 'Soft Light'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => updateActiveSceneProperty('blendMode', mode)}
                                            className={`px-2 py-1 text-[9px] rounded border ${props.blendMode === mode ? 'bg-[#00FF88] text-black border-[#00FF88]' : 'bg-black/20 text-gray-500 border-white/10 hover:border-white/30'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transform */}
                <div className="border-b border-white/5">
                    <button
                        onClick={() => toggleAccordion('transform')}
                        className="w-full px-4 py-3 flex items-center justify-between font-serif text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Transform
                        {expandedAccordions.includes('transform') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {expandedAccordions.includes('transform') && (
                        <div className="px-4 pb-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-400">Position X</span>
                                    <input
                                        type="number"
                                        value={props.positionX}
                                        onChange={(e) => updateActiveSceneProperty('positionX', parseInt(e.target.value))}
                                        className="w-full bg-[#111] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[#00FF88] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-400">Position Y</span>
                                    <input
                                        type="number"
                                        value={props.positionY}
                                        onChange={(e) => updateActiveSceneProperty('positionY', parseInt(e.target.value))}
                                        className="w-full bg-[#111] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[#00FF88] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Scale</span>
                                    <span className="font-mono text-[#00FF88]">{props.scale}%</span>
                                </div>
                                <input
                                    type="range" min="10" max="200"
                                    value={props.scale}
                                    onChange={(e) => updateActiveSceneProperty('scale', parseInt(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FF88]"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Rotation</span>
                                    <span className="font-mono text-[#00FF88]">{props.rotation}°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RotateCw className="w-3 h-3 text-gray-500" />
                                    <input
                                        type="range" min="-180" max="180"
                                        value={props.rotation}
                                        onChange={(e) => updateActiveSceneProperty('rotation', parseInt(e.target.value))}
                                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FF88]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Crop & Trim */}
                <div className="border-b border-white/5">
                    <button
                        onClick={() => toggleAccordion('crop')}
                        className="w-full px-4 py-3 flex items-center justify-between font-serif text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Crop & Inset
                        {expandedAccordions.includes('crop') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {expandedAccordions.includes('crop') && (
                        <div className="px-4 pb-4 space-y-3">
                            {['Top', 'Bottom', 'Left', 'Right'].map(side => (
                                <div key={side} className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500 w-12">{side}</span>
                                    <input
                                        type="range" min="0" max="100"
                                        value={(props as any)[`crop${side}`] || 0}
                                        onChange={(e) => updateActiveSceneProperty(`crop${side}`, parseInt(e.target.value))}
                                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FF88]"
                                    />
                                    <span className="text-[9px] font-mono text-gray-400 w-6 text-right">{(props as any)[`crop${side}`] || 0}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const RenderSubtitlePanel = () => {
        const activeScene = project?.scenes.find(s => s.id === activeSceneId);
        if (!activeScene) return null;

        return (
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <label className="font-serif text-sm text-gray-400">Subtitle Text</label>
                    <textarea
                        value={activeScene.subtitle || ''}
                        onChange={(e) => updateActiveSceneProperty('subtitle', e.target.value)}
                        rows={4}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#00FF88] outline-none resize-none placeholder-gray-600"
                        placeholder="Type subtitle here..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-serif text-sm text-gray-400">Duration (sec)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="1" max="30" step="0.5"
                            value={activeScene.duration || 5}
                            onChange={(e) => {
                                const newDuration = parseFloat(e.target.value);
                                setProject(prev => ({
                                    ...prev,
                                    scenes: prev.scenes.map(s => s.id === activeSceneId ? { ...s, duration: newDuration } : s)
                                }));
                            }}
                            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FF88]"
                        />
                        <span className="font-mono text-[#00FF88] text-xs">{activeScene.duration?.toFixed(1)}s</span>
                    </div>
                </div>
            </div>
        );
    };

    const RenderResourcesPanel = () => {
        const resources = [
            { id: 'mus_1', type: 'audio', title: 'Epic Cinematic Build', duration: '2:30', isPaid: false, thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60' },
            { id: 'vid_1', type: 'video', title: '4K Space Dust Texture', duration: '0:15', isPaid: true, price: 5, thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=60' },
            { id: 'sfx_1', type: 'audio', title: 'Laser Cannon Blast', duration: '0:03', isPaid: false, thumbnail: 'https://images.unsplash.com/photo-1460130099499-4c284cb58763?w=800&auto=format&fit=crop&q=60' },
            { id: 'vid_2', type: 'video', title: 'Glitch Transition Pack', duration: '0:05', isPaid: true, price: 12, thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60' },
            { id: 'mus_2', type: 'audio', title: 'Cyberpunk City Ambience', duration: '5:00', isPaid: false, thumbnail: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&auto=format&fit=crop&q=60' },
            { id: 'vid_3', type: 'video', title: 'Film Grain Overlay', duration: '0:30', isPaid: true, price: 8, thumbnail: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&auto=format&fit=crop&q=60' },
        ];

        return (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="grid grid-cols-2 gap-3">
                    {resources.map((res) => (
                        <div key={res.id} className="relative group bg-[#161616] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer">
                            <div className="aspect-square relative overflow-hidden">
                                <img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                {res.isPaid ? (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" />
                                        PRO
                                    </div>
                                ) : (
                                    <div className="absolute top-2 right-2 bg-[#00FF88] text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                                        FREE
                                    </div>
                                )}

                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-[10px] font-bold text-white leading-tight line-clamp-2">{res.title}</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">{res.type === 'video' ? 'Video' : 'Audio'} • {res.duration}</p>
                                </div>

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    {res.isPaid ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toast.info(`Redirecting to payment for: ${res.title} ($${res.price})`);
                                            }}
                                            className="w-full py-1.5 bg-yellow-400 text-black text-[10px] font-black rounded flex items-center justify-center gap-1 hover:brightness-110"
                                        >
                                            BUY ${res.price}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toast.success('Resource added to project!');
                                            }}
                                            className="w-full py-1.5 bg-[#00FF88] text-black text-[10px] font-black rounded flex items-center justify-center gap-1 hover:brightness-110"
                                        >
                                            <Download className="w-3 h-3" /> ADD
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const activeScene = project.scenes.find(s => s.id === activeSceneId) || project.scenes[0];

    return (
        <div className="h-full bg-[#0A0A0A] flex flex-col text-white overflow-hidden custom-editor">
            {/* --- HEADER --- */}
            <header className="h-14 border-b border-white/10 bg-[#111111] flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <VideoIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-serif text-lg font-medium text-white leading-none">Pro Editor</h2>
                        <p className="font-serif text-xs text-gray-500 italic mt-0.5">Nebula NLE</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg flex p-1">
                        <button className="px-3 py-1 text-[10px] font-bold text-[#00FF88] bg-white/5 rounded shadow-sm">Composite</button>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <button onClick={handleExportProject} className="flex items-center gap-2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition-colors">
                        <Share2 className="w-3 h-3" />
                        Export
                    </button>
                    {onGoBack && (
                        <button onClick={onGoBack} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR: PROPERTIES */}
                <aside className="w-[300px] border-r border-white/10 bg-[#111111] flex flex-col z-20">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTabLeft('properties')}
                            className={`flex-1 py-3 font-serif text-sm transition-colors relative ${activeTabLeft === 'properties' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Properties
                            {activeTabLeft === 'properties' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#00FF88]" />}
                        </button>
                        <button
                            onClick={() => setActiveTabLeft('layers')}
                            className={`flex-1 py-3 font-serif text-sm transition-colors relative ${activeTabLeft === 'layers' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Layers
                            {activeTabLeft === 'layers' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#00FF88]" />}
                        </button>
                    </div>
                    <div className="px-4 py-2 border-b border-white/5 bg-[#161616]">
                        <span className="font-serif text-xs text-[#00FF88] italic">
                            Editing: {activeTrackType === 'video' ? 'Visual Properties' : 'Subtitles'}
                        </span>
                    </div>
                    {activeTrackType === 'video' ? <RenderPropertiesPanel /> : <RenderSubtitlePanel />}
                </aside>

                {/* CENTER COMPOSITION SPACE */}
                <div className="flex-1 flex flex-col bg-[#080808] relative">
                    {/* VIEWPORT BAR */}
                    <div className="h-10 bg-[#111111] border-b border-white/10 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <span className="font-serif text-sm text-gray-400">Main Compositor</span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                <span>{project.settings?.style?.toUpperCase() || 'CINEMATIC'}</span>
                                <span className="text-gray-600">|</span>
                                <span>24 FPS</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 mr-2">
                                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} className="text-gray-500 text-xs">-</button>
                                <span className="text-[10px] font-bold text-gray-400">{(zoomLevel * 100).toFixed(0)}%</span>
                                <button onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))} className="text-gray-500 text-xs">+</button>
                            </div>
                            <Maximize2 className="w-3.5 h-3.5 text-gray-500 cursor-pointer" />
                        </div>
                    </div>

                    {/* PLAYER */}
                    <div className="flex-1 relative flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#111111_0%,_#080808_100%)]">
                        <div
                            className="relative aspect-video w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-white/5"
                            style={{ transform: `scale(${zoomLevel})` }}
                        >
                            {activeScene && activeScene.imageUrl && (
                                <img
                                    src={activeScene.imageUrl}
                                    className="w-full h-full object-cover transition-all duration-300"
                                    style={{
                                        opacity: (activeScene.properties?.opacity ?? 100) / 100,
                                        transform: `scale(${(activeScene.properties?.scale ?? 100) / 100}) rotate(${activeScene.properties?.rotation ?? 0}deg) translate(${activeScene.properties?.positionX ?? 0}px, ${activeScene.properties?.positionY ?? 0}px)`,
                                        mixBlendMode: (activeScene.properties?.blendMode?.toLowerCase() ?? 'normal') as any,
                                        clipPath: `inset(${activeScene.properties?.cropTop ?? 0}px ${activeScene.properties?.cropRight ?? 0}px ${activeScene.properties?.cropBottom ?? 0}px ${activeScene.properties?.cropLeft ?? 0}px)`
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                            {/* Subtitle Overlay */}
                            {activeScene && (
                                <div className="absolute bottom-10 left-0 right-0 text-center px-8">
                                    <span className="bg-black/60 shadow-2xl text-yellow-500 text-lg font-bold px-4 py-1 italic border border-white/10">
                                        Nebula AI: {activeScene.subtitle}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TIMELINE TRANSPORT BAR */}
                    <div className="h-12 border-t border-white/10 bg-[#111111] flex items-center justify-between px-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 text-gray-400">
                                <button onClick={() => setCurrentTime(0)} className="hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[#00FF88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
                                </button>
                                <button onClick={() => setCurrentTime(duration)} className="hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="text-[#00FF88]">{(currentTime).toFixed(2)}s</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-gray-500">{duration.toFixed(2)}s</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 group">
                                <Volume2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                    className="w-24 accent-purple-500 h-1 bg-white/10 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR: ASSETS */}
                <aside className="w-[320px] border-l border-white/10 bg-[#111111] flex flex-col">
                    <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="font-serif text-sm text-gray-300">Library</span>
                    </header>
                    <RenderResourcesPanel />
                </aside>
            </div>

            {/* --- TIMELINE AREA --- */}
            <footer className="h-64 bg-[#111111] border-t border-white/10 flex flex-col relative z-50">
                {/* TIMELINE TOOLBAR */}
                <div className="h-10 bg-[#161616] border-b border-white/5 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {/* Toolbar Buttons */}
                        {[
                            { Icon: Move, id: 'move' },
                            { Icon: Scissors, id: 'cut' },
                            { Icon: Type, id: 'text' },
                            { Icon: Music, id: 'audio' },
                            { Icon: Wand2, id: 'ai' }
                        ].map(({ Icon, id }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedTool(id)}
                                className={`p-2 rounded transition-colors ${selectedTool === id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mr-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-wider">Timeline Zoom</span>
                            <input
                                type="range"
                                min="10" max="100"
                                value={timelineZoom}
                                onChange={(e) => setTimelineZoom(parseInt(e.target.value))}
                                className="w-20 accent-purple-500 h-1"
                            />
                        </div>
                    </div>
                </div>

                {/* TIMELINE TRACKS AREA */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Headers Column */}
                    <div className="w-48 border-r border-white/5 bg-[#111111] flex flex-col pt-4">
                        {[
                            { label: 'Video Stage', icon: Film, color: 'text-purple-400' },
                            { label: 'Nebula AI Vocal', icon: VideoIcon, color: 'text-[#00FF88]' },
                            { label: 'Cinematic Audio', icon: Music, color: 'text-blue-400' },
                            { label: 'Subtitles', icon: Type, color: 'text-yellow-400' }
                        ].map((track, i) => (
                            <div key={i} className="h-12 px-4 flex items-center gap-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                <track.icon className={`w-3.5 h-3.5 ${track.color}`} />
                                <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-white">{track.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sequencer Column */}
                    <div className="flex-1 relative bg-[#0D0D0D] overflow-x-auto overflow-y-hidden custom-scrollbar pt-4" onClick={handleTimelineClick} ref={timelineRef}>
                        {/* Time markers */}
                        <div className="absolute top-0 left-0 right-0 h-4 border-b border-white/5 flex text-[9px] text-gray-700 font-mono items-center">
                            {[...Array(Math.ceil(duration) + 1)].map((_, i) => (
                                <div key={i} className="flex-1 border-l border-white/10 h-2 flex items-center pl-2">
                                    {i.toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        {/* Playhead */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-[#00FF88] z-30 transition-shadow shadow-[0_0_15px_rgba(0,255,136,0.6)]"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-[#00FF88] rounded-full border-2 border-[#111111] shadow-xl" />
                        </div>

                        {/* Tracks */}
                        <div className="flex flex-col">
                            {/* Video Track */}
                            <div className="h-12 border-b border-white/[0.02] relative flex items-center px-1">
                                {project.scenes.map((scene: any, i: number) => (
                                    <div
                                        key={scene.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSceneId(scene.id);
                                            setActiveTrackType('video');
                                        }}
                                        className={`h-9 rounded-md border flex items-center gap-2 overflow-hidden px-2 group cursor-pointer transition-all ${activeSceneId === scene.id && activeTrackType === 'video' ? 'bg-purple-500/30 border-purple-500/60 ring-1 ring-purple-500/40' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                        style={{ width: `${(1 / project.scenes.length) * 100}%` }}
                                    >
                                        <img src={scene.imageUrl} className="w-8 h-5 object-cover rounded" />
                                        <span className="text-[8px] font-bold text-gray-400 truncate opacity-40 group-hover:opacity-100 uppercase tracking-tighter">Clip_{i + 1}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Vocal Track */}
                            <div className="h-12 border-b border-white/[0.02] relative flex items-center px-1">
                                <div
                                    className="h-9 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-md flex flex-col justify-center px-3"
                                    style={{ width: '40%', marginLeft: '10%' }}
                                >
                                    <span className="text-[8px] font-black text-[#00FF88]/80 uppercase tracking-widest">Narrator_Rachel.wav</span>
                                    <div className="h-2 w-full mt-1 flex items-center gap-0.5 opacity-40">
                                        {[...Array(20)].map((_, i) => <div key={i} className="flex-1 bg-[#00FF88]" style={{ height: `${Math.random() * 100}%` }} />)}
                                    </div>
                                </div>
                            </div>

                            {/* Music Track */}
                            <div className="h-12 border-b border-white/[0.02] relative flex items-center px-1">
                                <div
                                    className="h-9 bg-blue-500/10 border border-blue-500/30 rounded-md flex flex-col justify-center px-3"
                                    style={{ width: '90%', marginLeft: '2%' }}
                                >
                                    <span className="text-[8px] font-black text-blue-400/80 uppercase tracking-widest">Atmospheric_Score_v1.mp3</span>
                                    <div className="h-2 w-full mt-1 flex items-center gap-0.5 opacity-30">
                                        {[...Array(40)].map((_, i) => <div key={i} className="flex-1 bg-blue-400" style={{ height: `${Math.random() * 80}%` }} />)}
                                    </div>
                                </div>
                            </div>

                            {/* Subtitle Track */}
                            <div className="h-12 relative flex items-center px-1">
                                {project.scenes.map((scene: any, i: number) => (
                                    <div
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSceneId(scene.id);
                                            setActiveTrackType('subtitle');
                                        }}
                                        className={`h-8 border rounded-md flex items-center px-2 cursor-pointer transition-all duration-200 ${activeSceneId === scene.id && activeTrackType === 'subtitle' ? 'bg-yellow-500/20 border-yellow-400 ring-1 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'bg-yellow-400/5 border-yellow-400/20 hover:border-yellow-400/50'}`}
                                        style={{ width: `${(1 / project.scenes.length) * 100}%` }}
                                    >
                                        <span className={`text-[8px] font-bold truncate ${activeSceneId === scene.id && activeTrackType === 'subtitle' ? 'text-yellow-300' : 'text-yellow-400/60'}`}>{scene.subtitle || `Sub_${i + 1}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NLEEditor;
