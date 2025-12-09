import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Building, Clock } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            details: ['hello@nebula.ai', 'support@nebula.ai'],
        },
        {
            icon: Phone,
            title: 'Phone',
            details: ['+1 (555) 123-4567', 'Mon-Fri 9am-6pm PST'],
        },
        {
            icon: MapPin,
            title: 'Office',
            details: ['123 Innovation Drive', 'San Francisco, CA 94102'],
        },
    ];

    const inquiryTypes = [
        { icon: MessageSquare, title: 'General Inquiry', description: 'Questions about our products or services' },
        { icon: Building, title: 'Enterprise', description: 'Custom solutions for large organizations' },
        { icon: Clock, title: 'Support', description: 'Technical support and assistance' },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Get in <span className="gradient-text">Touch</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)]">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 border-b border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactInfo.map((info) => (
                            <div key={info.title} className="glass-card p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-[var(--marketing-accent)]/10 flex items-center justify-center mx-auto mb-4">
                                    <info.icon className="w-6 h-6 text-[var(--marketing-accent)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                                {info.details.map((detail, i) => (
                                    <p key={i} className="text-[var(--marketing-muted)] text-sm">{detail}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                Send us a message
                            </h2>

                            {isSubmitted ? (
                                <div className="glass-card p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-[var(--marketing-accent)]/20 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-[var(--marketing-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                                    <p className="text-[var(--marketing-muted)]">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="form-label">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="form-label">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="company" className="form-label">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Acme Inc."
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="form-label">
                                            Subject *
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="sales">Sales & Partnerships</option>
                                            <option value="enterprise">Enterprise Solutions</option>
                                            <option value="support">Technical Support</option>
                                            <option value="press">Press & Media</option>
                                            <option value="careers">Careers</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="form-label">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="form-input resize-none"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Inquiry Types */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                How can we help?
                            </h2>
                            <div className="space-y-4">
                                {inquiryTypes.map((type) => (
                                    <div key={type.title} className="glass-card p-6 hover:border-[var(--marketing-accent)]/30 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--marketing-accent)]/10 flex items-center justify-center flex-shrink-0">
                                                <type.icon className="w-5 h-5 text-[var(--marketing-accent)]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{type.title}</h3>
                                                <p className="text-[var(--marketing-muted)] text-sm mt-1">{type.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Office Hours */}
                            <div className="glass-card p-6 mt-6">
                                <h3 className="font-semibold text-white mb-4">Office Hours</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--marketing-muted)]">Monday - Friday</span>
                                        <span className="text-white">9:00 AM - 6:00 PM PST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--marketing-muted)]">Saturday</span>
                                        <span className="text-white">10:00 AM - 4:00 PM PST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--marketing-muted)]">Sunday</span>
                                        <span className="text-white">Closed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="glass-card p-6 mt-6 aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 text-[var(--marketing-accent)] mx-auto mb-4" />
                                    <p className="text-white font-medium">San Francisco, CA</p>
                                    <p className="text-[var(--marketing-muted)] text-sm">123 Innovation Drive</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contact;
