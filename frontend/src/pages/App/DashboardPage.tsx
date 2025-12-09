import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Bell, ChevronDown, Sparkles, Video, Image,
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
    { id: 'avatar', name: 'Avatar Video', icon: UserCircle, description: 'Create talking avatars', badge: 'New', route: '/app/tools/avatar' },
    { id: 'adclone', name: 'Ad Clone', icon: Copy, description: 'Clone winning ads', badge: '🔥', route: '/app/tools/adclone' },
    { id: 'assets', name: 'Asset Generator', icon: Package, description: 'Generate visual assets', badge: null, route: '/app/assets' },
    { id: 'imageads', name: 'Image Ads', icon: Image, description: 'Create image ads', badge: null, route: '/app/tools/imageads' },
    { id: 'product', name: 'Product Video', icon: Film, description: 'Product showcases', badge: null, route: '/app/tools/product' },
    { id: 'shorts', name: 'AI Shorts', icon: Zap, description: 'Viral short videos', badge: '🔥', route: '/app/tools/shorts' },
    { id: 'batch', name: 'Batch Mode', icon: Grid, description: 'Generate in bulk', badge: null, route: '/app/tools/batch' },
    { id: 'editor', name: 'Video Editor', icon: Play, description: 'Edit your videos', badge: null, route: '/app/tools/editor' },
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
        icon: Image,
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGenerating(false);
        setShowNewProjectModal(true);
    };

    const handleQuickAction = (actionId: string) => {
        // Open new project modal with the selected type
        setShowNewProjectModal(true);
    };

    const handleToolClick = (tool: typeof popularTools[0]) => {
        // Navigate to the tool or show a coming soon message
        if (tool.id === 'assets') {
            navigate('/app/assets');
        } else {
            alert(`${tool.name} - Coming soon! This feature is under development.`);
        }
    };

    const handleProjectClick = (project: typeof recentProjects[0]) => {
        setSelectedProject(project);
    };

    const handleCreateProject = (type: string) => {
        setShowNewProjectModal(false);
        // Navigate to project creation page or workspace
        alert(`Creating new ${type} project... Redirecting to workspace.`);
        // In a real app: navigate(`/app/workspace?type=${type}&prompt=${encodeURIComponent(prompt)}`);
    };

    const handleProjectAction = (action: string, projectId: string) => {
        setShowProjectMenu(null);
        switch (action) {
            case 'open':
                alert(`Opening project ${projectId}...`);
                break;
            case 'duplicate':
                alert(`Duplicating project ${projectId}...`);
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this project?')) {
                    alert(`Deleted project ${projectId}`);
                }
                break;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#00FF88] flex items-center justify-center">
                                <span className="text-[#0A0A0A] font-bold">N</span>
                            </div>
                            <span className="text-xl font-bold text-white hidden sm:block">Nebula</span>
                        </Link>

                        {/* Search Bar (center) */}
                        <div className="flex-1 max-w-xl mx-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search projects, assets, tools..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00FF88]/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            alert(`Searching for: ${(e.target as HTMLInputElement).value}`);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#00FF88] rounded-full" />
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl py-2 z-50">
                                        <div className="px-4 py-2 border-b border-white/10">
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                        </div>
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No new notifications
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile */}
                            <Link
                                to="/app/profile"
                                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#00FF88]/50 transition-all"
                            >
                                <span className="text-white text-sm font-medium">JD</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <section className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        What do you want to create today?
                    </h1>
                    <p className="text-gray-400 mb-6">Describe your idea and let AI bring it to life.</p>

                    {/* Prompt Input */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A cinematic shot of a futuristic city at sunset, with flying cars and neon lights..."
                            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[100px]"
                        />
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            {/* Style selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-300 hover:border-white/20 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 text-[#00FF88]" />
                                    {selectedStyle}
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {showStyleDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-2 z-50">
                                        {styles.map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => {
                                                    setSelectedStyle(style);
                                                    setShowStyleDropdown(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${selectedStyle === style ? 'text-[#00FF88]' : 'text-gray-300'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Generate button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isGenerating}
                                className="px-6 py-2 bg-[#00FF88] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#00FF88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate
                                    </>
                                )}
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
                                {/* Thumbnail */}
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={action.thumbnail}
                                        alt={action.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${action.color} opacity-50`} />
                                </div>
                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                                            <action.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white">{action.title}</h3>
                                            <p className="text-sm text-gray-300">{action.description}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
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
                                className="group p-4 bg-[#141414] border border-white/10 rounded-xl hover:border-[#00FF88]/30 transition-all cursor-pointer hover:scale-[1.02] text-left"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center group-hover:bg-[#00FF88]/10 transition-colors">
                                        <tool.icon className="w-5 h-5 text-gray-400 group-hover:text-[#00FF88] transition-colors" />
                                    </div>
                                    {tool.badge && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tool.badge === 'New' ? 'bg-[#00FF88]/20 text-[#00FF88]' : ''
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
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {recentProjects.map((project) => (
                            <div
                                key={project.id}
                                className="flex-shrink-0 w-72 bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-[#00FF88]/30 transition-all cursor-pointer group"
                            >
                                <button
                                    onClick={() => handleProjectClick(project)}
                                    className="w-full aspect-video relative overflow-hidden"
                                >
                                    <img
                                        src={project.thumbnail}
                                        alt={project.name}
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
                                            onClick={() => handleProjectClick(project)}
                                            className="text-left flex-1"
                                        >
                                            <h3 className="font-medium text-white mb-1 hover:text-[#00FF88] transition-colors">{project.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {project.updatedAt}
                                            </div>
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowProjectMenu(showProjectMenu === project.id ? null : project.id)}
                                                className="p-1 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            {showProjectMenu === project.id && (
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-1 z-50">
                                                    <button
                                                        onClick={() => handleProjectAction('open', project.id)}
                                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectAction('duplicate', project.id)}
                                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        onClick={() => handleProjectAction('delete', project.id)}
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

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowNewProjectModal(false)}
                >
                    <div
                        className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Create New Project</h2>
                            <button
                                onClick={() => setShowNewProjectModal(false)}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'text-to-video', title: 'Text → Video', icon: Video, desc: 'Turn your script into video' },
                                { id: 'image-to-video', title: 'Image → Video', icon: Image, desc: 'Animate your images' },
                                { id: 'storyboard', title: 'Storyboard', icon: Layers, desc: 'Plan scene by scene' },
                                { id: 'text-to-image', title: 'Text → Image', icon: Sparkles, desc: 'Generate images' },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleCreateProject(option.id)}
                                    className="p-4 bg-[#1A1A1A] border border-white/10 rounded-xl text-left hover:border-[#00FF88]/30 hover:bg-[#1F1F1F] transition-all hover:scale-[1.02] group"
                                >
                                    <option.icon className="w-8 h-8 text-[#00FF88] mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-medium text-white mb-1">{option.title}</h3>
                                    <p className="text-xs text-gray-500">{option.desc}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowNewProjectModal(false)}
                            className="mt-6 w-full py-3 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Project Preview Modal */}
            {selectedProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedProject(null)}
                >
                    <div
                        className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="aspect-video relative bg-black">
                            <img
                                src={selectedProject.thumbnail}
                                alt={selectedProject.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-16 h-16 rounded-full bg-[#00FF88] flex items-center justify-center hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-[#0A0A0A] ml-1" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedProject.name}</h3>
                                    <p className="text-gray-500 text-sm">Last edited {selectedProject.updatedAt}</p>
                                </div>
                                <span className="px-3 py-1 bg-[#1A1A1A] rounded-full text-xs text-gray-400 capitalize">
                                    {selectedProject.type.replace('-', ' → ')}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedProject(null);
                                        alert(`Opening editor for ${selectedProject.name}...`);
                                    }}
                                    className="flex-1 py-3 bg-[#00FF88] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#00FF88]/90 transition-all"
                                >
                                    Open in Editor
                                </button>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="px-6 py-3 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdowns */}
            {(showStyleDropdown || showNotifications || showProjectMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowStyleDropdown(false);
                        setShowNotifications(false);
                        setShowProjectMenu(null);
                    }}
                />
            )}
        </div>
    );
};

export default DashboardPage;
