import {
    Video, Image, Mic, Mic2,
    Wand2, X, Download, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { aiService, type GenerateImageResponse } from '@/services/ai.service';
import GenerationGame from '@/components/game/GenerationGame';
import PromptBar from '@/components/ui/PromptBar';

const DashboardPage = () => {
    useAuth();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [generationMode, setGenerationMode] = useState<'image' | 'video' | 'voice'>('video');
    const [selectedModel] = useState('Nebula Turbo');

    // Generation States
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<GenerateImageResponse | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
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
        setIsGenerating(true);

        try {
            if (generationMode === 'video') {
                const result = await aiService.generateVideoProject({
                    prompt: prompt,
                    style: selectedModel.toLowerCase().includes('turbo') ? 'cinematic' : 'documentary',
                    duration: 5
                });
                navigate(`/app/editor/${result.projectId}`);
            } else if (generationMode === 'voice') {
                navigate('/app/create/ai-voices');
            } else {
                const result = await aiService.generateImage({
                    prompt: prompt,
                    style: 'cinematic',
                    width: 1024,
                    height: 576,
                    aspectRatio: "16:9"
                });
                setGeneratedImage(result);
                setShowImageModal(true);
            }
        } catch (error: any) {
            console.error("Generation failed:", error);
            alert("Failed to start generation. Please try again.");
        } finally {
            setIsGenerating(false);
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

            {/* Image Result Modal */}
            {showImageModal && generatedImage && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row shadow-2xl relative max-h-[90vh] overflow-y-auto md:overflow-visible">
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="md:w-2/3 bg-black flex items-center justify-center p-2 min-h-[300px]">
                            <img src={generatedImage.url} alt="Generated" className="max-h-[50vh] md:max-h-[80vh] w-auto object-contain rounded-lg" />
                        </div>
                        <div className="md:w-1/3 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                    Creation Ready
                                </h3>
                                <p className="text-sm text-gray-400 italic">"{generatedImage.prompt}"</p>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-white/5 rounded">16:9</span>
                                    <span className="px-2 py-1 bg-white/5 rounded">Cinematic</span>
                                </div>
                            </div>

                            <div className="space-y-3 mt-6 md:mt-0">
                                <button className="w-full py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC6A] flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> Download
                                </button>
                                <button className="w-full py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 flex items-center justify-center gap-2">
                                    <Video className="w-4 h-4" /> Animate this Image
                                </button>
                                <button className="w-full py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 flex items-center justify-center gap-2">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <GSAPTransition animation="fade-in-up" duration={1}>
                <div className="text-center space-y-12 sm:space-y-16 py-8 sm:py-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Prompt. Direct. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">Render.</span>
                        </h1>
                        <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto italic">Transform your raw ideas into cinematic video projects with AI-driven choreography.</p>
                    </div>

                    <div className="max-w-3xl mx-auto relative group">
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

                        <PromptBar
                            value={prompt}
                            onChange={setPrompt}
                            onGenerate={handleGenerate}
                            onEnhance={handleEnhancePrompt}
                            isGenerating={isGenerating}
                            isEnhancing={isEnhancing}
                            placeholder={`State your vision for this ${generationMode === 'voice' ? 'voiceover' : generationMode}...`}
                            actions={[
                                { label: 'Sci-Fi Epic', onClick: () => setPrompt('A high-octane cinematic trailer for a sci-fi epic, massive space stations and neon cities, volumetric lighting'), icon: <Video className="w-3 h-3" /> },
                                { label: 'British Narrator', onClick: () => { setPrompt('A deep professional British voice with a calm and wise tone'); setGenerationMode('voice'); }, icon: <Mic2 className="w-3 h-3" /> },
                                { label: 'Macro Product', onClick: () => setPrompt('An elegant product showcase for a luxury watch, smooth macro shots, soft bokeh, 8k photorealistic'), icon: <Wand2 className="w-3 h-3" /> },
                            ]}
                        />
                    </div>

                    {/* Suggestions Section */}
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
                                        setGenerationMode(suggestion.mode as 'image' | 'video');
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
