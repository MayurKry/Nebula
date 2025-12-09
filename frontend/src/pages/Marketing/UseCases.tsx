import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Filter } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const UseCases = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All Use Cases' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'entertainment', label: 'Entertainment' },
        { id: 'education', label: 'Education' },
        { id: 'social', label: 'Social Media' },
        { id: 'enterprise', label: 'Enterprise' },
    ];

    const useCases = [
        {
            id: 'ai-video-generation',
            title: 'AI Video Generation',
            description: 'Create stunning videos from text prompts. Perfect for quick concept videos, social content, and creative exploration.',
            category: 'marketing',
            image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
            featured: true,
        },
        {
            id: 'product-animation',
            title: 'Product Shot Animation',
            description: 'Transform static product images into dynamic 3D animations. Showcase products from every angle.',
            category: 'marketing',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        },
        {
            id: 'movie-trailer',
            title: 'Movie Trailer Generator',
            description: 'Create compelling movie trailers with AI. Perfect for pitching ideas and visualizing concepts.',
            category: 'entertainment',
            image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
            featured: true,
        },
        {
            id: 'anime-generator',
            title: 'AI Anime Generator',
            description: 'Generate custom anime characters, scenes, and styles in seconds. No drawing skills needed.',
            category: 'entertainment',
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
        },
        {
            id: 'ad-generator',
            title: 'AI Ad Generator',
            description: 'Create high-converting video ads at scale. Personalize for different audiences automatically.',
            category: 'marketing',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
            featured: true,
        },
        {
            id: 'storyboard',
            title: 'AI Storyboard Generator',
            description: 'Convert scripts to visual storyboards instantly. Speed up pre-production workflows.',
            category: 'entertainment',
            image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80',
        },
        {
            id: 'educational-content',
            title: 'Educational Content',
            description: 'Create engaging educational videos that adapt to different learning styles and audiences.',
            category: 'education',
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
        },
        {
            id: 'music-video',
            title: 'Music Video Maker',
            description: 'Bring your music to life with AI-generated visuals that match the mood and rhythm.',
            category: 'entertainment',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
        },
        {
            id: 'social-content',
            title: 'Social Media Content',
            description: 'Generate scroll-stopping content for TikTok, Instagram, and YouTube. Stay ahead of trends.',
            category: 'social',
            image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
        },
        {
            id: 'vfx-effects',
            title: 'VFX & Special Effects',
            description: 'Add Hollywood-quality visual effects to your videos. Fire, smoke, particles, and more.',
            category: 'entertainment',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        },
        {
            id: 'training-videos',
            title: 'Training Videos',
            description: 'Create professional training and onboarding videos for your organization.',
            category: 'enterprise',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
        },
        {
            id: 'pitch-deck',
            title: 'Video Pitch Decks',
            description: 'Transform your pitch deck into engaging video presentations that captivate investors.',
            category: 'enterprise',
            image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
        },
    ];

    const filteredUseCases = activeFilter === 'all'
        ? useCases
        : useCases.filter(uc => uc.category === activeFilter);

    const featuredUseCase = useCases.find(uc => uc.featured && (activeFilter === 'all' || uc.category === activeFilter));

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Built for <span className="gradient-text">every workflow</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            Discover how creators, studios, and enterprises use Nebula to transform their content creation process.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 border-b border-[var(--marketing-border)] sticky top-16 md:top-20 z-40 bg-[var(--marketing-bg)]">
                <div className="container-marketing">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <Filter className="w-5 h-5 text-[var(--marketing-muted)] flex-shrink-0" />
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter.id
                                        ? 'bg-[var(--marketing-accent)] text-[var(--marketing-bg)]'
                                        : 'bg-[var(--marketing-card)] text-[var(--marketing-muted)] hover:text-white border border-[var(--marketing-border)]'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Use Case */}
            {featuredUseCase && (
                <section className="section-padding border-b border-[var(--marketing-border)]">
                    <div className="container-marketing">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-[var(--marketing-accent)]/20 text-[var(--marketing-accent)] text-sm font-medium mb-4">
                                    Featured
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    {featuredUseCase.title}
                                </h2>
                                <p className="text-[var(--marketing-muted)] text-lg mb-6">
                                    {featuredUseCase.description}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setIsBookDemoOpen(true)}
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        Try It Now
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
                                        <Play className="w-4 h-4" />
                                        Watch Demo
                                    </Link>
                                </div>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden aspect-video group">
                                <img
                                    src={featuredUseCase.image}
                                    alt={featuredUseCase.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                                    <button className="w-16 h-16 rounded-full bg-[var(--marketing-accent)] flex items-center justify-center hover:scale-110 transition-transform">
                                        <Play className="w-6 h-6 text-[var(--marketing-bg)] ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Use Cases Grid */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUseCases.map((useCase) => (
                            <div
                                key={useCase.id}
                                id={useCase.id}
                                className="use-case-card group h-72 flex flex-col justify-end p-6 cursor-pointer"
                                onClick={() => setIsBookDemoOpen(true)}
                            >
                                <img
                                    src={useCase.image}
                                    alt={useCase.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="use-case-card-content">
                                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-white/10 text-white/80 mb-2 capitalize">
                                        {useCase.category}
                                    </span>
                                    <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                                    <p className="text-gray-300 text-sm line-clamp-2">{useCase.description}</p>
                                    <div className="mt-4 flex items-center gap-2 text-[var(--marketing-accent)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Explore
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-t border-[var(--marketing-border)]">
                <div className="container-marketing text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Start creating with Nebula
                    </h2>
                    <p className="text-[var(--marketing-muted)] text-lg max-w-xl mx-auto mb-8">
                        Whatever your use case, Nebula's AI is ready to help you create stunning content.
                    </p>
                    <button
                        onClick={() => setIsBookDemoOpen(true)}
                        className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
                    >
                        Book a Demo
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default UseCases;
