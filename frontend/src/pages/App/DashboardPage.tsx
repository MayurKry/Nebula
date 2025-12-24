import {
    Video, Image,
    ArrowRight,
    Paperclip, Wand2, X, Download, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { aiService, type GenerateImageResponse } from '@/services/ai.service';
import GenerationGame from '@/components/game/GenerationGame';

const DashboardPage = () => {
    useAuth();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [generationMode, setGenerationMode] = useState<'image' | 'video'>('video');
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
        if (!prompt.trim()) {
            alert('Please enter a prompt first');
            return;
        }

        setIsEnhancing(true);
        try {
            const result = await aiService.enhancePrompt(prompt);
            setPrompt(result.enhanced);
        } catch (error) {
            console.error('Prompt enhancement failed:', error);
            alert('Failed to enhance prompt. Please try again.');
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);

        try {
            if (generationMode === 'video') {
                // Video Mode: Generate Project & Nav to Editor
                const result = await aiService.generateVideoProject({
                    prompt: prompt,
                    style: selectedModel.toLowerCase().includes('turbo') ? 'cinematic' : 'documentary', // generic mapping
                    duration: 5
                });

                // Direct navigation to editor
                navigate(`/app/editor/${result.projectId}`);

            } else {
                // Image Mode: Generate Inline & Show Modal
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

            // Show specific error message based on error type
            const errorMessage = error.response?.status === 503
                ? "AI service is temporarily unavailable due to high demand. Please try again in a few moments."
                : error.response?.data?.data?.suggestion
                    ? error.response.data.data.suggestion
                    : "Failed to start generation. Please try again.";

            alert(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    // Mock Suggestions Data
    const suggestions = [
        { id: 1, mode: 'video', category: 'Cinematic', label: 'Cyberpunk Detective', text: 'A cyberpunk detective walking through rainy neon streets, investigating a mystery', icon: Video },
        { id: 2, mode: 'image', category: '3D Render', label: 'Abstract Glass', text: '3D render of abstract glass shapes with iridescent lighting, 8k resolution', icon: Image },
        { id: 3, mode: 'video', category: 'Nature', label: 'Drone Landscape', text: 'Aerial drone shot of a majestic waterfall in Iceland, mossy rocks, 4k', icon: Video },
        { id: 4, mode: 'image', category: 'Portrait', label: 'Future Warrior', text: 'Portrait of a futuristic warrior with glowing armor, intricate details', icon: Image },
    ];

    const categories = ['All', 'Cinematic', 'Marketing', '3D Render', 'Anime', 'Nature'];
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredSuggestions = suggestions.filter(s => activeCategory === 'All' || s.category === activeCategory);

    return (
        <div ref={container} className="p-8 max-w-7xl mx-auto space-y-12">

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
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="md:w-2/3 bg-black flex items-center justify-center p-2">
                            <img src={generatedImage.url} alt="Generated" className="max-h-[80vh] w-auto object-contain rounded-lg" />
                        </div>
                        <div className="md:w-1/3 p-6 flex flex-col justify-between border-l border-white/5">
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

                            <div className="space-y-3">
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
                <div className="text-center space-y-8 py-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        What will you create?
                    </h1>

                    <div className="max-w-3xl mx-auto relative group">
                        {/* Mode Toggle Tabs */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-[#141414] border border-white/10 p-1 rounded-full inline-flex relative">
                                <button
                                    onClick={() => setGenerationMode('video')}
                                    className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${generationMode === 'video' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Video className="w-4 h-4" />
                                    Text to Video
                                </button>
                                <button
                                    onClick={() => setGenerationMode('image')}
                                    className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${generationMode === 'image' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Image className="w-4 h-4" />
                                    Text to Image
                                </button>

                                {/* Sliding Background */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#00FF88] rounded-full transition-all duration-300 ease-out ${generationMode === 'video' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                                />
                            </div>
                        </div>

                        <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-col">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={`Describe your ${generationMode}... (e.g., '${generationMode === 'video' ? 'A cinematic drone shot of Mars' : 'A futuristic city concept art'}')`}
                                className="bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 min-h-[100px] resize-none w-full p-2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleGenerate();
                                    }
                                }}
                            />

                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Attach">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleEnhancePrompt}
                                        disabled={isEnhancing || !prompt.trim()}
                                        className="p-2 rounded-lg hover:bg-white/5 text-[#00FF88] hover:text-[#00FF88]/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Enhance Prompt with AI"
                                    >
                                        <Wand2 className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
                                        <span className="text-sm font-medium hidden sm:inline">
                                            {isEnhancing ? 'Enhancing...' : 'Enhance'}
                                        </span>
                                    </button>
                                </div>

                                <button
                                    className="px-6 py-2.5 bg-[#00FF88] hover:bg-[#00CC6A] text-[#0A0A0A] font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#00FF88]/20"
                                    onClick={handleGenerate}
                                >
                                    Generate {generationMode === 'video' ? 'Video' : 'Image'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center gap-2 mb-6 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === cat
                                        ? 'bg-white text-black border-white'
                                        : 'bg-[#141414] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {filteredSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => {
                                        setPrompt(suggestion.text);
                                        setGenerationMode(suggestion.mode as 'image' | 'video');
                                    }}
                                    className="dashboard-card bg-[#141414] border border-white/5 p-4 rounded-xl cursor-pointer hover:bg-[#1A1A1A] group text-left"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <suggestion.icon className={`w-4 h-4 ${suggestion.mode === 'video' ? 'text-purple-400' : 'text-blue-400'}`} />
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{suggestion.category}</span>
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white mb-1">{suggestion.label}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2group-hover:text-gray-400">{suggestion.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GSAPTransition>

            {/* Existing Sections (Recents, etc.) could go here, keeping it clean for now with just the main prompter as requested */}
        </div>
    );
};
export default DashboardPage;
