import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Bell, Sparkles, Video, Image as ImageIcon,
    UserCircle, Layers, Copy, Package, Film, Zap, Grid, Play,
    Plus, Clock, MoreHorizontal, X, ArrowRight, Loader2
} from 'lucide-react';

// Sample data for recent projects
const recentProjects = [
    {
        id: '1',
        name: 'Product Launch Video',
        thumbnail: 'https://picsum.photos/seed/proj1/320/180',
        type: 'text-to-video',
        updatedAt: '2 hours ago',
    },
    {
        id: '2',
        name: 'Marketing Campaign',
        thumbnail: 'https://picsum.photos/seed/proj2/320/180',
        type: 'text-to-image',
        updatedAt: '5 hours ago',
    },
    {
        id: '3',
        name: 'Storyboard Draft',
        thumbnail: 'https://picsum.photos/seed/proj3/320/180',
        type: 'storyboard',
        updatedAt: '1 day ago',
    },
    {
        id: '4',
        name: 'Social Media Ads',
        thumbnail: 'https://picsum.photos/seed/proj4/320/180',
        type: 'text-to-video',
        updatedAt: '2 days ago',
    },
];

// Popular tools data with routes
const popularTools = [
    { id: 'avatar', name: 'Avatar Video', icon: UserCircle, description: 'Create talking avatars', badge: 'Soon', route: '/app/tools/avatar' },
    { id: 'adclone', name: 'Ad Clone', icon: Copy, description: 'Clone winning ads', badge: 'Soon', route: '/app/tools/adclone' },
    { id: 'assets', name: 'Asset Generator', icon: Package, description: 'Generate visual assets', badge: 'Soon', route: '/app/assets' },
    { id: 'imageads', name: 'Image Ads', icon: ImageIcon, description: 'Create image ads', badge: null, route: '/app/tools/imageads' },
    { id: 'product', name: 'Product Video', icon: Film, description: 'Product showcases', badge: null, route: '/app/tools/product' },
    { id: 'shorts', name: 'AI Shorts', icon: Zap, description: 'Viral short videos', badge: 'Soon', route: '/app/tools/shorts' },
    { id: 'batch', name: 'Batch Mode', icon: Grid, description: 'Generate in bulk', badge: 'Soon', route: '/app/tools/batch' },
    { id: 'editor', name: 'Video Editor', icon: Play, description: 'Edit your videos', badge: 'Soon', route: '/app/tools/editor' },
];

// Quick action cards data
const quickActions = [
    {
        id: 'text-to-video',
        title: 'Generate Videos',
        description: 'Turn text into stunning videos',
        icon: Video,
        color: 'from-purple-500 to-pink-500',
        thumbnail: 'https://picsum.photos/seed/video/400/200',
    },
    {
        id: 'animate',
        title: 'Animate Characters',
        description: 'Bring characters to life',
        icon: Sparkles,
        color: 'from-[#00FF88] to-cyan-400',
        thumbnail: 'https://picsum.photos/seed/animate/400/200',
    },
    {
        id: 'text-to-image',
        title: 'Generate Images',
        description: 'Create stunning visuals',
        icon: ImageIcon,
        color: 'from-orange-500 to-yellow-500',
        thumbnail: 'https://picsum.photos/seed/image/400/200',
    },
];

const styles = [
    'Cinematic', 'Anime', 'Photorealistic', '3D Animation', 'Illustration', 'Minimalist'
];

const DashboardPage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('Cinematic');
    const [showStyleDropdown, setShowStyleDropdown] = useState(false);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<typeof recentProjects[0] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        // Simulate generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGenerating(false);
        setShowNewProjectModal(true);
    };

    const handleQuickAction = (actionId: string) => {
        if (actionId === 'text-to-video') navigate('/app/create/text-to-video');
        else if (actionId === 'text-to-image') navigate('/app/create/text-to-image');
        else if (actionId === 'animate') navigate('/app/create/image-to-video');
        else setShowNewProjectModal(true);
    };

    const handleToolClick = (tool: typeof popularTools[0]) => {
        // Prevent navigation if tool is marked as Soon
        if (tool.badge === 'Soon') return;

        if (tool.id === 'assets') {
            navigate('/app/assets');
        } else if (tool.id === 'imageads') {
            navigate('/app/create/text-to-image');
        } else if (tool.id === 'product') {
            navigate('/app/create/text-to-video');
        } else {
            // Fallback for tools not yet explicitly implemented
            navigate('/app/create/text-to-video');
        }
    };

    const handleProjectClick = (project: typeof recentProjects[0]) => {
        setSelectedProject(project);
    };

    const handleCreateProject = (type: string) => {
        setShowNewProjectModal(false);
        if (type === 'text-to-video') {
            navigate('/app/create/text-to-video');
        } else if (type === 'text-to-image') {
            navigate('/app/create/text-to-image');
        } else if (type === 'image-to-video') {
            navigate('/app/create/image-to-video');
        }
    };

    const handleProjectAction = (action: string, projectId: string) => {
        setShowProjectMenu(null);
        console.log("Project Action", action, projectId);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-1 max-w-2xl mr-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search projects, assets, tools..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00FF88]/50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00FF88] rounded-full" />
                            </button>
                            <Link to="/app/profile" className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">JD</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <section className="mb-12">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A cinematic shot..."
                            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[100px]"
                        />
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-300"
                            >
                                <Sparkles className="w-4 h-4 text-[#00FF88]" />
                                {selectedStyle}
                            </button>
                            <button
                                onClick={handleGenerate}
                                className="px-6 py-2 bg-[#00FF88] text-[#0A0A0A] font-semibold rounded-lg flex items-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate
                            </button>
                        </div>
                    </div>
                </section>

                {/* Quick Action Cards */}
                <section className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action.id)}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] cursor-pointer hover:border-[#00FF88]/30 transition-all hover:scale-[1.02] text-left"
                            >
                                <div className="aspect-video overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-t ${action.color} opacity-50`} />
                                    <img
                                        src={action.thumbnail}
                                        alt={action.title}
                                        className="w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:opacity-75 transition-opacity"
                                    />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 className="font-semibold text-white">{action.title}</h3>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Popular Tools Grid */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Popular Tools</h2>
                        <Link to="/app/tools" className="text-sm text-[#00FF88] hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {popularTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolClick(tool)}
                                className={`group p-4 bg-[#141414] border border-white/10 rounded-xl transition-all text-left ${tool.badge === 'Soon' ? 'opacity-70 cursor-not-allowed' : 'hover:border-[#00FF88]/30 hover:scale-[1.02] cursor-pointer'}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center group-hover:bg-[#00FF88]/10 transition-colors">
                                        <tool.icon className={`w-5 h-5 transition-colors ${tool.badge === 'Soon' ? 'text-gray-600' : 'text-gray-400 group-hover:text-[#00FF88]'}`} />
                                    </div>
                                    {tool.badge && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tool.badge === 'New' ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                                                tool.badge === 'Soon' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    tool.badge === '🔥' ? 'bg-orange-500/20 text-orange-500' :
                                                        'bg-gray-800 text-gray-400'
                                            }`}>
                                            {tool.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-medium text-white mb-1">{tool.name}</h3>
                                <p className="text-xs text-gray-500">{tool.description}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Recent Projects */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                        <div className="flex items-center gap-3">
                            <Link to="/app/assets" className="text-sm text-[#00FF88] hover:underline flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setShowNewProjectModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#00FF88] text-[#0A0A0A] font-medium text-sm rounded-lg hover:bg-[#00FF88]/90 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Project
                            </button>
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {recentProjects.map((proj) => (
                            <div
                                key={proj.id}
                                className="flex-shrink-0 w-72 bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-[#00FF88]/30 transition-all cursor-pointer group"
                            >
                                <button
                                    onClick={() => handleProjectClick(proj)}
                                    className="w-full aspect-video relative overflow-hidden"
                                >
                                    <img
                                        src={proj.thumbnail}
                                        alt={proj.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                            <Play className="w-5 h-5 text-white ml-0.5" />
                                        </div>
                                    </div>
                                </button>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <button
                                            onClick={() => handleProjectClick(proj)}
                                            className="text-left flex-1"
                                        >
                                            <h3 className="font-medium text-white mb-1 hover:text-[#00FF88] transition-colors">{proj.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {proj.updatedAt}
                                            </div>
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowProjectMenu(showProjectMenu === proj.id ? null : proj.id)}
                                                className="p-1 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            {showProjectMenu === proj.id && (
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-1 z-50">
                                                    <button
                                                        onClick={() => handleProjectAction('open', proj.id)}
                                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectAction('duplicate', proj.id)}
                                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectAction('delete', proj.id)}
                                                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* New Project Modal - Simplified for now to avoid complexity in this file,
                 can be re-enabled fully if needed, but the crash was in Recent Projects */}
            {showNewProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl overflow-hidden relative">
                        <button
                            onClick={() => setShowNewProjectModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-white mb-2">Create New Project</h2>
                            <p className="text-gray-400 mb-8">Choose how you want to start creating.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleCreateProject('text-to-video')}
                                    className="p-4 bg-[#1A1A1A] border border-white/10 rounded-xl hover:border-[#00FF88]/50 transition-all text-left flex items-start gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Video className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Text to Video</h3>
                                        <p className="text-sm text-gray-400">Transform your script into a complete video with AI.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleCreateProject('text-to-image')}
                                    className="p-4 bg-[#1A1A1A] border border-white/10 rounded-xl hover:border-[#00FF88]/50 transition-all text-left flex items-start gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Text to Image</h3>
                                        <p className="text-sm text-gray-400">Generate high-quality images from text descriptions.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
