import {
    Video, Image, Plus,
    ArrowRight, Clock, Star, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGeneration } from '@/context/GenerationContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { generatedVideos } = useGeneration();

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Welcome back, {user?.name || 'Creator'}
                    </h1>
                    <p className="text-gray-400 mt-2">Ready to create something amazing today?</p>
                </div>
                <button
                    onClick={() => navigate('/app/editor/new')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-black font-semibold rounded-xl hover:bg-[#00FF88]/90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
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
