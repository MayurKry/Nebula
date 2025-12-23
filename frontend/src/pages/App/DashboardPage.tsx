import {
    Video, Image,
    ArrowRight, Clock, Star, Users,
    Paperclip, Wand2, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGeneration } from '@/components/generation/GenerationContext';
import { useState, useRef } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const DashboardPage = () => {
    useAuth();
    const navigate = useNavigate();
    const { jobs } = useGeneration();
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('Nebula Turbo');
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

    // Quick Actions
    const quickActions = [
        {
            id: 'text-to-video',
            name: 'Text to Video',
            icon: Video,
            description: 'Convert scripts to video',
            color: 'from-purple-500 to-pink-500',
            route: '/app/create/text-to-video'
        },
        {
            id: 'image-to-video',
            name: 'Image to Video',
            icon: Image,
            description: 'Animate static images',
            color: 'from-blue-500 to-cyan-500',
            route: '/app/create/image-to-video'
        },
        {
            id: 'text-to-image',
            name: 'Text to Image',
            icon: Image,
            description: 'Generate AI images',
            color: 'from-amber-500 to-orange-500',
            route: '/app/create/text-to-image'
        },
    ];

    const popularTools = [
        { id: 'avatar', name: 'Avatar Video', icon: Users, description: 'Create talking avatars', badge: 'Soon', route: '/app/tools/avatar' },
        // { id: 'voice', name: 'Voice Cloning', icon: Music, description: 'Clone your voice', badge: 'Soon', route: '/app/tools/voice' },
        // { id: 'enhance', name: 'Video Enhancer', icon: Star, description: 'Upscale & stabilize', badge: 'Soon', route: '/app/tools/enhance' },
    ];

    // Map jobs to generated videos format
    const generatedVideos = jobs.map(job => ({
        id: job.id,
        name: job.prompt,
        type: job.type === 'text-to-video' ? 'Video' : 'Image',
        date: job.createdAt.toLocaleDateString(), // simplified date
        status: job.status === 'rendering' ? 'processing' : job.status === 'completed' ? 'ready' : job.status,
        thumbnail: job.thumbnail || 'https://picsum.photos/seed/placeholder/300/200'
    }));

    // Mock Recent Projects (Fallback if no generated videos)
    const recentProjects = generatedVideos.length > 0 ? generatedVideos : [
        { id: '1', name: 'Cosmic Journey', type: 'Video', date: '2 mins ago', status: 'ready', thumbnail: 'https://picsum.photos/seed/1/300/200' },
        { id: '2', name: 'Product Showcase', type: 'Video', date: '2 hours ago', status: 'processing', thumbnail: 'https://picsum.photos/seed/2/300/200' },
        { id: '3', name: 'Nature Documentary', type: 'Video', date: '1 day ago', status: 'draft', thumbnail: 'https://picsum.photos/seed/3/300/200' },
    ];

    const handleToolClick = (route: string, badge?: string) => {
        if (badge === 'Soon') return;
        navigate(route);
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        navigate('/app/create/text-to-image', { state: { prompt } });
    };

    // Mock function for enhancing prompt
    const enhancePrompt = () => {
        if (!prompt) return;
        setPrompt(prev => prev + " in 8k resolution, cinematic lighting, hyper-realistic, highly detailed");
    };

    return (
        <div ref={container} className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Hero Section */}
            <GSAPTransition animation="fade-in-up" duration={1}>
                <div className="text-center space-y-8 py-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        What will you create today?
                    </h1>

                    <div className="max-w-3xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />

                        <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-col shadow-2xl">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your imagination... (e.g., 'A cyberpunk city with neon lights')"
                                className="bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 min-h-[100px] resize-none w-full p-2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleGenerate();
                                    }
                                }}
                            />

                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                <div className="flex items-center gap-3">
                                    {/* Model Selector */}
                                    <div className="relative group/model">
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors border border-white/5">
                                            <span>{selectedModel}</span>
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        </button>
                                        {/* Dropdown (Mock) */}
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden hidden group-hover/model:block z-50 shadow-xl">
                                            {['Nebula Turbo', 'Nebula V1', 'Nebula Pro'].map(model => (
                                                <button
                                                    key={model}
                                                    onClick={() => setSelectedModel(model)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                >
                                                    {model}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Attach File */}
                                    <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Attach Image/Video">
                                        <Paperclip className="w-5 h-5" />
                                    </button>

                                    {/* Enhance */}
                                    <button
                                        onClick={enhancePrompt}
                                        className="p-2 rounded-lg hover:bg-white/5 text-[#00FF88] hover:text-[#00FF88]/80 transition-colors flex items-center gap-2 group/enhance"
                                        title="Enhance Prompt"
                                    >
                                        <Wand2 className="w-5 h-5 transition-transform group-hover/enhance:rotate-12" />
                                        <span className="text-sm font-medium hidden sm:inline">Enhance</span>
                                    </button>
                                </div>

                                <button
                                    className="px-6 py-2.5 bg-[#00FF88] hover:bg-[#00CC6A] text-[#0A0A0A] font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#00FF88]/20"
                                    onClick={handleGenerate}
                                >
                                    Generate
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm">
                        Try: <button onClick={() => setPrompt('Futuristic space station')} className="text-white hover:text-[#00FF88] transition-colors">Futuristic space station</button>, <button onClick={() => setPrompt('Portrait of a warrior')} className="text-white hover:text-[#00FF88] transition-colors">Portrait of a warrior</button>
                    </p>
                </div>
            </GSAPTransition>

            {/* Quick Actions Grid */}
            <GSAPTransition animation="fade-in-up" stagger={0.1} delay={0.4} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => navigate(action.route)}
                        className="dashboard-card group relative overflow-hidden rounded-2xl p-6 bg-[#141414] border border-white/5 hover:border-white/10 transition-all text-left"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                        <div className="relative z-10 flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-10`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#00FF88] transition-colors">{action.name}</h3>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{action.description}</p>
                    </button>
                ))}
            </GSAPTransition>

            {/* Recent & Popular Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#00FF88]" />
                            Recent Projects
                        </h2>
                        <button className="text-sm text-gray-400 hover:text-white transition-colors">View All</button>
                    </div>

                    <GSAPTransition className="grid grid-cols-1 sm:grid-cols-2 gap-4" stagger={0.1} delay={0.6}>
                        {recentProjects.map((project: any) => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/app/editor/${project.id}`)} // Navigate to editor
                                className="dashboard-card group flex items-center gap-4 p-3 rounded-xl bg-[#141414] border border-white/5 hover:border-white/10 hover:bg-[#1A1A1A] transition-all cursor-pointer"
                            >
                                <div className="w-24 h-16 rounded-lg overflow-hidden bg-black/50 relative">
                                    <img src={project.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                    {project.status === 'processing' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                            <div className="w-5 h-5 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white truncate group-hover:text-[#00FF88] transition-colors">{project.name || 'Untitled Project'}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                            {project.type || 'Video'}
                                        </span>
                                        <span className="text-xs text-gray-500">{project.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </GSAPTransition>
                </div>

                {/* Popular Tools */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Popular Tools
                    </h2>
                    <GSAPTransition className="space-y-3" stagger={0.1} delay={0.8}>
                        {popularTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolClick(tool.route, tool.badge)}
                                className={`dashboard-card w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${tool.badge === 'Soon'
                                    ? 'bg-[#141414]/50 border-white/5 opacity-60 cursor-not-allowed'
                                    : 'bg-[#141414] border-white/5 hover:border-white/10 hover:bg-[#1A1A1A]'
                                    }`}
                                disabled={tool.badge === 'Soon'}
                            >
                                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <tool.icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-white text-sm">{tool.name}</h4>
                                        {tool.badge && (
                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                                                {tool.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">{tool.description}</p>
                                </div>
                            </button>
                        ))}
                    </GSAPTransition>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;
