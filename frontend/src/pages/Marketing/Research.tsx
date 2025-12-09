import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ExternalLink, Award, Users } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Research = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

    const publications = [
        {
            title: 'Gen-4: Scaling Visual Generation with Multimodal Transformers',
            authors: 'A. Smith, B. Johnson, C. Williams et al.',
            venue: 'NeurIPS 2024',
            date: 'December 2024',
            abstract: 'We present Gen-4, a multimodal transformer architecture that achieves state-of-the-art results in video generation tasks.',
            link: '#',
            featured: true,
        },
        {
            title: 'Temporal Consistency in AI-Generated Video: A Framework',
            authors: 'D. Lee, E. Chen, F. Martinez',
            venue: 'CVPR 2024',
            date: 'June 2024',
            abstract: 'Novel approach to maintaining temporal consistency across frames in generated video content.',
            link: '#',
        },
        {
            title: 'AudioVision: Aligned Audio and Visual Generation',
            authors: 'G. Brown, H. Davis, I. Wilson',
            venue: 'ICML 2024',
            date: 'July 2024',
            abstract: 'A unified model for generating synchronized audio and visual content from text prompts.',
            link: '#',
        },
        {
            title: 'Efficient Inference for High-Resolution Video Synthesis',
            authors: 'J. Taylor, K. Anderson, L. Thomas',
            venue: 'ICLR 2024',
            date: 'May 2024',
            abstract: 'Techniques for efficient inference enabling real-time preview of high-resolution generated videos.',
            link: '#',
        },
        {
            title: 'StyleControl: Fine-Grained Style Manipulation in Video',
            authors: 'M. Jackson, N. White, O. Harris',
            venue: 'SIGGRAPH 2024',
            date: 'August 2024',
            abstract: 'A method for precise control over visual style attributes during video generation.',
            link: '#',
        },
    ];

    const stats = [
        { value: '50+', label: 'Research Papers' },
        { value: '100+', label: 'Research Team' },
        { value: '15', label: 'Patents Filed' },
        { value: '10', label: 'Academic Partners' },
    ];

    const openSource = [
        {
            name: 'nebula-core',
            description: 'Core inference library for Nebula models',
            stars: '12.5k',
            language: 'Python',
        },
        {
            name: 'nebula-js-sdk',
            description: 'JavaScript/TypeScript SDK for Nebula API',
            stars: '3.2k',
            language: 'TypeScript',
        },
        {
            name: 'video-bench',
            description: 'Benchmarking suite for video generation models',
            stars: '5.8k',
            language: 'Python',
        },
        {
            name: 'style-transfer-toolkit',
            description: 'Tools for style transfer and manipulation',
            stars: '2.1k',
            language: 'Python',
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Pushing the boundaries of <span className="gradient-text">AI</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            Explore our research in video generation, multimodal AI, and creative technology.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 border-y border-[var(--marketing-border)]">
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

            {/* Featured Publication */}
            {publications.filter(p => p.featured).map((pub) => (
                <section key={pub.title} className="section-padding">
                    <div className="container-marketing">
                        <div className="glass-card p-8 md:p-12">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-[var(--marketing-accent)]" />
                                <span className="text-[var(--marketing-accent)] text-sm font-medium">Featured Research</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{pub.title}</h2>
                            <p className="text-[var(--marketing-muted)] mb-4">{pub.authors}</p>
                            <p className="text-gray-300 mb-6">{pub.abstract}</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <span className="px-3 py-1 rounded-full bg-[var(--marketing-accent)]/20 text-[var(--marketing-accent)] text-sm">
                                    {pub.venue}
                                </span>
                                <span className="text-[var(--marketing-muted)] text-sm">{pub.date}</span>
                                <a
                                    href={pub.link}
                                    className="inline-flex items-center gap-2 text-[var(--marketing-accent)] hover:underline sm:ml-auto"
                                >
                                    Read Paper
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Publications List */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        Recent Publications
                    </h2>
                    <div className="space-y-6">
                        {publications.filter(p => !p.featured).map((pub) => (
                            <div
                                key={pub.title}
                                className="glass-card p-6 hover:border-[var(--marketing-accent)]/30 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2">{pub.title}</h3>
                                        <p className="text-[var(--marketing-muted)] text-sm mb-2">{pub.authors}</p>
                                        <p className="text-gray-300 text-sm">{pub.abstract}</p>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end gap-2">
                                        <span className="px-3 py-1 rounded-full bg-[var(--marketing-card)] border border-[var(--marketing-border)] text-sm text-gray-300">
                                            {pub.venue}
                                        </span>
                                        <span className="text-[var(--marketing-muted)] text-sm">{pub.date}</span>
                                        <a
                                            href={pub.link}
                                            className="inline-flex items-center gap-2 text-[var(--marketing-accent)] text-sm hover:underline"
                                        >
                                            <FileText className="w-4 h-4" />
                                            PDF
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Source */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Open Source
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto">
                            We believe in giving back to the community. Check out our open source projects.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {openSource.map((repo) => (
                            <a
                                key={repo.name}
                                href={`https://github.com/nebula/${repo.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="feature-card group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-[var(--marketing-accent)] transition-colors">
                                        {repo.name}
                                    </h3>
                                    <ExternalLink className="w-5 h-5 text-[var(--marketing-muted)] group-hover:text-[var(--marketing-accent)]" />
                                </div>
                                <p className="text-[var(--marketing-muted)] text-sm mb-4">{repo.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-gray-300">
                                        ⭐ {repo.stars}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-[var(--marketing-card)] text-[var(--marketing-muted)]">
                                        {repo.language}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-t border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <div className="glass-card p-8 md:p-12 text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-[var(--marketing-accent)]" />
                            <span className="text-[var(--marketing-muted)]">Join our research team</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Help us shape the future of AI
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg max-w-2xl mx-auto mb-8">
                            We're looking for talented researchers and engineers to join our mission.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/company#careers" className="btn-primary inline-flex items-center gap-2">
                                View Open Positions
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="btn-secondary"
                            >
                                Research Partnerships
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Research;
