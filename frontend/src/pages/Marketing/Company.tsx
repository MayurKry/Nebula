import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Mail, Users, Target, Lightbulb, Heart } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Company = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

    const timeline = [
        { year: '2021', title: 'Founded', description: 'Nebula was founded with a mission to democratize video creation.' },
        { year: '2022', title: 'Seed Round', description: 'Raised $5M to build the foundational AI technology.' },
        { year: '2023', title: 'Gen-3 Launch', description: 'Launched Gen-3 model, reaching 100K creators.' },
        { year: '2024', title: 'Series A', description: 'Raised $50M to scale globally. 500K+ active creators.' },
    ];

    const values = [
        {
            icon: Target,
            title: 'Mission-Driven',
            description: 'We believe everyone should have access to powerful creative tools.',
        },
        {
            icon: Lightbulb,
            title: 'Innovation First',
            description: 'We push the boundaries of what AI can do for creativity.',
        },
        {
            icon: Heart,
            title: 'Creator-Centric',
            description: 'Every decision we make puts creators and their needs first.',
        },
        {
            icon: Users,
            title: 'Inclusive',
            description: 'We build tools that work for creators from all backgrounds.',
        },
    ];

    const team = [
        { name: 'Alex Chen', role: 'CEO & Co-Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
        { name: 'Sarah Johnson', role: 'CTO & Co-Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
        { name: 'Michael Park', role: 'VP of Research', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
        { name: 'Emily Davis', role: 'VP of Product', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
        { name: 'David Kim', role: 'VP of Engineering', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
        { name: 'Lisa Wang', role: 'VP of Design', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    ];

    const openPositions = [
        { title: 'Senior ML Engineer', location: 'San Francisco, CA', type: 'Full-time' },
        { title: 'Product Designer', location: 'Remote', type: 'Full-time' },
        { title: 'Frontend Engineer', location: 'New York, NY', type: 'Full-time' },
        { title: 'Research Scientist', location: 'San Francisco, CA', type: 'Full-time' },
        { title: 'Developer Relations', location: 'Remote', type: 'Full-time' },
    ];

    const pressItems = [
        { outlet: 'TechCrunch', title: 'Nebula raises $50M to bring AI video creation to the masses', date: 'Nov 2024' },
        { outlet: 'The Verge', title: 'How Nebula is changing the way we create video content', date: 'Oct 2024' },
        { outlet: 'Wired', title: 'The future of filmmaking is AI-powered', date: 'Sep 2024' },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            About <span className="gradient-text">Nebula</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            We're on a mission to empower everyone to create stunning video content with the power of AI.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="glass-card p-8">
                            <h3 className="text-sm font-semibold text-[var(--marketing-accent)] uppercase tracking-wider mb-4">Our Mission</h3>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                Democratize video creation
                            </h2>
                            <p className="text-[var(--marketing-muted)]">
                                We believe that everyone has stories worth telling. Our mission is to remove the technical barriers that prevent people from bringing their creative visions to life.
                            </p>
                        </div>
                        <div className="glass-card p-8">
                            <h3 className="text-sm font-semibold text-[var(--marketing-accent)] uppercase tracking-wider mb-4">Our Vision</h3>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                AI as creative partner
                            </h2>
                            <p className="text-[var(--marketing-muted)]">
                                We envision a future where AI amplifies human creativity, not replaces it. Where anyone can create professional-quality video content as easily as writing a document.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        Our Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value) => (
                            <div key={value.title} className="feature-card text-center">
                                <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="w-6 h-6 text-[var(--marketing-accent)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                                <p className="text-[var(--marketing-muted)] text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section-padding">
                <div className="container-marketing">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        Our Journey
                    </h2>
                    <div className="relative">
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[var(--marketing-border)]" />
                        <div className="space-y-12">
                            {timeline.map((item, index) => (
                                <div
                                    key={item.year}
                                    className={`relative flex items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    <div className={`hidden md:block flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                        <span className="stat-value text-3xl">{item.year}</span>
                                    </div>
                                    <div className="relative z-10 w-4 h-4 rounded-full bg-[var(--marketing-accent)] mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                        <span className="md:hidden text-[var(--marketing-accent)] font-bold text-lg">{item.year}</span>
                                        <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                        <p className="text-[var(--marketing-muted)]">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        Leadership Team
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {team.map((member) => (
                            <div key={member.name} className="text-center">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-4 border-2 border-[var(--marketing-border)]">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="font-semibold text-white text-sm md:text-base">{member.name}</h3>
                                <p className="text-[var(--marketing-muted)] text-xs md:text-sm">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Careers */}
            <section id="careers" className="section-padding">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Join the team
                        </h2>
                        <p className="text-[var(--marketing-muted)] text-lg">
                            We're looking for passionate people to help us build the future of AI creativity.
                        </p>
                    </div>
                    <div className="max-w-2xl mx-auto space-y-4">
                        {openPositions.map((job) => (
                            <div
                                key={job.title}
                                className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--marketing-accent)]/30 transition-all cursor-pointer"
                            >
                                <div>
                                    <h3 className="font-semibold text-white">{job.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-[var(--marketing-muted)] mt-1">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[var(--marketing-accent)]" />
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/careers" className="text-[var(--marketing-accent)] hover:underline inline-flex items-center gap-2">
                            View all positions
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Press */}
            <section id="press" className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        In the Press
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pressItems.map((item) => (
                            <div key={item.title} className="glass-card p-6 hover:border-[var(--marketing-accent)]/30 transition-all">
                                <span className="text-[var(--marketing-accent)] text-sm font-medium">{item.outlet}</span>
                                <h3 className="text-lg font-semibold text-white mt-2 mb-4">{item.title}</h3>
                                <span className="text-[var(--marketing-muted)] text-sm">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Want to work with us?
                            </h2>
                            <p className="text-[var(--marketing-muted)]">
                                Get in touch for partnerships, press inquiries, or just to say hello.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Contact Us
                            </Link>
                            <button
                                onClick={() => setIsBookDemoOpen(true)}
                                className="btn-secondary"
                            >
                                Book a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Company;
