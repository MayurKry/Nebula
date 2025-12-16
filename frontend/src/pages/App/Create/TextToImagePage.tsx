import { useState } from 'react';
import {
    Sparkles,
    Loader2, Image as ImageIcon,
    RotateCw, Folder, Wand2, Download, Grid3X3
} from 'lucide-react';
import { useGeneration, SAMPLE_IMAGES } from '@/components/generation/GenerationContext';
import { AdvancedPanel, StyleSelector, AspectRatioSelector, SeedToggle } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';

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
    const [advancedSettings, setAdvancedSettings] = useState({
        cameraAngle: 'Eye Level',
        depth: 50,
        fidelity: 80,
        colorTemperature: 50,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [selectedResult, setSelectedResult] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setResults([]);

        // Add job to queue
        addJob({
            type: 'text-to-image',
            prompt,
            settings: {
                style,
                aspectRatio,
                seed: seedEnabled ? seed : undefined,
                ...advancedSettings,
            },
        });

        // Simulate generation
        await new Promise(resolve => setTimeout(resolve, 6000));

        // Show sample results
        setResults(SAMPLE_IMAGES.slice(0, 6));
        setIsGenerating(false);
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



    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all`}>
                {/* Prompt Section */}
                <section className="mb-8">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you want to create in detail... (e.g., 'A majestic dragon flying over a crystal castle at sunset, cinematic lighting, volumetric fog, 8K quality')"
                            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[120px] text-lg"
                        />

                        {/* Controls Row */}
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
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

                    {/* Advanced Options */}
                    <div className="mt-4">
                        <AdvancedPanel
                            settings={advancedSettings}
                            onChange={setAdvancedSettings}
                        />
                    </div>
                </section>

                {/* Generate Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="px-8 py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0A0A0A] font-bold text-lg rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg shadow-[#00FF88]/20"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Images
                            </>
                        )}
                    </button>
                </div>

                {/* Loading State */}
                {isGenerating && (
                    <section className="mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-[#141414] border border-white/10 rounded-xl overflow-hidden"
                                >
                                    <div className="w-full h-full bg-gradient-to-r from-[#141414] via-[#1F1F1F] to-[#141414] animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-gray-400">✨ Creating your images...</p>
                            <p className="text-xs text-gray-500 mt-1">This usually takes 5-10 seconds</p>
                        </div>
                    </section>
                )}

                {/* Results Grid */}
                {results.length > 0 && !isGenerating && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Generated Images</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRegenerate}
                                    className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                                >
                                    <RotateCw className="w-4 h-4" />
                                    Regenerate
                                </button>
                                <button
                                    onClick={handleSaveToAssets}
                                    className="px-4 py-2 bg-[#00FF88] text-[#0A0A0A] font-medium text-sm rounded-lg hover:bg-[#00FF88]/90 transition-all flex items-center gap-2"
                                >
                                    <Folder className="w-4 h-4" />
                                    Save to Assets
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {results.map((url, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedResult(url)}
                                    className="group relative aspect-square bg-[#141414] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#00FF88]/30 transition-all"
                                >
                                    <img
                                        src={url}
                                        alt={`Generated ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEnhance(url);
                                            }}
                                            className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                                        >
                                            <Wand2 className="w-4 h-4 inline mr-1" />
                                            Enhance
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alert('Downloading image...');
                                            }}
                                            className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-xs text-white">
                                        {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!isGenerating && results.length === 0 && (
                    <section className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Create Stunning Images</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Enter a detailed prompt above and click Generate to create AI-powered images with Nebula.
                        </p>
                    </section>
                )}
            </main>

            {/* Image Viewer Modal */}
            {selectedResult && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedResult(null)}
                >
                    <div className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedResult}
                            alt="Selected"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                        />
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                                onClick={() => alert('Downloading...')}
                                className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={() => handleEnhance(selectedResult)}
                                className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
                            >
                                <Wand2 className="w-4 h-4" />
                                Enhance
                            </button>
                            <button
                                onClick={() => alert('Creating variations...')}
                                className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
                            >
                                <Grid3X3 className="w-4 h-4" />
                                Variations
                            </button>
                            <button
                                onClick={handleSaveToAssets}
                                className="px-4 py-2 bg-[#00FF88] text-[#0A0A0A] font-medium text-sm rounded-lg hover:bg-[#00FF88]/90 transition-all flex items-center gap-2"
                            >
                                <Folder className="w-4 h-4" />
                                Save
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
