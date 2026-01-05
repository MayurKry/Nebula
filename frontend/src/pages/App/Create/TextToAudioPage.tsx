import { useState } from 'react';
import {
    Music,
    Loader2,
    RotateCw, Download,
    Volume2, Play, Pause,
    Share2, Layers
} from 'lucide-react';
import { useGeneration } from '@/components/generation/GenerationContext';
import { aiService } from '@/services/ai.service';
import { toast } from 'sonner';
import PromptBar from '@/components/ui/PromptBar';
import GSAPTransition from '@/components/ui/GSAPTransition';

const audioStyles = [
    'Cinematic Orchestral', 'Cyberpunk Synth', 'Lo-Fi Chill',
    'Epic Hybrid', 'Ambient Space', 'Fast Action',
    'Horror Suspense', 'Cheerful Pop', 'Acoustic Folk'
];

interface AudioResult {
    id: string;
    url: string;
    title: string;
    duration: string;
    style: string;
    isPlaying?: boolean;
}

const TextToAudioPage = () => {
    const { addJob } = useGeneration();

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Epic Hybrid');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [results, setResults] = useState<AudioResult[]>([]);
    const [activeAudio, setActiveAudio] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            // Add job to queue
            addJob({
                type: 'text-to-video', // Reusing video type for queue as audio is new
                prompt: `[Audio] ${prompt}`,
                settings: { style },
            });

            // Mocking audio generation for now
            await new Promise(resolve => setTimeout(resolve, 3000));

            const newResult: AudioResult = {
                id: Math.random().toString(36).substr(2, 9),
                url: '#',
                title: prompt.substring(0, 30) + '...',
                duration: '0:30',
                style: style,
            };

            setResults([newResult, ...results]);
            toast.success('Audio generated successfully!');
        } catch (error) {
            console.error('Error generating audio:', error);
            toast.error('Failed to generate audio. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEnhance = async () => {
        if (!prompt.trim()) return;
        setIsEnhancing(true);
        try {
            const res = await aiService.enhancePrompt(prompt);
            setPrompt(res.enhanced);
            toast.success('Prompt enhanced!');
        } catch (err) {
            toast.error('Failed to enhance prompt');
        } finally {
            setIsEnhancing(false);
        }
    };

    const togglePlay = (id: string) => {
        setActiveAudio(activeAudio === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4 pt-8">
                        <div className="inline-flex p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-2">
                            <Music className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Audio</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Transform your descriptions into high-fidelity music tracks, cinematic soundscapes, or sound effects.
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
                            onEnhance={handleEnhance}
                            isGenerating={isGenerating}
                            isEnhancing={isEnhancing}
                            placeholder="Describe the sound or music track you want to create..."
                            actions={[
                                { label: 'Cinematic Thriller', onClick: () => setPrompt('A tense cinematic thriller track with deep bass and high-pitched violins'), icon: <Volume2 className="w-3 h-3" /> },
                                { label: 'Lo-Fi Study', onClick: () => setPrompt('Chill lo-fi beats with a rainy background and muffled piano'), icon: <Music className="w-3 h-3" /> },
                                { label: 'Cyberpunk Chase', onClick: () => setPrompt('Aggressive dark synthwave for a high-speed chase in a futuristic city'), icon: <Volume2 className="w-3 h-3" /> },
                            ]}
                        />

                        {/* Quick Style Select */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {audioStyles.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${style === s
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                        : 'bg-[#141414] text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </GSAPTransition>

                {/* Results Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    {isGenerating && (
                        <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-white/5 rounded w-3/4" />
                                <div className="h-3 bg-white/5 rounded w-1/2" />
                            </div>
                        </div>
                    )}

                    {results.map((audio, idx) => (
                        <GSAPTransition key={audio.id} animation="fade-in-up" delay={idx * 0.1}>
                            <div className="group bg-[#141414] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all hover:shadow-2xl">
                                <div className="flex items-center gap-6">
                                    {/* Play Button */}
                                    <button
                                        onClick={() => togglePlay(audio.id)}
                                        className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                                    >
                                        {activeAudio === audio.id ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                                                {audio.title}
                                            </h3>
                                            <span className="text-[10px] text-gray-500 font-mono">{audio.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-purple-500/10">
                                                {audio.style}
                                            </span>
                                            {activeAudio === audio.id && (
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className={`w-0.5 bg-purple-400 rounded-full animate-wave-sm`} style={{ animationDelay: `${i * 0.15}s`, height: `${Math.random() * 12 + 4}px` }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Download">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Add to Studio">
                                            <Layers className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Share">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Regenerate">
                                        <RotateCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </GSAPTransition>
                    ))}
                </div>

            </main>
        </div>
    );
};

export default TextToAudioPage;
