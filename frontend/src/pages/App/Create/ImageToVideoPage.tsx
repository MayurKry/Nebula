import { useState, useRef } from 'react';
import {
    Loader2, Upload, Move, Wind, ZoomIn, Eye,
    Layers, RotateCw, Folder, Play, Download,
    Camera
} from 'lucide-react';
import { useGeneration, SAMPLE_IMAGES, SAMPLE_VIDEO_THUMBS } from '@/components/generation/GenerationContext';
import GenerationQueue from '@/components/generation/GenerationQueue';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';

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
    const { addJob } = useGeneration();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [selectedSample, setSelectedSample] = useState<number | null>(null);
    const [motionDynamics] = useState(50);
    const [cameraMove, setCameraMove] = useState('zoom-in');
    const [sceneEffect, setSceneEffect] = useState('parallax');
    const [prompt, setPrompt] = useState('');


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
            prompt: prompt || `Animate image with ${sceneEffect} effect, ${cameraMove} camera`,
            settings: {
                motionLevel: motionDynamics,
                cameraPath: cameraMove,
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
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4 pt-4 mb-4">
                        <div className="inline-flex p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-2">
                            <Move className="w-8 h-8 text-orange-400" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Image to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Video</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Breathe life into static images with AI choreography. Describe the motion or use our cinematic presets.
                        </p>
                    </div>
                </GSAPTransition>

                {/* Source Selection & Prompt */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Source Image */}
                    <GSAPTransition animation="fade-in-up" delay={0.1} className="lg:col-span-5">
                        <div className="space-y-6">
                            <div className="bg-[#141414] border border-white/10 rounded-[32px] p-2 shadow-2xl overflow-hidden group">
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                                {sourceImage ? (
                                    <div className="relative aspect-video rounded-[24px] overflow-hidden">
                                        <img src={sourceImage} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl text-sm"
                                            >
                                                CHANGE IMAGE
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-video rounded-[24px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center hover:bg-white/5 hover:border-white/10 transition-all"
                                    >
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-white font-bold text-sm">UPLOAD IMAGE</p>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">DRAG & DROP</p>
                                    </button>
                                )}
                            </div>

                            <div className="bg-[#141414]/30 p-6 rounded-[32px] border border-white/5">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Or use a sample</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {SAMPLE_IMAGES.slice(0, 4).map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectSample(i)}
                                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedSample === i ? 'border-orange-500' : 'border-transparent hover:border-white/20'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GSAPTransition>

                    {/* Right: Motion Prompt & Settings */}
                    <GSAPTransition animation="fade-in-up" delay={0.2} className="lg:col-span-7 space-y-8">
                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            placeholder="Describe how parts of the image should move..."
                            actions={[
                                { label: 'Cinematic Pan', onClick: () => setPrompt('A slow cinematic pan across the landscape with volumetric fog moving'), icon: <Camera className="w-3 h-3" /> },
                                { label: 'Fluid Motion', onClick: () => setPrompt('Make the water flow realistically with subtle sunlight reflections'), icon: <Wind className="w-3 h-3" /> },
                            ]}
                        />

                        {/* Motion Presets */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                                <label className="block text-[10px] font-black text-gray-500 mb-4 uppercase tracking-widest">Camera Movement</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {cameraMoves.map(cam => (
                                        <button
                                            key={cam.id}
                                            onClick={() => setCameraMove(cam.id)}
                                            className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${cameraMove === cam.id
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-[#1A1A1A] text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {cam.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                                <label className="block text-[10px] font-black text-gray-500 mb-4 uppercase tracking-widest">Physics Quality</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {sceneEffects.map(effect => (
                                        <button
                                            key={effect.id}
                                            onClick={() => setSceneEffect(effect.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${sceneEffect === effect.id
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-[#1A1A1A] text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            <effect.icon className="w-3 h-3" />
                                            {effect.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </GSAPTransition>
                </div>

                {/* Progress Overlay */}
                {isGenerating && (
                    <div className="bg-[#141414] border border-white/10 rounded-[32px] p-8 overflow-hidden relative shadow-2xl">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">Animating with Physics</h3>
                                <p className="text-gray-500 text-sm">Analyzing optical flow and depth maps...</p>
                            </div>
                            <div className="ml-auto text-orange-500 font-mono text-2xl font-black">
                                {Math.round(generationProgress)}%
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="aspect-video bg-black/40 rounded-xl relative overflow-hidden">
                                    {generationProgress > (i * 30) && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {results.length > 0 && !isGenerating && (
                    <GSAPTransition animation="fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">Rendered Animations</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleGenerate}
                                    className="px-5 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-gray-400 text-sm font-bold hover:text-white flex items-center gap-2"
                                >
                                    <RotateCw className="w-4 h-4" /> REGENERATE
                                </button>
                                <button className="px-5 py-2.5 bg-[#00FF88] text-black font-bold text-sm rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                    <Folder className="w-4 h-4" /> SAVE TO ASSETS
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {results.map((video, i) => (
                                <div key={i} className="group bg-[#141414] border border-white/5 rounded-[32px] overflow-hidden hover:border-orange-500/40 transition-all shadow-2xl">
                                    <div className="aspect-video relative overflow-hidden">
                                        <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">MOTION CLIP {i + 1}</span>
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors"><Download className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GSAPTransition>
                )}
            </main>

            <GenerationQueue />
        </div>
    );
};

export default ImageToVideoPage;
