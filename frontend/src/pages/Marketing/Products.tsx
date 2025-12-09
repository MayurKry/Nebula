import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Image, Music, Wand2, Layers, Zap, Code, Cloud, ArrowRight, Check } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Products = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

    const products = [
        {
            id: 'video-generation',
            icon: Video,
            title: 'AI Video Generation',
            description: 'Create stunning videos from text prompts, images, or rough sketches. Our Gen-4 AI model understands context, style, and emotion to produce cinema-quality results.',
            features: [
                'Text-to-video generation',
                'Image-to-video animation',
                'Style consistency across scenes',
                'Up to 4K resolution output',
                'Variable duration (5s to 60s)',
                'Motion control and camera paths',
            ],
            image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80',
        },
        {
            id: 'image-creation',
            icon: Image,
            title: 'Image Creation Suite',
            description: 'Generate, edit, and enhance images with AI. From concept art to product shots, create exactly what you envision.',
            features: [
                'Text-to-image generation',
                'Image editing & inpainting',
                'Background removal & replacement',
                'Upscaling and enhancement',
                'Style transfer',
                'Batch processing',
            ],
            image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
        },
        {
            id: 'audio-suite',
            icon: Music,
            title: 'Audio Suite',
            description: 'Complete audio solution for your videos. Generate music, voiceovers, and sound effects that perfectly match your content.',
            features: [
                'AI voice generation',
                'Music composition',
                'Sound effect library',
                'Voice cloning',
                'Audio enhancement',
                'Multi-language support',
            ],
            image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
        },
        {
            id: 'storyboard',
            icon: Layers,
            title: 'Storyboard Creator',
            description: 'Transform your scripts into visual storyboards automatically. Plan your shots, visualize sequences, and iterate quickly.',
            features: [
                'Script-to-storyboard conversion',
                'Shot composition suggestions',
                'Character consistency',
                'Scene breakdown',
                'Export to video',
                'Collaboration tools',
            ],
            image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
        },
    ];

    const capabilities = [
        {
            icon: Wand2,
            title: 'Smart Editing',
            description: 'AI-powered editing tools that understand your intent and suggest improvements.',
        },
        {
            icon: Zap,
            title: 'Real-time Preview',
            description: 'See results instantly as you create. No more waiting for renders.',
        },
        {
            icon: Cloud,
            title: 'Cloud Processing',
            description: 'Powerful cloud infrastructure handles the heavy lifting. Create from any device.',
        },
        {
            icon: Code,
            title: 'API Access',
            description: 'Integrate Nebula into your workflow with our comprehensive REST API.',
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Powerful AI tools for <span className="gradient-text">creators</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            Everything you need to create stunning video content. From ideation to final export, Nebula handles it all.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="btn-primary text-base px-8 py-4 flex items-center gap-2"
                            >
                                Book a Demo
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <Link to="/pricing" className="btn-secondary text-base px-8 py-4">
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="space-y-24">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                id={product.id}
                                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                    }`}
                            >
                                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--marketing-accent)]/10 flex items-center justify-center mb-6">
                                        <product.icon className="w-7 h-7 text-[var(--marketing-accent)]" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                        {product.title}
                                    </h2>
                                    <p className="text-[var(--marketing-muted)] text-lg mb-6">
                                        {product.description}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {product.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-gray-300">
                                                <Check className="w-5 h-5 text-[var(--marketing-accent)] flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        to={`/products#${product.id}`}
                                        className="inline-flex items-center gap-2 text-[var(--marketing-accent)] hover:underline"
                                    >
                                        Learn more
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                                    <div className="relative rounded-2xl overflow-hidden aspect-video">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Built for professionals
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            Enterprise-grade capabilities designed to scale with your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {capabilities.map((cap) => (
                            <div key={cap.title} className="feature-card text-center">
                                <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center mx-auto mb-4">
                                    <cap.icon className="w-6 h-6 text-[var(--marketing-accent)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{cap.title}</h3>
                                <p className="text-[var(--marketing-muted)] text-sm">{cap.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="glass-card p-8 md:p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-xl mx-auto mb-8">
                            Experience the power of Nebula's AI tools. Book a personalized demo today.
                        </p>
                        <button
                            onClick={() => setIsBookDemoOpen(true)}
                            className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
                        >
                            Book a Demo
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Products;
