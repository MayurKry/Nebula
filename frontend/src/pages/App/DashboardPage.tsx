import {
    Video, Image, Mic, Mic2,
    Wand2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { aiService } from '@/services/ai.service';
import GenerationGame from '@/components/game/GenerationGame';
import PromptBar from '@/components/ui/PromptBar';

const DashboardPage = () => {
    useAuth();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [generationMode, setGenerationMode] = useState<'image' | 'video' | 'voice'>('video');

    // Generation States
    const [isGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Subtle hover animation for cards globally within this container
        const cards = gsap.utils.toArray('.dashboard-card');
        cards.forEach((card: any) => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -4, scale: 1.02, duration: 0.3, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.inOut' });
            });
        });
    }, { scope: container });

    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) return;

        setIsEnhancing(true);
        try {
            const result = await aiService.enhancePrompt(prompt);
            setPrompt(result.enhanced);
        } catch (error) {
            console.error('Prompt enhancement failed:', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // Instead of generating here, we navigate to the appropriate tool page
        // with the prompt pre-filled. This is more stable and provides a better UX.
        if (generationMode === 'video') {
            navigate('/app/create/text-to-video', { state: { initialPrompt: prompt } });
        } else if (generationMode === 'voice') {
            navigate('/app/create/text-to-audio', { state: { initialPrompt: prompt } });
        } else {
            navigate('/app/create/text-to-image', { state: { initialPrompt: prompt } });
        }
    };

    // Mock Suggestions Data
    const suggestions = [
        { id: 1, mode: 'video', category: 'Cinematic', label: 'Cyberpunk Detective', text: 'A cyberpunk detective walking through rainy neon streets, investigating a mystery', icon: Video },
        { id: 2, mode: 'voice', category: 'Narrative', label: 'Audiobook Narration', text: 'A soothing but authoritative professional voice for a thriller audiobook', icon: Mic2 },
        { id: 3, mode: 'image', category: '3D Render', label: 'Abstract Glass', text: '3D render of abstract glass shapes with iridescent lighting, 8k resolution', icon: Image },
        { id: 4, mode: 'video', category: 'Nature', label: 'Drone Landscape', text: 'Aerial drone shot of a majestic waterfall in Iceland, mossy rocks, 4k', icon: Video },
        { id: 5, mode: 'voice', category: 'Marketing', label: 'Commercial Tagline', text: 'Excited energetic voice-over for a high-performance sports brand holiday sale', icon: Mic },
    ];

    const categories = ['All', 'Cinematic', 'Marketing', '3D Render', 'Narrative', 'Nature'];
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredSuggestions = suggestions.filter(s => activeCategory === 'All' || s.category === activeCategory);

    return (
        <div ref={container} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">

            {/* Inline Generation Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl h-[400px]">
                        <GenerationGame />
                        <p className="text-center text-gray-500 mt-4 text-xs">Generating your masterpiece...</p>
                    </div>
                </div>
            )}

            {/* Dashboard Hero */}
            <GSAPTransition animation="fade-in-up" duration={1}>
                <div className="text-center space-y-12 sm:space-y-16 py-8 sm:py-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Prompt. Direct. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">Render.</span>
                        </h1>
                        <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto italic">Transform your raw ideas into cinematic video projects with AI-driven choreography.</p>
                    </div>

                    <div className="max-w-3xl mx-auto relative">
                        {/* Mode Toggle Tabs */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-[#141414] border border-white/10 p-1 rounded-full inline-flex relative shadow-xl">
                                <button
                                    onClick={() => setGenerationMode('video')}
                                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'video' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Video className="w-4 h-4" />
                                    <span>Video</span>
                                </button>
                                <button
                                    onClick={() => setGenerationMode('image')}
                                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'image' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Image className="w-4 h-4" />
                                    <span>Image</span>
                                </button>
                                <button
                                    onClick={() => setGenerationMode('voice')}
                                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'voice' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Mic2 className="w-4 h-4" />
                                    <span>Voice</span>
                                </button>

                                {/* Sliding Background */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-[#00FF88] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${generationMode === 'video' ? 'left-1' : generationMode === 'image' ? 'left-[calc(33.33%+2px)]' : 'left-[calc(66.66%+2px)]'}`}
                                />
                            </div>
                        </div>

                        {/* Glowing Shadow Wrapper - Only for Prompt */}
                        <div className="relative group mb-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-[#00FF88]/20 to-blue-500/20 rounded-[28px] blur-lg group-hover:blur-xl transition-all opacity-50 group-hover:opacity-100 duration-1000" />
                            <PromptBar
                                value={prompt}
                                onChange={setPrompt}
                                onGenerate={handleGenerate}
                                onEnhance={handleEnhancePrompt}
                                onFileSelect={(file) => alert(`Selected file for ${generationMode}: ${file.name}`)}
                                settings={{ quality: 'Pro', aspectRatio: '16:9' }}
                                onSettingsChange={() => { }}
                                isGenerating={isGenerating}
                                isEnhancing={isEnhancing}
                                placeholder={`State your vision for this ${generationMode === 'voice' ? 'voiceover' : generationMode}...`}
                            />
                        </div>

                        {/* Prompt Pills / Suggestions (Outside Glow) */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 px-4 mb-4">
                            {[
                                { label: 'Sci-Fi Epic', onClick: () => setPrompt('A high-octane cinematic trailer for a sci-fi epic, massive space stations and neon cities, volumetric lighting'), icon: <Video className="w-3 h-3" /> },
                                { label: 'British Narrator', onClick: () => { setPrompt('A deep professional British voice with a calm and wise tone'); setGenerationMode('voice'); }, icon: <Mic2 className="w-3 h-3" /> },
                                { label: 'Macro Product', onClick: () => setPrompt('An elegant product showcase for a luxury watch, smooth macro shots, soft bokeh, 8k photorealistic'), icon: <Wand2 className="w-3 h-3" /> },
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
                    </div>

                    {/* Suggestions Section - Separate */}
                    <div className="max-w-4xl mx-auto pt-12">
                        <div className="flex justify-center gap-2 mb-8 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${activeCategory === cat
                                        ? 'bg-white text-black border-white'
                                        : 'bg-[#141414] text-gray-500 border-white/10 hover:border-[#00FF88]/40 hover:text-[#00FF88]'
                                        }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => {
                                        setPrompt(suggestion.text);
                                        setGenerationMode(suggestion.mode as any);
                                    }}
                                    className="dashboard-card bg-[#141414] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-[#1A1A1A] group text-left transition-all hover:border-[#00FF88]/20 shadow-lg"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${suggestion.mode === 'video' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <suggestion.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{suggestion.category}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-white mb-2">{suggestion.label}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-400">{suggestion.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GSAPTransition>
        </div>
    );
};

export default DashboardPage;
