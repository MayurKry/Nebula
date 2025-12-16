import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Sparkles, Loader2, Image as ImageIcon, RotateCw, Folder,
    Wand2, Download, Upload, Lock, Zap, AlertCircle, X, Check
} from 'lucide-react';
import { useGeneration, SAMPLE_IMAGES } from '@/components/generation/GenerationContext';
import { AdvancedPanel, StyleSelector, AspectRatioSelector, SeedToggle } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';

// Models Definition
const ACTIONS = [
    { id: 'nebula-fast', name: 'Nebula Fast', type: 'Free', description: 'Standard quality, fast generation' },
    { id: 'sdxl', name: 'Stable Diffusion XL', type: 'Pro', description: 'High fidelity, realistic details' },
    { id: 'dalle-3', name: 'DALL-E 3', type: 'Pro', description: 'Best for complex prompt adherence' },
    { id: 'midjourney-v6', name: 'Midjourney v6', type: 'Pro', description: 'Artistic excellence and creativity' },
    { id: 'flux-schnell', name: 'Flux Schnell', type: 'Free', description: 'Fastest generation, good quality' },
];

const INSPIRATION_PROMPTS = [
    "A cyberpunk street food vendor in Tokyo, neon lights, rain reflections, 8k",
    "Portrait of a warrior princess with golden armor, intricate details, cinematic lighting",
    "A floating island with waterfalls in the sky, fantasy art, dreamlike",
    "Minimalist line art logo of a fox, vector style, white background"
];

const IMAGE_STYLES = [
    'Cinematic', 'Photorealistic', 'Anime', '3D Render', 'Oil Painting',
    'Watercolor', 'Cyberpunk', 'Steampunk', 'Minimalist', 'Surreal'
];

const TextToImagePage = () => {
    const { addJob, jobs, queueVisible, setQueueVisible } = useGeneration();
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [prompt, setPrompt] = useState(location.state?.prompt || '');
    const [selectedModel, setSelectedModel] = useState('nebula-fast');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
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

    // UI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedResult, setSelectedResult] = useState<string | null>(null);

    // Handlers
    const handleModelSelect = (modelId: string, type: string) => {
        if (type === 'Pro') {
            // In a real app, check if user is pro. For now, simulate upgrade prompt.
            if (!window.confirm("This is a Pro model. Would you like to upgrade to access it?")) {
                return;
            }
            navigate('/pricing');
            return;
        }
        setSelectedModel(modelId);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File too large. Please upload an image under 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setReferenceImage(reader.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEnhancePrompt = () => {
        if (!prompt) return;
        setIsGenerating(true); // Simulate "Thinking"
        setTimeout(() => {
            setPrompt(prev => `Highly detailed 8k masterpiece, cinematic lighting, dramatic atmosphere, ${prev}, trending on artstation, unreal engine 5 render`);
            setIsGenerating(false);
        }, 1000);
    };

    const handleGenerate = async () => {
        setError(null);
        if (!prompt.trim()) {
            setError("Please enter a prompt to start generating.");
            return;
        }

        setIsGenerating(true);
        setResults([]);

        try {
            // Add job to queue (simulated backend call)
            addJob({
                type: 'text-to-image',
                prompt,
                settings: {
                    model: selectedModel,
                    style,
                    aspectRatio,
                    seed: seedEnabled ? seed : undefined,
                    referenceImage,
                    ...advancedSettings,
                },
            });

            // Simulate generation latency
            await new Promise(resolve => setTimeout(resolve, 4000));

            // Randomly succeed or fail (mostly succeed)
            if (Math.random() < 0.05) {
                throw new Error("Generation failed due to high server load. Please try again.");
            }

            setResults(SAMPLE_IMAGES.slice(0, 4)); // Show 4 samples
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <main className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                        Text to Image
                    </h1>
                    <p className="text-gray-400">Transform your words into stunning visuals with AI.</p>
                </div>

                {/* Main Prompter Area - Antigravity Style */}
                <div className="max-w-3xl mx-auto mb-8 relative z-10">

                    {/* Error Toast */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                            <button onClick={() => setError(null)}><X className="w-4 h-4 text-gray-400 hover:text-white" /></button>
                        </div>
                    )}

                    {/* Input Container */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 focus-within:ring-[#00FF88]/50 transition-all">

                        {/* Text Area */}
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe what you want to see..."
                                className={`w-full bg-[#1A1A1A] text-white placeholder-gray-500 p-4 min-h-[140px] resize-none outline-none text-lg ${referenceImage ? 'pb-24' : ''}`}
                                style={{ background: 'transparent' }}
                            />

                            {/* Reference Image Preview */}
                            {referenceImage && (
                                <div className="absolute bottom-4 left-4 group">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                                        <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setReferenceImage(null)}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Toolbar */}
                        <div className="bg-[#111111] px-4 py-3 flex items-center justify-between border-t border-white/5">
                            <div className="flex items-center gap-2">
                                {/* Upload Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors tooltip"
                                    title="Upload Reference Image"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />

                                {/* Model Selector Dropdown Trigger (Simplified for this view) */}
                                <div className="h-6 w-px bg-white/10 mx-2" />
                                <div className="flex gap-2">
                                    {ACTIONS.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => handleModelSelect(model.id, model.type)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${selectedModel === model.id
                                                ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                                                : model.type === 'Pro'
                                                    ? 'border-white/5 text-gray-500 hover:border-purple-500/50 hover:text-purple-400'
                                                    : 'border-white/10 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {model.name}
                                            {model.type === 'Pro' && <Lock className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Enhance Button */}
                                <button
                                    onClick={handleEnhancePrompt}
                                    disabled={!prompt || isGenerating}
                                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Auto-Enhance Prompt"
                                >
                                    <Wand2 className="w-5 h-5" />
                                </button>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || isGenerating}
                                    className="px-6 py-2 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00CC6A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inspiration Pills */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {INSPIRATION_PROMPTS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => setPrompt(p)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all truncate max-w-[200px]"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Settings & Queue Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Controls */}
                    <div className="space-y-6">
                        <div className="bg-[#141414] border border-white/10 rounded-xl p-5">
                            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Settings</h3>
                            <div className="space-y-4">
                                <StyleSelector
                                    styles={IMAGE_STYLES}
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

                        <AdvancedPanel
                            settings={advancedSettings}
                            onChange={setAdvancedSettings}
                        />
                    </div>

                    {/* Right: Results Display */}
                    <div className="lg:col-span-2">
                        {results.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                                {results.map((url, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedResult(url)}
                                        className="group relative aspect-video bg-[#141414] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#00FF88]/50 transition-all"
                                    >
                                        <img src={url} alt={`Result ${i}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button className="p-2 bg-white/10 backdrop-blur rounded-lg text-white hover:bg-white/20"><Download className="w-5 h-5" /></button>
                                            <button className="p-2 bg-white/10 backdrop-blur rounded-lg text-white hover:bg-white/20"><Wand2 className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isGenerating ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                                <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p>Generated images will appear here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="aspect-video bg-[#141414] rounded-xl animate-pulse border border-white/5" />
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Generation Queue Drawer/Overlay */}
                <GenerationQueue />

                {/* Modal Viewer */}
                {selectedResult && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setSelectedResult(null)}>
                        <img src={selectedResult} alt="Full view" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    </div>
                )}

            </main>
        </div>
    );
};

export default TextToImagePage;
