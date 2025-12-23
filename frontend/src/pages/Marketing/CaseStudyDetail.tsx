import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import GSAPScrollSection from '@/components/ui/GSAPScrollSection';

const useCasesData = [
    {
        id: 'ai-video-generation',
        title: 'AI Video Generation',
        description: 'How MediaFlow Studios reduced production time by 80% using Nebula\'s Gen-4 engine.',
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80',
        stats: [
            { label: 'Time Saved', value: '80%' },
            { label: 'ROI', value: '12x' },
            { label: 'Videos Created', value: '500+' },
        ],
        challenges: [
            'High production costs for high-quality marketing videos.',
            'Limited bandwidth of creative teams to produce daily content.',
            'Difficulty in maintaining brand consistency across different creators.'
        ],
        solution: 'MediaFlow integrated Nebula into their daily workflow, allowing their junior editors to generate preliminary scenes and VFX and fine-tuning only the final cuts.',
        results: [
            'Reduction in turnaround time from 2 weeks to 48 hours.',
            'Consistent visual language across all social media channels.',
            'Significant increase in creative experimentation without extra costs.'
        ]
    },
    {
        id: 'movie-trailer',
        title: 'Movie Trailer Generator',
        description: 'Pitching Hollywood: How a boutique agency used AI to greenlight a $50M project.',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80',
        stats: [
            { label: 'Budget Saved', value: '$200k' },
            { label: 'Stakeholder Approval', value: '100%' },
            { label: 'Pre-vis Scenes', value: '45' },
        ],
        challenges: [
            'Visualizing complex Sci-Fi concepts for investors.',
            'Expensive traditional pre-visualization and concept art.',
            'Short timelines for high-stakes presentations.'
        ],
        solution: 'The agency used Nebula to generate "mood reels" and character concept videos, creating a cinematic look and feel before any actual filming began.',
        results: [
            'Project greenlit within 2 weeks of presentation.',
            '90% accuracy in translating AI concept art to final cinematography.',
            'Avoided $200k in preliminary pre-vis costs.'
        ]
    },
    {
        id: 'ad-generator',
        title: 'AI Ad Generator',
        description: 'Scaling personalized ads for global brands without shattering the budget.',
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
        stats: [
            { label: 'CTR Increase', value: '45%' },
            { label: 'Ad Variants', value: '1,000+' },
            { label: 'CPA Reduction', value: '30%' },
        ],
        challenges: [
            'High cost of producing localized ad content for 20+ countries.',
            'A/B testing limitations due to creative production bottlenecks.',
            'Maintaining engagement across multiple demographics.'
        ],
        solution: 'Nebula\'s batch generation API was used to create thousands of localized variants of a core ad concept, with AI-driven style transfer for different markets.',
        results: [
            'Localized ads for 15 markets in under 24 hours.',
            '45% higher CTR due to better localization and testing.',
            '30% lower cost-per-acquisition across all digital platforms.'
        ]
    }
];

const CaseStudyDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [caseStudy, setCaseStudy] = useState<typeof useCasesData[0] | null>(null);

    useEffect(() => {
        // Find case study by ID or fallback to the first one for demo purposes
        const study = useCasesData.find(cs => cs.id === id) || useCasesData[0];
        setCaseStudy(study);
        window.scrollTo(0, 0);
    }, [id]);

    if (!caseStudy) return null;

    return (
        <div className="min-h-screen bg-[var(--marketing-bg)]">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={caseStudy.image}
                        alt={caseStudy.title}
                        className="w-full h-full object-cover opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[var(--marketing-bg)]" />
                </div>

                <div className="container-marketing relative z-10 text-center">
                    <GSAPTransition animation="fade-in-up">
                        <Link
                            to="/use-cases"
                            className="inline-flex items-center gap-2 text-[var(--marketing-accent)] mb-8 hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Use Cases
                        </Link>
                        <span className="block text-[var(--marketing-accent)] font-medium uppercase tracking-widest mb-4">
                            {caseStudy.category} Case Study
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            {caseStudy.title}
                        </h1>
                        <p className="text-xl text-[var(--marketing-muted)] max-w-3xl mx-auto">
                            {caseStudy.description}
                        </p>
                    </GSAPTransition>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-[var(--marketing-border)] bg-[var(--marketing-card)]/30">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {caseStudy.stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-[var(--marketing-accent)] mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-[var(--marketing-muted)] uppercase tracking-wider text-sm">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-12">
                            <GSAPScrollSection>
                                <h2 className="text-3xl font-bold text-white mb-6">The Challenge</h2>
                                <div className="space-y-4">
                                    {caseStudy.challenges.map((challenge, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                                                !
                                            </div>
                                            <p className="text-lg text-gray-300">{challenge}</p>
                                        </div>
                                    ))}
                                </div>
                            </GSAPScrollSection>

                            <GSAPScrollSection>
                                <h2 className="text-3xl font-bold text-white mb-6">The Nebula Solution</h2>
                                <p className="text-xl text-gray-400 leading-relaxed mb-8">
                                    {caseStudy.solution}
                                </p>
                                <div className="relative rounded-2xl overflow-hidden aspect-video bg-[var(--marketing-card)] border border-[var(--marketing-border)] group">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button className="w-20 h-20 rounded-full bg-[var(--marketing-accent)] flex items-center justify-center hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 text-[var(--marketing-bg)] ml-1" />
                                        </button>
                                    </div>
                                    <img
                                        src={caseStudy.image}
                                        alt="Solution Demo"
                                        className="w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </GSAPScrollSection>
                        </div>

                        <div className="space-y-12">
                            <GSAPScrollSection className="glass-card p-8">
                                <h3 className="text-2xl font-bold text-white mb-6">Key Results</h3>
                                <div className="space-y-6">
                                    {caseStudy.results.map((result, index) => (
                                        <div key={index} className="flex gap-4">
                                            <CheckCircle2 className="w-6 h-6 text-[var(--marketing-accent)] flex-shrink-0" />
                                            <p className="text-gray-300 font-medium">{result}</p>
                                        </div>
                                    ))}
                                </div>
                            </GSAPScrollSection>

                            <GSAPScrollSection className="bg-gradient-to-br from-[var(--marketing-accent)]/20 to-purple-500/20 rounded-2xl p-8 border border-[var(--marketing-accent)]/30">
                                <h4 className="text-xl font-bold text-white mb-4">Ready to see these results?</h4>
                                <p className="text-gray-400 mb-6">
                                    Join these industry leaders and transform your video production today.
                                </p>
                                <Link to="/contact" className="btn-primary w-full flex items-center justify-center gap-2">
                                    Book a Demo
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </GSAPScrollSection>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CaseStudyDetail;
