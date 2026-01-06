import { useState } from 'react';
import {
    Library, Music, Video, Image, Sparkles,
    Download, Crown, Check, Search, Filter,
    Play, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { toast } from 'sonner';

interface Resource {
    id: string;
    title: string;
    category: 'templates' | 'music' | 'sound-effects' | 'stock-footage' | 'graphics';
    type: 'free' | 'paid';
    price?: number;
    thumbnail: string;
    description: string;
    downloads?: number;
    rating?: number;
}

const MOCK_RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'Cinematic Intro Template',
        category: 'templates',
        type: 'free',
        thumbnail: 'https://image.pollinations.ai/prompt/cinematic%20intro%20template%20preview?width=400&height=300&nologo=true',
        description: 'Professional cinematic intro template with customizable text',
        downloads: 1234,
        rating: 4.8
    },
    {
        id: '2',
        title: 'Epic Orchestral Pack',
        category: 'music',
        type: 'paid',
        price: 29.99,
        thumbnail: 'https://image.pollinations.ai/prompt/epic%20orchestral%20music%20visualization?width=400&height=300&nologo=true',
        description: '50+ premium orchestral tracks for cinematic projects',
        downloads: 856,
        rating: 4.9
    },
    {
        id: '3',
        title: 'UI Sound Effects Bundle',
        category: 'sound-effects',
        type: 'free',
        thumbnail: 'https://image.pollinations.ai/prompt/sound%20effects%20waveform%20visualization?width=400&height=300&nologo=true',
        description: '100+ UI sound effects for apps and games',
        downloads: 2341,
        rating: 4.7
    },
    {
        id: '4',
        title: '4K Nature Stock Footage',
        category: 'stock-footage',
        type: 'paid',
        price: 49.99,
        thumbnail: 'https://image.pollinations.ai/prompt/4k%20nature%20landscape%20cinematic?width=400&height=300&nologo=true',
        description: '200+ clips of stunning 4K nature footage',
        downloads: 543,
        rating: 5.0
    },
    {
        id: '5',
        title: 'Modern Graphics Pack',
        category: 'graphics',
        type: 'free',
        thumbnail: 'https://image.pollinations.ai/prompt/modern%20graphics%20design%20elements?width=400&height=300&nologo=true',
        description: 'Animated graphics and overlays for modern videos',
        downloads: 1876,
        rating: 4.6
    },
    {
        id: '6',
        title: 'Lo-Fi Beats Collection',
        category: 'music',
        type: 'free',
        thumbnail: 'https://image.pollinations.ai/prompt/lofi%20beats%20aesthetic%20visualization?width=400&height=300&nologo=true',
        description: '30 chill lo-fi tracks for background music',
        downloads: 3421,
        rating: 4.9
    },
    {
        id: '7',
        title: 'Corporate Video Template',
        category: 'templates',
        type: 'paid',
        price: 19.99,
        thumbnail: 'https://image.pollinations.ai/prompt/corporate%20video%20template%20professional?width=400&height=300&nologo=true',
        description: 'Professional corporate presentation template',
        downloads: 678,
        rating: 4.7
    },
    {
        id: '8',
        title: 'Cyberpunk City Footage',
        category: 'stock-footage',
        type: 'paid',
        price: 39.99,
        thumbnail: 'https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20footage?width=400&height=300&nologo=true',
        description: 'Futuristic cyberpunk city B-roll footage',
        downloads: 432,
        rating: 4.8
    },
];

const categories = [
    { id: 'all', label: 'All Resources', icon: Library },
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'sound-effects', label: 'Sound Effects', icon: Music },
    { id: 'stock-footage', label: 'Stock Footage', icon: Video },
    { id: 'graphics', label: 'Graphics', icon: Image },
];

const LibraryPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

    const filteredResources = MOCK_RESOURCES.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
        const matchesType = filterType === 'all' || resource.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const handleResourceClick = (resource: Resource) => {
        if (resource.type === 'free') {
            toast.success(`${resource.title} added to your assets!`);
            // In a real app, this would download or add the resource to user's library
        } else {
            // Redirect to payment screen
            navigate('/app/payment', { state: { resource } });
        }
    };

    const getCategoryIcon = (category: string) => {
        const cat = categories.find(c => c.id === category);
        return cat ? <cat.icon className="w-4 h-4" /> : null;
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-8">
            <main className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4 pt-4">
                        <div className="inline-flex p-3 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-2xl mb-2">
                            <Library className="w-8 h-8 text-[#00FF88]" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">Library</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Access thousands of free and premium resources to enhance your creative projects. From templates to stock footage, we've got you covered.
                        </p>
                    </div>
                </GSAPTransition>

                {/* Search and Filters */}
                <GSAPTransition animation="fade-in-up" delay={0.1}>
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search resources..."
                                className="w-full pl-12 pr-4 py-4 bg-[#141414] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF88]/40 transition-colors"
                            />
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id
                                        ? 'bg-[#00FF88] text-black'
                                        : 'bg-[#141414] text-gray-400 border border-white/10 hover:border-[#00FF88]/40 hover:text-white'
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center justify-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <div className="flex gap-2">
                                {(['all', 'free', 'paid'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filterType === type
                                            ? 'bg-white/10 text-white border border-white/20'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </GSAPTransition>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource, idx) => (
                        <GSAPTransition key={resource.id} animation="fade-in-up" delay={idx * 0.05}>
                            <div className="group bg-[#141414] border border-white/5 rounded-3xl overflow-hidden hover:border-[#00FF88]/40 transition-all shadow-2xl">
                                {/* Thumbnail */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={resource.thumbnail}
                                        alt={resource.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        {resource.category === 'music' || resource.category === 'sound-effects' ? (
                                            <button className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                                                <Play className="w-5 h-5" />
                                            </button>
                                        ) : null}
                                    </div>

                                    {/* Type Badge */}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${resource.type === 'free'
                                        ? 'bg-[#00FF88] text-black'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        }`}>
                                        {resource.type === 'free' ? 'FREE' : `$${resource.price}`}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[#00FF88]">
                                                {getCategoryIcon(resource.category)}
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {resource.category.replace('-', ' ')}
                                                </span>
                                            </div>
                                            {resource.rating && (
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <span className="text-xs font-bold">★ {resource.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#00FF88] transition-colors">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                            {resource.description}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    {resource.downloads && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Download className="w-3 h-3" />
                                            <span>{resource.downloads.toLocaleString()} downloads</span>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleResourceClick(resource)}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${resource.type === 'free'
                                            ? 'bg-[#00FF88] text-black hover:bg-[#00CC6A] shadow-lg shadow-[#00FF88]/20'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg'
                                            }`}
                                    >
                                        {resource.type === 'free' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Use Now
                                            </>
                                        ) : (
                                            <>
                                                <Crown className="w-4 h-4" />
                                                Purchase
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </GSAPTransition>
                    ))}
                </div>

                {/* Empty State */}
                {filteredResources.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-4">
                            <Library className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No resources found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default LibraryPage;
