import { useState, useRef } from 'react';
import {
    Sparkles,
    Loader2, Upload, Move, Wind, ZoomIn, Eye,
    Layers, RotateCw, Folder, Play, Download
} from 'lucide-react';
import { useGeneration, SAMPLE_IMAGES, SAMPLE_VIDEO_THUMBS } from '@/components/generation/GenerationContext';
import { AdvancedPanel } from '@/components/generation/AdvancedControls';
import GenerationQueue from '@/components/generation/GenerationQueue';

const sceneEffects = [
    { id: 'wind', label: 'Wind', icon: Wind },
    { id: 'parallax', label: 'Parallax', icon: Layers },
    { id: 'zoom', label: 'Ken Burns', icon: ZoomIn },
    { id: 'ambient', label: 'Ambience', icon: Eye },
];

const cameraMoves = [
    { id: 'static', label: 'Static' },
    { id: 'zoom-in', label: 'Zoom In' },
    { id: 'zoom-out', label: 'Zoom Out' },
    { id: 'pan-left', label: 'Pan Left' },
    { id: 'pan-right', label: 'Pan Right' },
    { id: 'orbit', label: 'Orbit' },
];

const ImageToVideoPage = () => {
    const { addJob, jobs } = useGeneration();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [selectedSample, setSelectedSample] = useState<number | null>(null);
    const [motionDynamics, setMotionDynamics] = useState(50);
    const [cameraMove, setCameraMove] = useState('zoom-in');
    const [sceneEffect, setSceneEffect] = useState('parallax');
    const [motionFidelity, setMotionFidelity] = useState(70);
    const [advancedSettings, setAdvancedSettings] = useState({
        cameraAngle: 'Eye Level',
        depth: 50,
        fidelity: 80,
        colorTemperature: 50,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [results, setResults] = useState<{ thumbnail: string; url: string }[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSourceImage(reader.result as string);
                setSelectedSample(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectSample = (index: number) => {
        setSelectedSample(index);
        setSourceImage(SAMPLE_IMAGES[index]);
    };

    const handleGenerate = async () => {
        if (!sourceImage) return;

        setIsGenerating(true);
        setGenerationProgress(0);
        setResults([]);

        addJob({
            type: 'image-to-video',
            prompt: `Animate image with ${sceneEffect} effect, ${cameraMove} camera`,
            settings: {
                motionLevel: motionDynamics,
                cameraPath: cameraMove,
                ...advancedSettings,
            },
        });

        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1.2;
            });
        }, 100);

        await new Promise(resolve => setTimeout(resolve, 8000));

        clearInterval(progressInterval);
        setGenerationProgress(100);

        setResults([
            { thumbnail: SAMPLE_VIDEO_THUMBS[2], url: '#video1' },
            { thumbnail: SAMPLE_VIDEO_THUMBS[3], url: '#video2' },
            { thumbnail: SAMPLE_VIDEO_THUMBS[0], url: '#video3' },
        ]);
        setIsGenerating(false);
    };



    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all`}>
                {/* Source Image Selection */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Select Source Image</h2>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Upload Area */}
                        <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {sourceImage && !selectedSample ? (
                                <div className="relative group">
                                    <img
                                        src={sourceImage}
                                        alt="Source"
                                        className="w-full aspect-video object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-white text-sm"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-video border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:border-[#00FF88]/50 transition-colors"
                                >
                                    <Upload className="w-10 h-10 text-gray-500 mb-3" />
                                    <p className="text-gray-400 font-medium">Upload Image</p>
                                    <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 10MB</p>
                                </button>
                            )}
                        </div>

                        {/* Sample Images */}
                        <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-3">Or choose from samples:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {SAMPLE_IMAGES.slice(0, 6).map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectSample(i)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedSample === i ? 'border-[#00FF88]' : 'border-transparent hover:border-white/30'
                                            }`}
                                    >
                                        <img src={img} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Motion Controls */}
                <section className="mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Motion Settings</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Motion Dynamics */}
                        <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm text-gray-400">Motion Dynamics</label>
                                <span className="text-sm text-[#00FF88]">{motionDynamics}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={motionDynamics}
                                onChange={(e) => setMotionDynamics(parseInt(e.target.value))}
                                className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#00FF88]"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-600">Subtle</span>
                                <span className="text-xs text-gray-600">Dramatic</span>
                            </div>
                        </div>

                        {/* Motion Fidelity */}
                        <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm text-gray-400">Motion Fidelity</label>
                                <span className="text-sm text-[#00FF88]">{motionFidelity}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={motionFidelity}
                                onChange={(e) => setMotionFidelity(parseInt(e.target.value))}
                                className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#00FF88]"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-600">Fast</span>
                                <span className="text-xs text-gray-600">Quality</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Camera & Effects */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Camera Movement */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-3">Camera Movement</label>
                        <div className="grid grid-cols-3 gap-2">
                            {cameraMoves.map(cam => (
                                <button
                                    key={cam.id}
                                    onClick={() => setCameraMove(cam.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${cameraMove === cam.id
                                        ? 'bg-[#00FF88] text-[#0A0A0A] font-medium'
                                        : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {cam.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scene Effects */}
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-3">Scene Effect</label>
                        <div className="grid grid-cols-2 gap-2">
                            {sceneEffects.map(effect => (
                                <button
                                    key={effect.id}
                                    onClick={() => setSceneEffect(effect.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${sceneEffect === effect.id
                                        ? 'bg-[#00FF88] text-[#0A0A0A] font-medium'
                                        : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <effect.icon className="w-4 h-4" />
                                    {effect.label}
                                </button>
                            ))}
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
                        disabled={!sourceImage || isGenerating}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg shadow-orange-500/20"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Animating Image...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Animate Image
                            </>
                        )}
                    </button>
                </div>

                {/* Progress */}
                {isGenerating && (
                    <section className="mb-8">
                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Creating motion...</h3>
                                    <p className="text-xs text-gray-500">Analyzing depth and generating frames</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="aspect-video bg-[#0A0A0A] rounded-lg overflow-hidden">
                                        {i * 33 < generationProgress ? (
                                            <div className="w-full h-full bg-gradient-to-r from-orange-500/30 to-red-500/30 animate-pulse" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1A1A1A]" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300"
                                    style={{ width: `${Math.min(generationProgress, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">{Math.min(Math.round(generationProgress), 100)}% complete</p>
                        </div>
                    </section>
                )}

                {/* Results */}
                {results.length > 0 && !isGenerating && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Animated Videos</h2>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {results.map((video, i) => (
                                <div key={i} className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden group hover:border-[#00FF88]/30 transition-all">
                                    <div className="aspect-video relative">
                                        <img src={video.thumbnail} alt={`Animated ${i + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-14 h-14 rounded-full bg-[#00FF88] flex items-center justify-center hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-[#0A0A0A] ml-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Variation {i + 1}</span>
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
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
                {!isGenerating && results.length === 0 && !sourceImage && (
                    <section className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
                            <Move className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Bring Images to Life</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Upload or select an image above to animate it with AI-powered motion effects.
                        </p>
                    </section>
                )}
            </main>

            <GenerationQueue />
        </div>
    );
};

export default ImageToVideoPage;
