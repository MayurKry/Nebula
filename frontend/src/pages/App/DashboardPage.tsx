import {
    Video, Image, Plus,
    ArrowRight, Clock, Star, Users, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGeneration } from '@/components/generation/GenerationContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { jobs } = useGeneration();

    // Quick Actions
    const quickActions = [
        {
            id: 'text-to-video',
            name: 'Text to Video',
            icon: Video,
            description: 'Convert scripts to video',
            color: 'from-purple-500 to-pink-500',
            route: '/app/tools/text-to-video'
        },
        {
            id: 'image-to-video',
            name: 'Image to Video',
            icon: Image,
            description: 'Animate static images',
            color: 'from-blue-500 to-cyan-500',
            route: '/app/tools/image-to-video'
        },
        {
            id: 'text-to-image',
            name: 'Text to Image',
            icon: Image,
            description: 'Generate AI images',
            color: 'from-amber-500 to-orange-500',
            route: '/app/tools/text-to-image'
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

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                    What will you create today?
                </h1>

                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
                    <div className="relative bg-[#141414] border border-white/10 rounded-xl p-2 flex items-center shadow-2xl">
                        <Sparkles className="w-6 h-6 text-[#00FF88] ml-3 mr-3" />
                        <input
                            type="text"
                            placeholder="Describe your imagination... (e.g., 'A cyberpunk city with neon lights')"
                            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 h-10"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    navigate('/app/create/text-to-image', { state: { prompt: (e.target as HTMLInputElement).value } });
                                }
                            }}
                        />
                        <button
                            className="px-6 py-2.5 bg-[#00FF88] hover:bg-[#00CC6A] text-[#0A0A0A] font-semibold rounded-lg transition-colors flex items-center gap-2"
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                navigate('/app/create/text-to-image', { state: { prompt: input.value } });
                            }}
                        >
                            Generate
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <p className="text-gray-400 text-sm">
                    Try: <button onClick={() => navigate('/app/create/text-to-image', { state: { prompt: 'Futuristic space station' } })} className="text-white hover:text-[#00FF88] transition-colors">Futuristic space station</button>, <button onClick={() => navigate('/app/create/text-to-image', { state: { prompt: 'Portrait of a warrior' } })} className="text-white hover:text-[#00FF88] transition-colors">Portrait of a warrior</button>
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => navigate(action.route)}
                        className="group relative overflow-hidden rounded-2xl p-6 bg-[#141414] border border-white/5 hover:border-white/10 transition-all text-left"
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
            </div>

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recentProjects.map((project: any) => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/app/editor/${project.id}`)} // Navigate to editor
                                className="group flex items-center gap-4 p-3 rounded-xl bg-[#141414] border border-white/5 hover:border-white/10 hover:bg-[#1A1A1A] transition-all cursor-pointer"
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
                    </div>
                </div>

                {/* Popular Tools */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Popular Tools
                    </h2>
                    <div className="space-y-3">
                        {popularTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolClick(tool.route, tool.badge)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${tool.badge === 'Soon'
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
