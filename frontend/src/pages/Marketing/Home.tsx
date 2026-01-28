import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Globe } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';
import GSAPTransition from '@/components/ui/GSAPTransition';
import GSAPScrollSection from '@/components/ui/GSAPScrollSection';
import BentoGrid from '@/components/marketing/BentoGrid';
import LogoTicker from '@/components/marketing/LogoTicker';
import ComplianceSection from '@/components/marketing/ComplianceSection';
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
        { value: '4', label: 'Foundation Models' },
        { value: '<400ms', label: 'Inference Latency' },
        { value: '8K', label: 'Resolution Support' },
        { value: '100%', label: 'Commercial Rights' },
    ];

    // Testimonials removed as per optimization request


    return (
        <div ref={container} className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center bg-black overflow-hidden perspective-1000">
                <div className="container-marketing relative z-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-badge inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[var(--marketing-accent)]/30 bg-[var(--marketing-accent)]/10 backdrop-blur-3xl mb-8 animate-fade-in-up">
                            <Sparkles className="w-4 h-4 text-[var(--marketing-accent)]" />
                            <span className="text-sm font-bold text-[var(--marketing-accent)] tracking-wider uppercase">
                                Nebula Studio v1.0 — Public Beta
                            </span>
                        </div>

                        <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter mix-blend-screen">
                            The Multi-Model <br />
                            <span className="gradient-text">AI Foundry</span>
                        </h1>

                        <p className="hero-description text-xl md:text-2xl text-[var(--marketing-muted)] mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                            Orchestrate next-generation cinematic foundation models into a single, unified creative workflow.
                        </p>

                        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
                            >
                                Start Creating
                                <ArrowRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <Link
                                to="/pricing"
                                className="px-8 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
                            >
                                <Globe className="w-5 h-5" />
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tech Visuals - Neural Orb & Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--marketing-accent)]/20 rounded-full blur-[120px] animate-pulse-slow" />

                    {/* Rotating Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-[var(--marketing-accent)]/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_15s_linear_infinite]" />

                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
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
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                            Nebula Engine <span className="gradient-text">Architecture</span>
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-xl max-w-3xl mx-auto">
                            A unified inference layer wrapping the world's most powerful foundation models.
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



            {/* Compliance Section */}
            <ComplianceSection />

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
