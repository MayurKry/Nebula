import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Sparkles, Download, Folder, RotateCw, Play,
    Loader2, Video, Upload, Camera, Layers, Film, Wand2
} from 'lucide-react';
import { useGeneration, SAMPLE_VIDEO_THUMBS } from '@/components/generation/GenerationContext';
import { AdvancedPanel, StyleSelector } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';

const videoStyles = [
    'Cinematic', 'Documentary', 'Surreal', 'Anime', 'Photorealistic',
    'Noir', 'Vintage', 'Sci-Fi', 'Fantasy', 'Minimalist'
];

const cameraPaths = [
    'Static', 'Slow Pan', 'Zoom In', 'Zoom Out', 'Orbit', 'Dolly', 'Drone Shot', 'Handheld'
];

const durations = [
    { value: 3, label: '3 seconds' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
];

const TextToVideoPage = () => {
    const { addJob, queueVisible, setQueueVisible, jobs } = useGeneration();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [cameraPath, setCameraPath] = useState('Slow Pan');
    const [duration, setDuration] = useState(5);
    const [motionLevel, setMotionLevel] = useState(50);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [advancedSettings, setAdvancedSettings] = useState({
        cameraAngle: 'Eye Level',
        depth: 50,
        fidelity: 80,
        colorTemperature: 50,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [results, setResults] = useState<{ thumbnail: string; url: string }[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGenerationProgress(0);
        setResults([]);

        // Add job to queue
        addJob({
            type: 'text-to-video',
            prompt,
            settings: {
                style,
                cameraPath,
                duration,
                motionLevel,
                referenceImage: referenceImage || undefined,
                ...advancedSettings,
            },
        });

        // Simulate progressive generation
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);

        await new Promise(resolve => setTimeout(resolve, 10000));

        clearInterval(progressInterval);
        setGenerationProgress(100);

        // Show sample results
        setResults([
            { thumbnail: SAMPLE_VIDEO_THUMBS[0], url: '#video1' },
            { thumbnail: SAMPLE_VIDEO_THUMBS[1], url: '#video2' },
        ]);
        setIsGenerating(false);
    };

    const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setReferenceImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const renderingCount = jobs.filter(j => j.status === 'rendering').length;

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/app/dashboard" className="p-2 text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <Video className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold text-white">Text → Video</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/app/create/text-to-image" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                                Text → Image
                            </Link>
                            <Link to="/app/create/image-to-video" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                                Image → Video
                            </Link>
                            <button
                                onClick={() => setQueueVisible(true)}
                                className="relative px-3 py-1.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white transition-colors"
                            >
                                <Layers className="w-4 h-4 inline mr-2" />
                                Queue
                                {renderingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00FF88] rounded-full text-[10px] text-[#0A0A0A] font-bold flex items-center justify-center">
                                        {renderingCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all ${queueVisible ? 'mr-80' : ''}`}>
                {/* Prompt Section */}
                <section className="mb-6">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video scene you want to create... (e.g., 'A majestic eagle soaring over snow-capped mountains at sunrise, cinematic slow motion, volumetric clouds')"
                            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[100px] text-lg"
                        />
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
                        <label className="block text-sm text-gray-400 mb-2">Duration</label>
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
                                    {d.value}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reference Image */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-2">Reference Image (Optional)</label>
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

                {/* Motion Level Slider */}
                <section className="mb-6">
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm text-gray-400">Motion Level</label>
                            <span className="text-sm text-[#00FF88]">{motionLevel}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">Low</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={motionLevel}
                                onChange={(e) => setMotionLevel(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#00FF88]"
                            />
                            <span className="text-xs text-gray-500">High</span>
                        </div>
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
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg shadow-purple-500/20"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Video...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Video
                            </>
                        )}
                    </button>
                </div>

                {/* Rendering Progress */}
                {isGenerating && (
                    <section className="mb-8">
                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Rendering video...</h3>
                                    <p className="text-xs text-gray-500">Frames: {Math.round(generationProgress * duration * 24 / 100)} / {duration * 24}</p>
                                </div>
                            </div>

                            {/* Timeline Preview */}
                            <div className="h-24 bg-[#0A0A0A] rounded-lg overflow-hidden mb-4 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse"
                                    style={{ width: `${generationProgress}%` }}
                                />
                                {/* Frame markers */}
                                <div className="absolute inset-0 flex">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 border-r border-white/5 ${i * 10 < generationProgress ? 'bg-purple-500/10' : ''}`}
                                        />
                                    ))}
                                </div>
                                <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                                    Rendering frames... {generationProgress.toFixed(0)}%
                                </div>
                            </div>

                            <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-300"
                                    style={{ width: `${generationProgress}%` }}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Results */}
                {results.length > 0 && !isGenerating && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Generated Videos</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setResults([]); handleGenerate(); }}
                                    className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white flex items-center gap-2"
                                >
                                    <RotateCw className="w-4 h-4" />
                                    Regenerate
                                </button>
                                <button className="px-4 py-2 bg-[#00FF88] text-[#0A0A0A] font-medium text-sm rounded-lg flex items-center gap-2">
                                    <Folder className="w-4 h-4" />
                                    Save to Assets
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((video, i) => (
                                <div key={i} className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden group hover:border-[#00FF88]/30 transition-all">
                                    <div className="aspect-video relative">
                                        <img src={video.thumbnail} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <button className="w-16 h-16 rounded-full bg-[#00FF88] flex items-center justify-center hover:scale-110 transition-transform">
                                                <Play className="w-8 h-8 text-[#0A0A0A] ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                                            {duration}s
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{style}</span>
                                            <span className="text-xs text-gray-500">{cameraPath}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Enhance">
                                                <Wand2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Download">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!isGenerating && results.length === 0 && (
                    <section className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                            <Video className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Create Stunning Videos</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Describe your video scene above and let AI generate cinematic clips with Nebula.
                        </p>
                    </section>
                )}
            </main>

            <GenerationQueue />
        </div>
    );
};

export default TextToVideoPage;
