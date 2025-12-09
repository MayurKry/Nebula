import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Zap, Video, Wand2, Users, Globe, ChevronRight } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Home = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

    const features = [
        {
            icon: Video,
            title: 'AI Video Generation',
            description: 'Create stunning videos from text prompts in minutes. Our AI understands context, style, and emotion.',
        },
        {
            icon: Wand2,
            title: 'Intelligent Storyboarding',
            description: 'Automatically generate shot-by-shot storyboards from your scripts with AI-powered scene composition.',
        },
        {
            icon: Sparkles,
            title: 'Style Transfer & VFX',
            description: 'Apply any visual style to your videos. Add professional visual effects with simple text commands.',
        },
        {
            icon: Zap,
            title: 'Real-time Rendering',
            description: 'Experience lightning-fast rendering with our optimized cloud infrastructure. No more waiting.',
        },
    ];

    const useCases = [
        {
            title: 'Marketing & Ads',
            description: 'Create compelling video ads that convert. Personalize at scale.',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
            href: '/use-cases#marketing',
        },
        {
            title: 'Film & Entertainment',
            description: 'Pre-vis, concept videos, and VFX for productions of any size.',
            image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
            href: '/use-cases#entertainment',
        },
        {
            title: 'Education & Training',
            description: 'Engaging educational content that adapts to different learning styles.',
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
            href: '/use-cases#education',
        },
    ];

    const stats = [
        { value: '10M+', label: 'Videos Created' },
        { value: '500K+', label: 'Active Creators' },
        { value: '99.9%', label: 'Uptime' },
        { value: '150+', label: 'Countries' },
    ];

    const testimonials = [
        {
            quote: "Nebula has completely transformed our content production. What used to take weeks now takes hours.",
            author: "Sarah Chen",
            role: "Creative Director",
            company: "MediaFlow Studios",
        },
        {
            quote: "The AI understands exactly what I'm looking for. It's like having a whole production team at my fingertips.",
            author: "Marcus Williams",
            role: "Independent Filmmaker",
            company: "",
        },
        {
            quote: "We've cut our video production costs by 80% while actually improving quality. Game-changing.",
            author: "Elena Rodriguez",
            role: "VP of Marketing",
            company: "TechScale Inc.",
        },
    ];

    const partners = [
        { name: 'Google', logo: 'G' },
        { name: 'Microsoft', logo: 'M' },
        { name: 'Amazon', logo: 'A' },
        { name: 'Meta', logo: 'M' },
        { name: 'Netflix', logo: 'N' },
        { name: 'Spotify', logo: 'S' },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
                <div className="container-marketing relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--marketing-border)] bg-[var(--marketing-card)] mb-6 animate-fade-in">
                            <Sparkles className="w-4 h-4 text-[var(--marketing-accent)]" />
                            <span className="text-sm text-[var(--marketing-muted)]">
                                Introducing Nebula 2.0 — Now with Gen-4 AI
                            </span>
                            <ChevronRight className="w-4 h-4 text-[var(--marketing-muted)]" />
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                            Create stunning videos with{' '}
                            <span className="gradient-text">AI power</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-1">
                            Transform your ideas into professional video content in minutes.
                            Nebula's AI understands your vision and brings it to life.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="btn-primary text-base px-8 py-4 flex items-center gap-2 animate-pulse-glow"
                            >
                                Book a Demo
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <Link
                                to="/products"
                                className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Watch Video
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--marketing-accent)]/5 blur-3xl" />
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl" />
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-16 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <p className="text-center text-[var(--marketing-muted)] text-sm mb-8 uppercase tracking-wider">
                        Trusted by leading companies worldwide
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        {partners.map((partner) => (
                            <div
                                key={partner.name}
                                className="w-16 h-16 rounded-xl bg-[var(--marketing-card)] border border-[var(--marketing-border)] flex items-center justify-center text-2xl font-bold text-[var(--marketing-muted)] hover:text-[var(--marketing-accent)] hover:border-[var(--marketing-accent)]/30 transition-all cursor-pointer"
                            >
                                {partner.logo}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Everything you need to create
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            Powerful AI tools designed to streamline your creative workflow and bring your vision to life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="feature-card group"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--marketing-accent)]/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-[var(--marketing-accent)]" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-[var(--marketing-muted)]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-[var(--marketing-border)] bg-[var(--marketing-card)]/30">
                <div className="container-marketing">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="stat-value">{stat.value}</div>
                                <div className="text-[var(--marketing-muted)] mt-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Preview */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                Built for every workflow
                            </h2>
                            <p className="text-[var(--marketing-muted)] text-lg max-w-xl">
                                From marketing to entertainment, Nebula adapts to your creative needs.
                            </p>
                        </div>
                        <Link
                            to="/use-cases"
                            className="mt-6 md:mt-0 flex items-center gap-2 text-[var(--marketing-accent)] hover:underline"
                        >
                            View all use cases
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {useCases.map((useCase) => (
                            <Link
                                key={useCase.title}
                                to={useCase.href}
                                className="use-case-card group h-80 flex flex-col justify-end p-6"
                            >
                                <img
                                    src={useCase.image}
                                    alt={useCase.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="use-case-card-content">
                                    <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                                    <p className="text-gray-300 text-sm">{useCase.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="section-padding bg-[var(--marketing-card)]/30">
                <div className="container-marketing">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Loved by creators worldwide
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            Join thousands of creators, studios, and brands who trust Nebula.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="glass-card p-6">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-[var(--marketing-accent)]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-white mb-4 text-lg">"{testimonial.quote}"</p>
                                <div>
                                    <div className="font-semibold text-white">{testimonial.author}</div>
                                    <div className="text-[var(--marketing-muted)] text-sm">
                                        {testimonial.role}{testimonial.company && `, ${testimonial.company}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="glass-card p-8 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--marketing-accent)]/10 to-purple-500/10" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Users className="w-5 h-5 text-[var(--marketing-accent)]" />
                                <span className="text-[var(--marketing-muted)]">Join 500,000+ creators</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                Ready to transform your creative workflow?
                            </h2>
                            <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto mb-8">
                                Start creating stunning videos today. No credit card required for free tier.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => setIsBookDemoOpen(true)}
                                    className="btn-primary text-base px-8 py-4 flex items-center gap-2"
                                >
                                    Book a Demo
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <Link
                                    to="/pricing"
                                    className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
                                >
                                    <Globe className="w-5 h-5" />
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Home;
