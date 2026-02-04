import {
    Video, Image, Mic, Mic2,
    Wand2, Download, X, Check, Play, Pause, Folder
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { aiService } from '@/services/ai.service';
import { assetService } from '@/services/asset.service';
import GenerationGame from '@/components/game/GenerationGame';
import PromptBar from '@/components/ui/PromptBar';
import { toast } from 'sonner';

const DashboardPage = () => {
    useAuth();
    const [prompt, setPrompt] = useState('');
    const [generationMode, setGenerationMode] = useState<'image' | 'video' | 'voice'>('video');

    // Generation States
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{
        type: 'image' | 'video' | 'audio';
        url: string;
        assetId?: string;
        prompt: string;
    } | null>(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const container = useRef<HTMLDivElement>(null);

    const getMediaUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/v1';
        const serverBase = apiBase.replace('/v1', '');
        return `${serverBase}${url}`;
    };

    useGSAP(() => {
        // Subtle hover animation for cards globally within this container
        const cards = gsap.utils.toArray('.dashboard-card');
        cards.forEach((card: any) => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -4, scale: 1.02, duration: 0.3, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.inOut' });
            });
        });
    }, { scope: container });



    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setResult(null);

        try {
            if (generationMode === 'image') {
                const images = await aiService.generateImages({ prompt }, 1);
                if (images.length > 0) {
                    setResult({
                        type: 'image',
                        url: images[0].url,
                        assetId: images[0].assetId,
                        prompt: prompt
                    });
                    toast.success("Image generated successfully!");
                }
            } else if (generationMode === 'video') {
                const job = await aiService.generateVideo({ prompt });
                toast.info("Video generation started. Please wait...");

                // Poll for video status
                let completed = false;
                let attempts = 0;
                const maxAttempts = 60; // 5 minutes approx

                while (!completed && attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 5000));
                    const status = await aiService.checkVideoStatus(job.jobId);

                    if (status.status === 'completed' && status.videoUrl) {
                        setResult({
                            type: 'video',
                            url: status.videoUrl,
                            assetId: (status as any).assetId,
                            prompt: prompt
                        });
                        completed = true;
                        toast.success("Video generated successfully!");
                    } else if (status.status === 'failed') {
                        throw new Error("Video generation failed");
                    }
                    attempts++;
                }
                if (!completed) throw new Error("Video generation timed out");
            } else if (generationMode === 'voice') {
                const job = await aiService.generateAudio({ prompt });
                toast.info("Audio generation started...");

                // Poll for audio status
                let completed = false;
                let attempts = 0;
                const maxAttempts = 30;

                while (!completed && attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 3000));
                    const status = await aiService.checkAudioStatus(job.jobId);

                    if (status.status === 'succeeded' && status.audioUrl) {
                        setResult({
                            type: 'audio',
                            url: status.audioUrl,
                            assetId: (status as any).assetId,
                            prompt: prompt
                        });
                        completed = true;
                        toast.success("Audio generated successfully!");
                    } else if (status.status === 'failed') {
                        throw new Error("Audio generation failed");
                    }
                    attempts++;
                }
                if (!completed) throw new Error("Audio generation timed out");
            }
        } catch (error: any) {
            console.error('Generation failed:', error);
            toast.error(error.message || "Generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!result) return;
        try {
            toast.info("Preparing file for download...");
            let blob;

            if (result.assetId) {
                // Use proxy service for reliable download
                try {
                    blob = await assetService.downloadAsset(result.assetId);
                } catch (proxyError) {
                    console.warn('Proxy download failed, trying direct fetch:', proxyError);
                    // Fallback to direct fetch if proxy fails
                    try {
                        const response = await fetch(getMediaUrl(result.url), { mode: 'cors', credentials: 'include' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        blob = await response.blob();
                    } catch (fetchError) {
                        // Retry without credentials
                        const response = await fetch(getMediaUrl(result.url), { mode: 'cors', credentials: 'omit' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        blob = await response.blob();
                    }
                }
            } else {
                // Direct fetch for results without assetId
                try {
                    const response = await fetch(getMediaUrl(result.url), { mode: 'cors', credentials: 'include' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    blob = await response.blob();
                } catch (fetchError) {
                    // Retry without credentials
                    const response = await fetch(getMediaUrl(result.url), { mode: 'cors', credentials: 'omit' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    blob = await response.blob();
                }
            }

            // Determine file extension from blob type or result.type
            let extension = '';
            if (blob.type) {
                const mimeMap: Record<string, string> = {
                    'image/png': '.png',
                    'image/jpeg': '.jpg',
                    'image/webp': '.webp',
                    'video/mp4': '.mp4',
                    'audio/mpeg': '.mp3',
                    'audio/wav': '.wav'
                };
                extension = mimeMap[blob.type] || '';
            }
            if (!extension) {
                extension = result.type === 'video' ? '.mp4' : result.type === 'audio' ? '.mp3' : '.png';
            }

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `nebula-${result.type}-${Date.now()}${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success("Download completed successfully!");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Download failed. Please try again or use direct save.");
        }
    };

    const handleSaveToAssets = async () => {
        if (!result || result.assetId) return;
        try {
            await assetService.createAsset({
                name: result.prompt,
                type: result.type,
                url: result.url,
                tags: ['dashboard-generation']
            });
            toast.success("Saved to Assets Library!");
            // Refresh result to show it's saved (mocking since we don't have the new ID easily)
            setResult(prev => prev ? { ...prev, assetId: 'saved' } : null);
        } catch (error) {
            toast.error("Failed to save to library");
        }
    };

    // Mock Suggestions Data
    const suggestions = [
        { id: 1, mode: 'video', category: 'Cinematic', label: 'Cyberpunk Detective', text: 'A cyberpunk detective walking through rainy neon streets, investigating a mystery', icon: Video },
        { id: 2, mode: 'voice', category: 'Narrative', label: 'Audiobook Narration', text: 'A soothing but authoritative professional voice for a thriller audiobook', icon: Mic2 },
        { id: 3, mode: 'image', category: '3D Render', label: 'Abstract Glass', text: '3D render of abstract glass shapes with iridescent lighting, 8k resolution', icon: Image },
        { id: 4, mode: 'video', category: 'Nature', label: 'Drone Landscape', text: 'Aerial drone shot of a majestic waterfall in Iceland, mossy rocks, 4k', icon: Video },
        { id: 5, mode: 'voice', category: 'Marketing', label: 'Commercial Tagline', text: 'Excited energetic voice-over for a high-performance sports brand holiday sale', icon: Mic },
    ];

    const categories = ['All', 'Cinematic', 'Marketing', '3D Render', 'Narrative', 'Nature'];
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredSuggestions = suggestions.filter(s => activeCategory === 'All' || s.category === activeCategory);

    return (
        <div ref={container} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">

            {/* Inline Generation Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl h-[400px]">
                        <GenerationGame />
                        <p className="text-center text-gray-500 mt-4 text-xs">Generating your masterpiece...</p>
                    </div>
                </div>
            )}

            {/* Dashboard Hero */}
            <GSAPTransition animation="fade-in-up" duration={1}>
                <div className="text-center space-y-12 sm:space-y-16 py-8 sm:py-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Prompt. Direct. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">Render.</span>
                        </h1>
                        <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto italic">Transform your raw ideas into cinematic video projects with AI-driven choreography.</p>
                    </div>

                    <div className="max-w-3xl mx-auto relative">
                        {/* Mode Toggle Tabs */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-[#141414] border border-white/10 p-1 rounded-full inline-flex relative shadow-xl">
                                <button
                                    onClick={() => setGenerationMode('video')}
                                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'video' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Video className="w-4 h-4" />
                                    <span>Video</span>
                                </button>
                                <button
                                    onClick={() => setGenerationMode('image')}
                                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'image' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Image className="w-4 h-4" />
                                    <span>Image</span>
                                </button>
                                <button
                                    onClick={() => setGenerationMode('voice')}
                                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'voice' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Mic2 className="w-4 h-4" />
                                    <span>Voice</span>
                                </button>

                                {/* Sliding Background */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-[#00FF88] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${generationMode === 'video' ? 'left-1' : generationMode === 'image' ? 'left-[calc(33.33%+2px)]' : 'left-[calc(66.66%+2px)]'}`}
                                />
                            </div>
                        </div>

                        {/* Glowing Shadow Wrapper - Only for Prompt */}
                        <div className="relative group mb-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[28px] blur-lg group-hover:blur-xl transition-all opacity-50 group-hover:opacity-100 duration-1000" />
                            <PromptBar
                                value={prompt}
                                onChange={setPrompt}
                                onGenerate={handleGenerate}
                                placeholder={`State your vision for this ${generationMode === 'voice' ? 'voiceover' : generationMode}...`}
                                isGenerating={isGenerating}
                            />
                        </div>

                        {/* Prompt Pills / Suggestions (Outside Glow) */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 px-4 mb-4">
                            {[
                                { label: 'Sci-Fi Epic', onClick: () => { setPrompt('A high-octane cinematic trailer for a sci-fi epic, massive space stations and neon cities, volumetric lighting'); setGenerationMode('video'); }, icon: <Video className="w-3 h-3" /> },
                                { label: 'British Narrator', onClick: () => { setPrompt('A deep professional British voice with a calm and wise tone'); setGenerationMode('voice'); }, icon: <Mic2 className="w-3 h-3" /> },
                                { label: 'Macro Product', onClick: () => { setPrompt('An elegant product showcase for a luxury watch, smooth macro shots, soft bokeh, 8k photorealistic'); setGenerationMode('image'); }, icon: <Wand2 className="w-3 h-3" /> },
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
                    </div>

                    {/* Result Display Modal */}
                    {result && (
                        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                            <div className="max-w-4xl w-full bg-[#111111] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center gap-6 p-8 relative shadow-2xl" onClick={() => { }}>
                                <button
                                    onClick={() => setResult(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="w-full aspect-video flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden border border-white/5 relative group">
                                    {result.type === 'image' ? (
                                        <img src={getMediaUrl(result.url)} alt="Generated result" className="w-full h-full object-contain" />
                                    ) : result.type === 'video' ? (
                                        <video src={getMediaUrl(result.url)} controls autoPlay loop className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-6 w-full h-full justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                                            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${audioPlaying ? 'bg-[#00FF88] scale-110 shadow-[0_0_50px_rgba(0,255,136,0.4)]' : 'bg-white/5 border border-white/10'}`}>
                                                <button
                                                    onClick={() => {
                                                        if (audioRef.current) {
                                                            if (audioPlaying) audioRef.current.pause();
                                                            else audioRef.current.play().catch(() => toast.error("Browser blocked playback or file not loaded"));
                                                        }
                                                    }}
                                                    className={`transition-colors ${audioPlaying ? 'text-black' : 'text-white hover:text-[#00FF88]'}`}
                                                >
                                                    {audioPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                                                </button>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-white font-bold text-xl uppercase tracking-widest tracking-tighter">Audio Result Generated</h3>
                                                <p className="text-gray-400 text-sm italic max-w-sm px-4">"{result.prompt}"</p>
                                            </div>

                                            {/* Visualizer Placeholder */}
                                            <div className="flex items-end gap-1 h-8">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                    <div
                                                        key={i}
                                                        className={`w-1 bg-[#00FF88] rounded-full transition-all duration-300 ${audioPlaying ? 'animate-pulse' : 'opacity-20'}`}
                                                        style={{ height: audioPlaying ? `${Math.random() * 100}%` : '20%', animationDelay: `${i * 0.1}s` }}
                                                    />
                                                ))}
                                            </div>

                                            <audio
                                                ref={audioRef}
                                                src={getMediaUrl(result.url)}
                                                onPlay={() => setAudioPlaying(true)}
                                                onPause={() => setAudioPlaying(false)}
                                                onEnded={() => setAudioPlaying(false)}
                                                className="hidden"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleDownload}
                                        className="h-12 px-6 bg-[#1A1A1A] border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={handleSaveToAssets}
                                        disabled={!!result.assetId}
                                        className={`h-12 px-8 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#00FF88]/20 ${result.assetId ? 'bg-white/5 border border-white/10 text-gray-500' : 'bg-[#00FF88] text-black hover:scale-105'}`}
                                    >
                                        {result.assetId ? <Check className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                                        {result.assetId ? 'Saved to Library' : 'Save to Library'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggestions Section - Separate */}
                    <div className="max-w-4xl mx-auto pt-12">
                        <div className="flex justify-center gap-2 mb-8 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${activeCategory === cat
                                        ? 'bg-white text-black border-white'
                                        : 'bg-[#141414] text-gray-500 border-white/10 hover:border-[#00FF88]/40 hover:text-[#00FF88]'
                                        }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => {
                                        setPrompt(suggestion.text);
                                        setGenerationMode(suggestion.mode as any);
                                    }}
                                    className="dashboard-card bg-[#141414] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-[#1A1A1A] group text-left transition-all hover:border-[#00FF88]/20 shadow-lg"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${suggestion.mode === 'video' ? 'bg-purple-500/10 text-purple-400' : suggestion.mode === 'voice' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                            <suggestion.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{suggestion.category}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-white mb-2">{suggestion.label}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-400">{suggestion.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GSAPTransition>
        </div>
    );
};

export default DashboardPage;
