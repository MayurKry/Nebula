import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Sparkles,
    Loader2,
    RotateCw, Folder, Wand2, Download, Palette, Ratio, Box, X
} from 'lucide-react';
import { useGeneration } from '@/components/generation/GenerationContext';
import GenerationQueue from '@/components/generation/GenerationQueue';
import { aiService } from '@/services/ai.service';
import { assetService } from '@/services/asset.service';
import { toast } from 'sonner';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';

const imageStyles = [
    'Cinematic', 'Photorealistic', 'Anime', '3D Render', 'Oil Painting',
    'Watercolor', 'Digital Art', 'Concept Art', 'Minimalist', 'Surreal'
];

const TextToImagePage = () => {
    const { addJob } = useGeneration();
    const location = useLocation();

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [seedEnabled, setSeedEnabled] = useState(false);
    const [seed] = useState(42);

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<{ url: string; assetId?: string }[]>([]);
    const [selectedResult, setSelectedResult] = useState<{ url: string; assetId?: string } | null>(null);

    // Handle initial prompt from dashboard
    useEffect(() => {
        if (location.state?.initialPrompt) {
            setPrompt(location.state.initialPrompt);
            // Optional: auto-generate
            // triggerGenerate(location.state.initialPrompt);
        }
    }, [location.state]);
    const [usedProvider, setUsedProvider] = useState<string | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setResults([]);
        setUsedProvider(null);

        try {
            // Add job to queue
            addJob({
                type: 'text-to-image',
                prompt,
                settings: {
                    style,
                    aspectRatio,
                    seed: seedEnabled ? seed : undefined,
                },
            });

            // Combine prompt and style for generation
            const finalPrompt = style && style !== 'None' ? `${prompt}, ${style} style` : prompt;

            // Generate 2 images using the AI service
            const images = await aiService.generateImages(
                {
                    prompt: finalPrompt,
                    style,
                    aspectRatio,
                    seed: seedEnabled ? seed : undefined,
                },
                1
            );

            // Extract data from the response
            const newResults = images.map(img => ({ url: img.url, assetId: img.assetId }));
            setResults(newResults);

            // Set the provider used (from first image)
            if (images.length > 0 && images[0].provider) {
                setUsedProvider(images[0].provider);
                toast.success(`Images generated successfully using ${images[0].provider}!`);
            } else {
                toast.success('Images generated successfully!');
            }
        } catch (error) {
            console.error('Error generating images:', error);
            toast.error('Failed to generate images. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveToAssets = () => {
        toast.success('Images saved to Asset Library!');
    };

    const handleEnhance = async (imageUrl?: string) => {
        setIsEnhancing(true);
        // Simulate enhancement
        await new Promise(r => setTimeout(r, 1500));
        setIsEnhancing(false);
        if (imageUrl) {
            toast.success("Image Upscaled to 4K!");
        } else {
            // Prompt enhancement logic
            const enhancements = ["highly detailed", "8k resolution", "cinematic lighting", "photorealistic"];
            const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
            if (!prompt.includes(randomEnhancement)) {
                setPrompt(prev => `${prev}, ${randomEnhancement}`);
                toast.success("Prompt enhanced!");
            }
        }
    };

    const handleRegenerate = () => {
        setResults([]);
        handleGenerate();
    };

    const handleDownload = async (imageUrl: string, assetId?: string) => {
        try {
            toast.info('Preparing image for download...');
            let blob;
            if (assetId) {
                blob = await assetService.downloadAsset(assetId);
            } else {
                const response = await fetch(imageUrl);
                blob = await response.blob();
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `nebula-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Image downloaded successfully!');
        } catch (error) {
            console.error('Error downloading image:', error);
            window.open(imageUrl, '_blank');
            toast.error('Download failed, opening in new tab.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 flex flex-col items-center relative overflow-hidden">
            <main className="w-full max-w-5xl z-10 flex flex-col items-center">

                {/* Header Section */}
                <GSAPTransition animation="fade-in-up" className="text-center space-y-4 pt-12 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full mb-4">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Nebula Imagine 2.0</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">create?</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Transform your words into photorealistic masterpieces with our simplified engine.
                    </p>
                </GSAPTransition>

                {/* Control Grid (Visible Controls) */}
                <div className="w-full relative z-20">
                    <div className="bg-[#141414] border border-white/5 p-1 rounded-2xl flex flex-wrap items-center justify-center gap-2 md:inline-flex md:left-1/2 md:relative md:-translate-x-1/2 mb-6 shadow-2xl">

                        {/* Model Selector */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-xl cursor-not-allowed opacity-50 border border-transparent">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Model</span>
                                <span className="text-xs font-semibold text-gray-300">Nebula Imagine 2.0</span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Aspect Ratio Selector */}
                        <div className="flex items-center gap-1">
                            {['16:9', '4:3', '1:1', '9:16'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setAspectRatio(r)}
                                    className={`px-3 py-2 rounded-lg transition-all border flex items-center gap-2 ${aspectRatio === r
                                        ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                                        : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Ratio className={`w-3.5 h-3.5 ${r === '9:16' ? 'rotate-90' : r === '4:3' ? 'rotate-0 scale-x-75' : ''}`} />
                                    <span className="text-xs font-bold">{r}</span>
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Style Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-gray-500 border-transparent hover:text-white hover:bg-white/5 min-w-[120px]">
                                <Palette className="w-3.5 h-3.5" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Style</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[80px]">{style}</span>
                                </div>
                            </button>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                            >
                                {imageStyles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Seed Toggle */}
                        <button
                            onClick={() => setSeedEnabled(!seedEnabled)}
                            className={`p-2 rounded-lg transition-all border ${seedEnabled
                                ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                                : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'
                                }`}
                            title={seedEnabled ? 'Fixed Seed (42)' : 'Random Seed'}
                        >
                            <Box className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Input Field */}
                <GSAPTransition animation="fade-in-up" delay={0.2} className="w-full max-w-4xl relative group mb-16">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[28px] blur-lg group-hover:blur-xl transition-all opacity-50 group-hover:opacity-100 duration-1000" />
                    <PromptBar
                        value={prompt}
                        onChange={setPrompt}
                        onGenerate={handleGenerate}
                        onEnhance={() => handleEnhance()}
                        isGenerating={isGenerating}
                        isEnhancing={isEnhancing}
                        placeholder="Describe your imagination..."
                        settings={{ style, aspectRatio }}
                        onSettingsChange={() => { }} // Handled by top styling
                    />
                </GSAPTransition>

                {/* Results Section */}
                {results.length > 0 && !isGenerating && (
                    <GSAPTransition animation="scale-in" className="w-full">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                Generated Art
                                {usedProvider && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">{usedProvider}</span>}
                            </h2>
                            <button
                                onClick={handleRegenerate}
                                className="px-4 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-gray-400 text-xs font-bold hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                                Regenerate
                            </button>
                        </div>

                        <div className="grid grid-cols-1 max-w-2xl mx-auto gap-8 px-4 pb-20">
                            {results.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedResult(img)}
                                    className="group relative aspect-video bg-[#141414] border border-white/5 rounded-[2rem] overflow-hidden cursor-pointer hover:border-blue-500/40 transition-all shadow-2xl"
                                >
                                    <img
                                        src={img.url}
                                        alt={`Generated ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEnhance(img.url);
                                            }}
                                            className="h-10 px-4 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                                        >
                                            <Wand2 className="w-3.5 h-3.5" />
                                            Upscale
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(img.url, img.assetId);
                                            }}
                                            className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GSAPTransition>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <div className="w-full px-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 max-w-2xl mx-auto gap-8">
                            {[...Array(1)].map((_, i) => (
                                <div key={i} className="aspect-video bg-[#141414] border border-white/5 rounded-[2rem] overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dreaming...</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Image Viewer Modal */}
            {selectedResult && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedResult(null)}
                >
                    <div className="max-w-6xl w-full flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
                        <div className="relative group w-full flex justify-center">
                            <img
                                id="preview-image"
                                src={selectedResult.url}
                                alt="Selected"
                                className="w-auto h-auto max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                            />
                            <button
                                onClick={() => setSelectedResult(null)}
                                className="absolute -top-4 -right-4 p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleDownload(selectedResult.url, selectedResult.assetId)}
                                className="h-12 px-6 bg-[#1A1A1A] border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PNG
                            </button>
                            <button
                                onClick={() => handleSaveToAssets()}
                                className="h-12 px-8 bg-[#00FF88] text-black font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-[#00FF88]/20"
                            >
                                <Folder className="w-4 h-4" />
                                Save to Assets
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue Sidebar */}
            <GenerationQueue />
        </div>
    );
};

export default TextToImagePage;
