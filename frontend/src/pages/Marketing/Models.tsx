import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Zap, Brain, Shield, Globe, Code } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Models = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

    const models = [
        {
            name: 'Gen-4 Video',
            description: 'Our flagship video generation model. Creates cinema-quality video from text or images.',
            version: 'v4.2',
            status: 'Stable',
            capabilities: [
                'Text-to-video generation',
                'Image-to-video animation',
                'Up to 4K resolution',
                '60 second generation',
                'Motion control',
                'Style consistency',
            ],
            specs: {
                latency: '~30s for 10s video',
                accuracy: '94.2%',
                languages: '50+',
            },
        },
        {
            name: 'Gen-4 Image',
            description: 'High-fidelity image generation with exceptional detail and style control.',
            version: 'v4.1',
            status: 'Stable',
            capabilities: [
                'Text-to-image generation',
                'Image editing & inpainting',
                'Up to 4096x4096',
                'Style transfer',
                'Character consistency',
                'Batch generation',
            ],
            specs: {
                latency: '~5s per image',
                accuracy: '96.8%',
                languages: '50+',
            },
        },
        {
            name: 'Audio Studio',
            description: 'Comprehensive audio model for voice, music, and sound effects.',
            version: 'v3.5',
            status: 'Stable',
            capabilities: [
                'Voice synthesis',
                'Voice cloning',
                'Music generation',
                'Sound effects',
                'Audio enhancement',
                'Multi-speaker support',
            ],
            specs: {
                latency: '~2s per minute',
                accuracy: '97.1%',
                languages: '30+',
            },
        },
        {
            name: 'Motion Pro',
            description: 'Advanced motion and animation model for precise control over movement.',
            version: 'v2.0',
            status: 'Beta',
            capabilities: [
                'Camera path control',
                'Object tracking',
                'Physics simulation',
                'Character rigging',
                'Lip sync',
                'Motion capture',
            ],
            specs: {
                latency: '~15s per scene',
                accuracy: '91.5%',
                languages: 'N/A',
            },
        },
    ];

    const features = [
        {
            icon: Cpu,
            title: 'State-of-the-Art Architecture',
            description: 'Built on transformer architecture with proprietary optimizations for video understanding.',
        },
        {
            icon: Zap,
            title: 'Optimized Inference',
            description: 'Fast inference times with dynamic batching and intelligent caching.',
        },
        {
            icon: Brain,
            title: 'Continuous Learning',
            description: 'Models improve continuously based on user feedback and new training data.',
        },
        {
            icon: Shield,
            title: 'Safety First',
            description: 'Built-in content moderation and safety filters to ensure responsible AI use.',
        },
        {
            icon: Globe,
            title: 'Global Availability',
            description: 'Deployed across multiple regions for low-latency access worldwide.',
        },
        {
            icon: Code,
            title: 'Developer Friendly',
            description: 'Comprehensive API with SDKs for Python, JavaScript, and more.',
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            <span className="gradient-text">AI Models</span> powering Nebula
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            World-class AI models trained on massive datasets to understand and generate stunning visual content.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/resources#api" className="btn-primary px-8 py-4 inline-flex items-center gap-2">
                                <Code className="w-5 h-5" />
                                API Documentation
                            </Link>
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="btn-secondary px-8 py-4"
                            >
                                Book a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Models Grid */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Our Model Family
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            Each model is purpose-built for specific tasks while working seamlessly together.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {models.map((model) => (
                            <div key={model.name} className="glass-card p-6 hover:border-[var(--marketing-accent)]/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{model.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[var(--marketing-muted)] text-sm">{model.version}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${model.status === 'Stable'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {model.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-[var(--marketing-accent)]" />
                                    </div>
                                </div>
                                <p className="text-[var(--marketing-muted)] mb-6">{model.description}</p>

                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-white mb-3">Capabilities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {model.capabilities.map((cap) => (
                                            <span
                                                key={cap}
                                                className="px-3 py-1 rounded-full bg-[var(--marketing-card)] border border-[var(--marketing-border)] text-xs text-[var(--marketing-muted)]"
                                            >
                                                {cap}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--marketing-border)]">
                                    <div>
                                        <div className="text-xs text-[var(--marketing-muted)] mb-1">Latency</div>
                                        <div className="text-sm text-white font-medium">{model.specs.latency}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[var(--marketing-muted)] mb-1">Accuracy</div>
                                        <div className="text-sm text-white font-medium">{model.specs.accuracy}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[var(--marketing-muted)] mb-1">Languages</div>
                                        <div className="text-sm text-white font-medium">{model.specs.languages}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Features */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Enterprise-grade infrastructure
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            Built for reliability, scalability, and performance at any scale.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="feature-card">
                                <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-[var(--marketing-accent)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-[var(--marketing-muted)] text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* API CTA */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="glass-card p-8 md:p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Build with our API
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-xl mx-auto mb-8">
                            Integrate Nebula's AI models into your applications with our comprehensive REST API.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/resources#api"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Code className="w-5 h-5" />
                                View API Docs
                            </Link>
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="btn-secondary inline-flex items-center gap-2"
                            >
                                Contact Sales
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Models;
