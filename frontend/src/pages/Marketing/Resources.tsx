import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Code, FileText, Users, Video, ArrowRight, ExternalLink, Search } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Resources = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        {
            id: 'documentation',
            icon: Book,
            title: 'Documentation',
            description: 'Comprehensive guides to help you get started and master Nebula.',
            href: '/resources#documentation',
            items: [
                { title: 'Getting Started', time: '5 min read' },
                { title: 'Video Generation Guide', time: '10 min read' },
                { title: 'Image Creation Tutorial', time: '8 min read' },
                { title: 'Audio Suite Overview', time: '6 min read' },
            ],
        },
        {
            id: 'api',
            icon: Code,
            title: 'API Reference',
            description: 'Complete API documentation with examples and SDKs.',
            href: '/resources#api',
            items: [
                { title: 'Authentication', time: 'Reference' },
                { title: 'Video Generation API', time: 'Reference' },
                { title: 'Webhooks', time: 'Reference' },
                { title: 'SDKs & Libraries', time: 'Reference' },
            ],
        },
        {
            id: 'blog',
            icon: FileText,
            title: 'Blog',
            description: 'Latest news, tutorials, and insights from the Nebula team.',
            href: '/resources#blog',
            items: [
                { title: 'Introducing Gen-4 Video', time: 'Dec 5, 2024' },
                { title: 'AI in Film Production', time: 'Dec 1, 2024' },
                { title: 'Creating Viral Content', time: 'Nov 28, 2024' },
                { title: 'Enterprise Case Study', time: 'Nov 20, 2024' },
            ],
        },
        {
            id: 'tutorials',
            icon: Video,
            title: 'Video Tutorials',
            description: 'Step-by-step video guides for all skill levels.',
            href: '/resources#tutorials',
            items: [
                { title: 'Nebula Basics', time: '15 min' },
                { title: 'Advanced Prompting', time: '25 min' },
                { title: 'Style Transfer Masterclass', time: '30 min' },
                { title: 'API Integration', time: '20 min' },
            ],
        },
        {
            id: 'community',
            icon: Users,
            title: 'Community',
            description: 'Connect with other creators, share work, and get help.',
            href: '/resources#community',
            items: [
                { title: 'Discord Server', time: '50K+ members' },
                { title: 'Creator Showcase', time: 'Gallery' },
                { title: 'Feature Requests', time: 'Feedback' },
                { title: 'Help Forum', time: 'Support' },
            ],
        },
    ];

    const featuredArticles = [
        {
            title: 'The Complete Guide to AI Video Generation',
            description: 'Everything you need to know about creating stunning videos with AI.',
            image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&q=80',
            category: 'Tutorial',
            time: '15 min read',
        },
        {
            title: 'Gen-4: A New Era of AI Creativity',
            description: 'Exploring the capabilities of our latest video generation model.',
            image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
            category: 'Announcement',
            time: '5 min read',
        },
        {
            title: 'From Script to Screen: AI Production Workflow',
            description: 'How studios are integrating AI into their production pipeline.',
            image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80',
            category: 'Case Study',
            time: '10 min read',
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            <span className="gradient-text">Resources</span> & Documentation
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            Everything you need to master Nebula. Guides, tutorials, API docs, and community resources.
                        </p>
                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--marketing-muted)]" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input pl-12 py-4 text-base"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                id={category.id}
                                className="glass-card p-6 hover:border-[var(--marketing-accent)]/30 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center group-hover:bg-[var(--marketing-accent)]/20 transition-colors">
                                        <category.icon className="w-6 h-6 text-[var(--marketing-accent)]" />
                                    </div>
                                    <Link
                                        to={category.href}
                                        className="text-[var(--marketing-muted)] hover:text-[var(--marketing-accent)] transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                                <p className="text-[var(--marketing-muted)] text-sm mb-4">{category.description}</p>
                                <ul className="space-y-2">
                                    {category.items.map((item) => (
                                        <li
                                            key={item.title}
                                            className="flex items-center justify-between py-2 border-t border-[var(--marketing-border)]"
                                        >
                                            <span className="text-sm text-gray-300 hover:text-white cursor-pointer transition-colors">
                                                {item.title}
                                            </span>
                                            <span className="text-xs text-[var(--marketing-muted)]">{item.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Articles */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Featured Articles
                            </h2>
                            <p className="text-[var(--marketing-muted)]">
                                Latest insights and tutorials from our team.
                            </p>
                        </div>
                        <Link
                            to="/resources#blog"
                            className="hidden md:flex items-center gap-2 text-[var(--marketing-accent)] hover:underline"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredArticles.map((article) => (
                            <div
                                key={article.title}
                                className="glass-card overflow-hidden group cursor-pointer"
                            >
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 rounded bg-[var(--marketing-accent)]/20 text-[var(--marketing-accent)] text-xs font-medium">
                                            {article.category}
                                        </span>
                                        <span className="text-[var(--marketing-muted)] text-xs">{article.time}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--marketing-accent)] transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-[var(--marketing-muted)] text-sm line-clamp-2">
                                        {article.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link
                            to="/resources#blog"
                            className="inline-flex items-center gap-2 text-[var(--marketing-accent)]"
                        >
                            View all articles
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="glass-card p-8 md:p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Stay in the loop
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-xl mx-auto mb-8">
                            Get weekly updates on new features, tutorials, and community highlights.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="form-input flex-1"
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Resources;
