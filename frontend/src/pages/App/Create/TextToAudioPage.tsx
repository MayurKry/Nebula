import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Music,
    Loader2,
    RotateCw, Download,
    Volume2, Play, Pause,
    Share2, Layers, Disc, Wand2
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

const languages = [
    { name: 'English (US)', code: 'en-US' },
    { name: 'English (UK)', code: 'en-GB' },
    { name: 'English (Australia)', code: 'en-AU' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Italian', code: 'it' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Chinese (Mandarin)', code: 'zh' },
    { name: 'Korean', code: 'ko' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Russian', code: 'ru' },
    { name: 'Turkish', code: 'tr' },
    { name: 'Dutch', code: 'nl' },
    { name: 'Polish', code: 'pl' },
    { name: 'Swedish', code: 'sv' },
    { name: 'Danish', code: 'da' },
    { name: 'Finnish', code: 'fi' },
    { name: 'Norwegian', code: 'no' },
    { name: 'Greek', code: 'el' },
    { name: 'Czech', code: 'cs' },
    { name: 'Hungarian', code: 'hu' },
    { name: 'Romanian', code: 'ro' },
    { name: 'Bulgarian', code: 'bg' },
    { name: 'Indonesian', code: 'id' },
    { name: 'Malay', code: 'ms' },
    { name: 'Thai', code: 'th' },
    { name: 'Vietnamese', code: 'vi' }
];

const voices = [
    { name: 'Leslie (Professional)', id: 'Leslie' },
    { name: 'Neutral (Balanced)', id: 'Neutral' },
    { name: 'Messenger (Narrative)', id: 'Messenger' },
    { name: 'Aria (Expressive)', id: 'Aria' },
    { name: 'Ben (Deep)', id: 'Ben' },
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
    const location = useLocation();

    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Epic Hybrid');
    const [duration, setDuration] = useState('30s');
    const [language, setLanguage] = useState(languages[0]);
    const [voice, setVoice] = useState(voices[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [results, setResults] = useState<AudioResult[]>([]);
    const [activeAudio, setActiveAudio] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.initialPrompt) {
            setPrompt(location.state.initialPrompt);
        }
    }, [location.state]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            // Step 1: Start real generation
            const result = await aiService.generateAudio({
                prompt: prompt, // Send ONLY the clean prompt now
                voiceId: voice.id
            });

            // Step 2: Polling for status
            let status = result.status;
            let audioUrl = '';
            let attempts = 0;
            const maxAttempts = 30; // 60 seconds

            while (status === 'processing' && attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 2000));
                const statusRes = await aiService.checkAudioStatus(result.jobId);
                status = statusRes.status;
                audioUrl = statusRes.audioUrl || '';
                attempts++;
            }

            if (status === 'succeeded' && audioUrl) {
                const newResult: AudioResult = {
                    id: result.jobId,
                    url: audioUrl,
                    title: prompt.substring(0, 30) + '...',
                    duration: duration,
                    style: style,
                };

                setResults([newResult, ...results]);
                toast.success('Audio generated successfully!');

                // Track in global queue system
                addJob({
                    type: 'audio' as any,
                    prompt: prompt,
                    settings: { style, voiceId: voice.id, language: language.code },
                });
            } else {
                throw new Error("Generation timed out or failed on provider");
            }
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

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'generated-audio.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Download started");
        } catch (e) {
            console.error("Download failed:", e);
            toast.error("Failed to download audio");
        }
    };

    const handleShare = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleAddToStudio = () => {
        toast.info("Adding to Studio... This feature will be available in the next release.");
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 flex flex-col items-center relative overflow-hidden">
            <main className="w-full max-w-5xl z-10 flex flex-col items-center">

                {/* Header */}
                <GSAPTransition animation="fade-in-up" className="text-center space-y-4 pt-12 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-4">
                        <Music className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Nebula Audio 2.0</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Text to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Audio</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Transform your descriptions into high-fidelity music tracks, cinematic soundscapes, or sound effects.
                    </p>
                </GSAPTransition>

                {/* Control Grid (Visible Controls) */}
                <div className="w-full relative z-20">
                    <div className="bg-[#141414] border border-white/5 p-1 rounded-2xl flex flex-wrap items-center justify-center gap-2 md:inline-flex md:left-1/2 md:relative md:-translate-x-1/2 mb-6 shadow-2xl">

                        {/* Model Selector */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-xl cursor-not-allowed opacity-50 border border-transparent">
                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                <Music className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Model</span>
                                <span className="text-xs font-semibold text-gray-300">Nebula Audio 2.0</span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Duration Selector */}
                        <div className="flex items-center gap-2">
                            {['15s', '30s', '60s'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${duration === d
                                        ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                                        : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Style Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-gray-500 border-transparent hover:text-white hover:bg-white/5 min-w-[140px]">
                                <Disc className="w-3.5 h-3.5" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Musical Style</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{style}</span>
                                </div>
                            </button>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                            >
                                {audioStyles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Language Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-gray-500 border-transparent hover:text-white hover:bg-white/5 min-w-[120px]">
                                <Volume2 className="w-3.5 h-3.5" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Language</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[80px]">{language.name}</span>
                                </div>
                            </button>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={language.code}
                                onChange={(e) => {
                                    const selected = languages.find(l => l.code === e.target.value);
                                    if (selected) setLanguage(selected);
                                }}
                            >
                                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                            </select>
                        </div>

                        <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />

                        {/* Voice Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-gray-500 border-transparent hover:text-white hover:bg-white/5 min-w-[140px]">
                                <Wand2 className="w-3.5 h-3.5" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Character Voice</span>
                                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{voice.name}</span>
                                </div>
                            </button>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={voice.name} // Use name as unique identifier for UI state
                                onChange={(e) => {
                                    const selected = voices.find(v => v.name === e.target.value);
                                    if (selected) setVoice(selected);
                                }}
                            >
                                {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Prompt Section */}
                <GSAPTransition animation="fade-in-up" delay={0.2} className="w-full max-w-4xl mb-16">
                    <div className="relative group mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[28px] blur-lg group-hover:blur-xl transition-all opacity-50 group-hover:opacity-100 duration-1000" />
                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            onEnhance={handleEnhance}
                            isGenerating={isGenerating}
                            isEnhancing={isEnhancing}
                            placeholder="Describe the sound or music track you want to create..."
                            settings={{ style, duration }}
                            onSettingsChange={() => { }}
                            hideAspectRatio={true}
                        />
                    </div>

                    {/* Prompt Pills / Suggestions (Outside Glow) */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 px-4">
                        {[
                            { label: 'Cinematic Thriller', onClick: () => setPrompt('A tense cinematic thriller track with deep bass and high-pitched violins'), icon: <Volume2 className="w-3 h-3" /> },
                            { label: 'Cyberpunk Chase', onClick: () => setPrompt('Aggressive dark synthwave for a high-speed chase in a futuristic city'), icon: <Volume2 className="w-3 h-3" /> },
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
                </GSAPTransition>

                {/* Loading State */}
                {isGenerating && (
                    <div className="w-full px-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-[#141414] border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 animate-pulse">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-white font-bold text-lg">Composing Audio</h3>
                                <p className="text-gray-500 text-sm">Generating waveforms and mastering track...</p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Results Section */}
                {results.length > 0 && !isGenerating && (
                    <GSAPTransition animation="scale-in" className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-4 pb-20">
                        {results.map((audio) => (
                            <div key={audio.id} className="group bg-[#141414] border border-white/5 hover:border-purple-500/30 rounded-[2rem] p-6 transition-all hover:shadow-2xl hover:shadow-purple-500/5 cursor-pointer">
                                <div className="flex items-center gap-6">
                                    {/* Play Button */}
                                    <button
                                        onClick={() => togglePlay(audio.id)}
                                        className={`w - 14 h - 14 rounded - 2xl flex items - center justify - center hover: scale - 105 transition - transform shadow - lg ${activeAudio === audio.id ? 'bg-purple-500 text-white' : 'bg-white text-black'} `}
                                    >
                                        {activeAudio === audio.id ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                                                {audio.title}
                                            </h3>
                                            <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">{audio.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                                                {audio.style}
                                            </span>
                                            {activeAudio === audio.id && (
                                                <div className="flex items-center gap-0.5 h-3 items-end">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className={`w - 0.5 bg - purple - 400 rounded - full animate - wave - sm`} style={{ animationDelay: `${i * 0.1} s`, height: `${Math.random() * 12 + 4} px` }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(audio.url, `nebula - audio - ${audio.id}.mp3`)}
                                            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleAddToStudio}
                                            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Add to Studio"
                                        >
                                            <Layers className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleShare(audio.url)}
                                            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Share"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPrompt(audio.title.replace('...', ''));
                                            handleGenerate();
                                        }}
                                        className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold flex items-center gap-2"
                                    >
                                        <RotateCw className="w-3.5 h-3.5" />
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </GSAPTransition>
                )}

            </main>
        </div>
    );
};

export default TextToAudioPage;
