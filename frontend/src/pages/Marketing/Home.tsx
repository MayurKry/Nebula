import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Users, Globe, ChevronRight } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';
import GSAPTransition from '@/components/ui/GSAPTransition';
import GSAPScrollSection from '@/components/ui/GSAPScrollSection';
import BentoGrid from '@/components/marketing/BentoGrid';
import LogoTicker from '@/components/marketing/LogoTicker';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const container = useRef<HTMLDivElement>(null);
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

    useGSAP(() => {
        // Complex Hero Entrance Animation - Keep as manual for fine control
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.8 })
            .from('.hero-title', { y: 40, opacity: 0, duration: 1 }, '-=0.4')
            .from('.hero-description', { y: 30, opacity: 0, duration: 1 }, '-=0.6')
            .from('.hero-cta', { scale: 0.9, opacity: 0, duration: 0.8, stagger: 0.2 }, '-=0.5');

        // Background floating animation
        gsap.to('.bg-blob-1', {
            x: '30%',
            y: '20%',
            duration: 10,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        gsap.to('.bg-blob-2', {
            x: '-20%',
            y: '-30%',
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }, { scope: container });


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


    return (
        <div ref={container} className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
                <div className="container-marketing relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--marketing-border)] bg-[var(--marketing-card)] mb-6">
                            <Sparkles className="w-4 h-4 text-[var(--marketing-accent)]" />
                            <span className="text-sm text-[var(--marketing-muted)]">
                                Introducing Nebula 2.0 — Now with Gen-4 AI
                            </span>
                            <ChevronRight className="w-4 h-4 text-[var(--marketing-muted)]" />
                        </div>

                        <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            Create stunning videos with{' '}
                            <span className="gradient-text">AI power</span>
                        </h1>

                        <p className="hero-description text-lg md:text-xl text-[var(--marketing-muted)] mb-8 max-w-2xl mx-auto">
                            Transform your ideas into professional video content in minutes.
                            Nebula's AI understands your vision and brings it to life.
                        </p>

                        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
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
                    <div className="bg-blob-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--marketing-accent)]/5 blur-3xl" />
                    <div className="bg-blob-2 absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl" />
                </div>
            </section>

            {/* Client Logo Ticker */}
            <GSAPScrollSection animation="fade-in">
                <LogoTicker />
            </GSAPScrollSection>

            {/* Features Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Platform <span className="gradient-text">Powerhouse</span>
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            The technological foundation that makes Nebula the world's most capable AI video platform.
                        </p>
                    </div>

                    <GSAPScrollSection animation="fade-in-up" stagger={0.1}>
                        <BentoGrid />
                    </GSAPScrollSection>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section py-16 border-y border-[var(--marketing-border)] bg-[var(--marketing-card)]/30">
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

                    <GSAPScrollSection
                        animation="scale-in"
                        stagger={0.2}
                        start="top 90%"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {useCases.map((useCase) => (
                            <Link
                                key={useCase.title}
                                to={`/use-cases/${useCase.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                                className="use-case-card group h-80 flex flex-col justify-end p-6 border border-[var(--marketing-border)]"
                            >
                                <img
                                    src={useCase.image}
                                    alt={useCase.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="use-case-card-content">
                                    <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                                    <p className="text-gray-300 text-sm">{useCase.description}</p>
                                </div>
                            </Link>
                        ))}
                    </GSAPScrollSection>
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

                    <GSAPScrollSection animation="fade-in-up" stagger={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    </GSAPScrollSection>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <GSAPTransition animation="scale-in">
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
                    </GSAPTransition>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </div>
    );
};

export default Home;
