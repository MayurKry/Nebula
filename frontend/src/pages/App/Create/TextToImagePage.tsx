import { useState } from 'react';
import {
    Sparkles,
    Loader2,
    RotateCw, Folder, Wand2, Download, Grid3X3
} from 'lucide-react';
import { useGeneration } from '@/components/generation/GenerationContext';
import { StyleSelector, AspectRatioSelector, SeedToggle } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';
import { aiService } from '@/services/ai.service';
import { toast } from 'sonner';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';

const imageStyles = [
    'Cinematic', 'Photorealistic', 'Anime', '3D Render', 'Oil Painting',
    'Watercolor', 'Digital Art', 'Concept Art', 'Minimalist', 'Surreal'
];

const TextToImagePage = () => {
    const { addJob } = useGeneration();

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [seedEnabled, setSeedEnabled] = useState(false);
    const [seed, setSeed] = useState(42);

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [selectedResult, setSelectedResult] = useState<string | null>(null);
    const [usedProvider, setUsedProvider] = useState<string | null>(null);

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

            // Generate 2 images using the AI service
            const images = await aiService.generateImages(
                {
                    prompt,
                    style,
                    aspectRatio,
                    seed: seedEnabled ? seed : undefined,
                },
                2
            );

            // Extract URLs from the response and track provider
            const imageUrls = images.map(img => img.url);
            setResults(imageUrls);

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
        alert('Images saved to Asset Library!');
    };

    const handleEnhance = (_imageUrl: string) => {
        alert(`Enhancing image... This feature will upscale and improve quality.`);
    };

    const handleRegenerate = () => {
        setResults([]);
        handleGenerate();
    };

    const handleDownload = async (imageUrl: string, index?: number) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `nebula-image-${index !== undefined ? index + 1 : Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Image downloaded successfully!');
        } catch (error) {
            console.error('Error downloading image:', error);
            toast.error('Failed to download image. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-6xl mx-auto space-y-12 transition-all">

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4 pt-4 mb-4">
                        <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-2">
                            <Sparkles className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Image</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Transform your words into photorealistic masterpieces, cinematic art, or abstract concepts with Nebula's AI.
                        </p>
                    </div>
                </GSAPTransition>

                {/* Prompt Section */}
                <GSAPTransition animation="fade-in-up" delay={0.1}>
                    <div className="space-y-6">
                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            placeholder="Describe the image you want to create in detail..."
                            actions={[
                                { label: 'Cinematic Sunset', onClick: () => setPrompt('A majestic dragon flying over a crystal castle at sunset, cinematic lighting, 8K'), icon: <Sparkles className="w-3 h-3" /> },
                                { label: 'Abstract Glass', onClick: () => setPrompt('3D render of abstract glass shapes with iridescent lighting, 8k resolution'), icon: <Grid3X3 className="w-3 h-3" /> },
                                { label: 'Future Warrior', onClick: () => setPrompt('Portrait of a futuristic warrior with glowing armor, intricate details'), icon: <Sparkles className="w-3 h-3" /> },
                            ]}
                        />

                        {/* Quick Settings Row */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <StyleSelector
                                styles={imageStyles}
                                selected={style}
                                onSelect={setStyle}
                            />
                            <AspectRatioSelector
                                selected={aspectRatio}
                                onSelect={setAspectRatio}
                            />
                            <SeedToggle
                                enabled={seedEnabled}
                                seed={seed}
                                onToggle={setSeedEnabled}
                                onSeedChange={setSeed}
                            />
                        </div>
                    </div>
                </GSAPTransition>


                {/* Loading State */}
                {isGenerating && (
                    <section className="mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-video bg-[#141414] border border-white/5 rounded-3xl overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <p className="text-gray-400 font-medium">✨ Creating your images with Gemini...</p>
                            <p className="text-xs text-gray-500 mt-1">This usually takes 5-10 seconds</p>
                        </div>
                    </section>
                )}

                {/* Results Grid */}
                {results.length > 0 && !isGenerating && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">Generated Art</h2>
                                {usedProvider && (
                                    <span className="px-3 py-1 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-full text-[#00FF88] text-[10px] font-black uppercase tracking-widest">
                                        Powered by {usedProvider}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRegenerate}
                                    className="px-5 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-gray-400 text-sm font-bold hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                                >
                                    <RotateCw className="w-4 h-4" />
                                    Regenerate
                                </button>
                                <button
                                    onClick={handleSaveToAssets}
                                    className="px-5 py-2 bg-[#00FF88] text-[#0A0A0A] font-bold text-sm rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-[#00FF88]/20"
                                >
                                    <Folder className="w-4 h-4" />
                                    Save to Library
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {results.map((url, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedResult(url)}
                                    className="group relative aspect-video bg-[#141414] border border-white/5 rounded-[32px] overflow-hidden cursor-pointer hover:border-[#00FF88]/40 transition-all shadow-2xl"
                                >
                                    <img
                                        src={url}
                                        alt={`Generated ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEnhance(url);
                                            }}
                                            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/20 transition-all"
                                        >
                                            <Wand2 className="w-4 h-4 inline mr-2" />
                                            Enhance
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(url, i);
                                            }}
                                            className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                        Variant {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            {/* Image Viewer Modal */}
            {selectedResult && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedResult(null)}
                >
                    <div className="max-w-6xl w-full space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="relative group">
                            <img
                                src={selectedResult}
                                alt="Selected"
                                className="w-full h-auto max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10"
                            />
                            <button
                                onClick={() => setSelectedResult(null)}
                                className="absolute -top-4 -right-4 p-3 bg-white text-black rounded-2xl shadow-xl hover:scale-110 transition-transform"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => handleDownload(selectedResult)}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                                <Download className="w-5 h-5" />
                                Download
                            </button>
                            <button
                                onClick={() => handleEnhance(selectedResult)}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                                <Wand2 className="w-5 h-5 text-blue-400" />
                                Upscale
                            </button>
                            <button
                                onClick={() => alert('Creating variations...')}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                                <Grid3X3 className="w-5 h-5 text-purple-400" />
                                Variations
                            </button>
                            <button
                                onClick={handleSaveToAssets}
                                className="px-8 py-3 bg-[#00FF88] text-[#0A0A0A] font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-[#00FF88]/20"
                            >
                                <Folder className="w-5 h-5" />
                                SAVE TO LIBRARY
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
function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    );
}
