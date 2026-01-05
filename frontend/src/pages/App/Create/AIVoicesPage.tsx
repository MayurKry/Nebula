import { useState } from 'react';
import {
    Mic2, Play, Pause,
    RotateCw, Sliders, Search,
    Plus, Check,
    Volume2, Sparkles
} from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

interface Voice {
    id: string;
    name: string;
    tags: string[];
    previewUrl: string;
    gender: 'male' | 'female' | 'non-binary';
    usage: string;
}

const SAMPLE_VOICES: Voice[] = [
    { id: '1', name: 'Rachel', tags: ['American', 'Narrative', 'Soft'], previewUrl: '#', gender: 'female', usage: 'Popular for audiobooks' },
    { id: '2', name: 'Adam', tags: ['American', 'Deep', 'Professional'], previewUrl: '#', gender: 'male', usage: 'Best for news/commercials' },
    { id: '3', name: 'Domi', tags: ['British', 'Strong', 'Confident'], previewUrl: '#', gender: 'female', usage: 'Excellent for presentations' },
    { id: '4', name: 'Antoni', tags: ['American', 'Well-rounded', 'Young'], previewUrl: '#', gender: 'male', usage: 'Great for YouTube content' },
    { id: '5', name: 'Bella', tags: ['Italian', 'Warm', 'Expressive'], previewUrl: '#', gender: 'female', usage: 'Best for storytelling' },
    { id: '6', name: 'Marcus', tags: ['British', 'Mature', 'Wise'], previewUrl: '#', gender: 'male', usage: 'Authoritative narrative voice' },
];

const AIVoicesPage = () => {
    const [text, setText] = useState('');
    const [selectedVoiceId, setSelectedVoiceId] = useState('1');
    const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // ElevenLabs Style Settings
    const [settings, setSettings] = useState({
        stability: 50,
        similarity: 75,
        styleExaggeration: 0,
        speakerBoost: true
    });

    const handleGenerate = async () => {
        if (!text.trim()) {
            toast.error('Please enter some text to generate speech');
            return;
        }
        setIsGenerating(true);
        // Mock generation
        await new Promise(r => setTimeout(r, 3000));
        setIsGenerating(false);
        toast.success('Speech generated with ElevenLabs engine!');
    };

    const togglePreview = (id: string) => {
        setActivePreviewId(activePreviewId === id ? null : id);
    };

    const selectedVoice = SAMPLE_VOICES.find(v => v.id === selectedVoiceId);

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Mic2 className="w-6 h-6 text-purple-400" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Speech Synthesis</h1>
                            </div>
                            <p className="text-gray-500 text-sm">Powered by ElevenLabs v2 Turbo Engine</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-[#141414] border border-white/5 rounded-xl text-gray-400 text-sm font-bold hover:text-white transition-all flex items-center gap-2">
                                <RotateCw className="w-4 h-4" />
                                History
                            </button>
                            <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
                                <Plus className="w-4 h-4" />
                                Custom Voice
                            </button>
                        </div>
                    </div>
                </GSAPTransition>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input & Settings */}
                    <div className="lg:col-span-8 space-y-6">
                        <GSAPTransition animation="fade-in-up" delay={0.1}>
                            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-6 shadow-2xl space-y-6">
                                {/* Voice Selector Dropdown (Mini) */}
                                <div className="flex items-center justify-between gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-purple-500/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
                                            <span className="text-lg font-bold text-white">{selectedVoice?.name[0]}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{selectedVoice?.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
                                                {selectedVoice?.tags.join(' • ')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => togglePreview(selectedVoiceId)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                    >
                                        {activePreviewId === selectedVoiceId ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                                    </button>
                                </div>

                                {/* Text Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                                        <span>Text Input</span>
                                        <span>{text.length} / 5000 characters</span>
                                    </div>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Type or paste the text you want the AI to speak..."
                                        className="w-full h-64 bg-black/20 border border-white/5 rounded-[24px] p-6 text-white text-lg leading-relaxed focus:outline-none focus:border-purple-500/40 transition-all resize-none custom-scrollbar"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button className="p-3 bg-black/40 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                        </button>
                                        <p className="text-xs text-gray-500 italic">ElevenLabs v2 Multilingual</p>
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className={`px-8 py-3 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-3 shadow-xl ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RotateCw className="w-5 h-5 animate-spin" />
                                                SYNTHESIZING...
                                            </>
                                        ) : (
                                            <>
                                                <Volume2 className="w-5 h-5" />
                                                GENERATE SPEECH
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </GSAPTransition>

                        {/* Settings Panel */}
                        <GSAPTransition animation="fade-in-up" delay={0.2}>
                            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <Sliders className="w-5 h-5 text-gray-500" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Voice Settings</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Stability */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stability</label>
                                            <span className="text-[11px] font-mono text-purple-400">{settings.stability}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={settings.stability}
                                            onChange={(e) => setSettings({ ...settings, stability: parseInt(e.target.value) })}
                                            className="w-full accent-purple-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-gray-600 font-bold uppercase">
                                            <span>Variable</span>
                                            <span>Stable</span>
                                        </div>
                                    </div>

                                    {/* Similarity */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Clarity + Similarity</label>
                                            <span className="text-[11px] font-mono text-purple-400">{settings.similarity}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={settings.similarity}
                                            onChange={(e) => setSettings({ ...settings, similarity: parseInt(e.target.value) })}
                                            className="w-full accent-purple-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-gray-600 font-bold uppercase">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GSAPTransition>
                    </div>

                    {/* Right: Voice Discovery */}
                    <div className="lg:col-span-4 space-y-6 h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar">
                        <GSAPTransition animation="fade-in-up" delay={0.3}>
                            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-6 space-y-6 sticky top-0">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search voices..."
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Library</p>
                                    <div className="space-y-2">
                                        {SAMPLE_VOICES.map((voice) => (
                                            <div
                                                key={voice.id}
                                                onClick={() => setSelectedVoiceId(voice.id)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedVoiceId === voice.id ? 'bg-purple-500/10 border-purple-500/40' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${selectedVoiceId === voice.id ? 'bg-purple-500/20 border-purple-500/20' : 'bg-white/5 border-white/5'}`}>
                                                            {selectedVoiceId === voice.id && <Check className="w-4 h-4 text-purple-400" />}
                                                            {selectedVoiceId !== voice.id && <span className="text-xs font-bold text-gray-500">{voice.name[0]}</span>}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-bold ${selectedVoiceId === voice.id ? 'text-white' : 'text-gray-400'}`}>{voice.name}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                {voice.tags.slice(0, 2).map(tag => (
                                                                    <span key={tag} className="text-[8px] font-black text-gray-600 uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded italic">{tag}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); togglePreview(voice.id); }}
                                                        className={`p-2 rounded-lg transition-all ${activePreviewId === voice.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}
                                                    >
                                                        {activePreviewId === voice.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GSAPTransition>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIVoicesPage;
