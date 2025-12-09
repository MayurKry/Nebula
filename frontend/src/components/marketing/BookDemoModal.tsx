import { useState } from 'react';
import { X } from 'lucide-react';

interface BookDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BookDemoModal = ({ isOpen, onClose }: BookDemoModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        role: '',
        useCase: '',
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

        // Reset form after 3 seconds and close modal
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                company: '',
                role: '',
                useCase: '',
                message: '',
            });
            onClose();
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-lg glass-card p-6 md:p-8 animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Book a Demo</h2>
                            <p className="text-[var(--marketing-muted)] text-sm mt-1">
                                See Nebula in action. Schedule a personalized demo.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--marketing-muted)] hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-[var(--marketing-accent)]/20 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[var(--marketing-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Demo Request Submitted!</h3>
                            <p className="text-[var(--marketing-muted)]">
                                We'll be in touch within 24 hours to schedule your demo.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        Work Email *
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="company" className="form-label">
                                        Company *
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="Acme Inc."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="role" className="form-label">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Product Manager"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="useCase" className="form-label">
                                    Primary Use Case
                                </label>
                                <select
                                    id="useCase"
                                    name="useCase"
                                    value={formData.useCase}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select a use case</option>
                                    <option value="marketing">Marketing & Advertising</option>
                                    <option value="entertainment">Film & Entertainment</option>
                                    <option value="education">Education & Training</option>
                                    <option value="social">Social Media Content</option>
                                    <option value="enterprise">Enterprise Solutions</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="form-label">
                                    Additional Information
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={3}
                                    className="form-input resize-none"
                                    placeholder="Tell us about your project or specific requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Request Demo'
                                )}
                            </button>

                            <p className="text-center text-[var(--marketing-muted)] text-xs mt-4">
                                By submitting, you agree to our{' '}
                                <a href="/privacy" className="text-[var(--marketing-accent)] hover:underline">
                                    Privacy Policy
                                </a>
                                .
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default BookDemoModal;
