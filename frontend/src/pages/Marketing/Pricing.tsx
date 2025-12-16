import { useState } from 'react';
import { Check, ArrowRight, HelpCircle, X } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';

const Pricing = () => {
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

    const plans = [
        {
            name: 'Free',
            description: 'Perfect for trying out Nebula',
            price: { monthly: 0, yearly: 0 },
            features: [
                '50 video generations/month',
                '720p resolution',
                '10 second max duration',
                'Basic image generation',
                'Community support',
                'Watermarked outputs',
            ],
            notIncluded: [
                'API access',
                'Priority rendering',
                'Custom models',
            ],
            cta: 'Get Started Free',
            highlighted: false,
        },
        {
            name: 'Pro',
            description: 'For creators and small teams',
            price: { monthly: 49, yearly: 39 },
            features: [
                '500 video generations/month',
                '4K resolution',
                '60 second max duration',
                'Full image suite',
                'Audio generation',
                'Priority support',
                'No watermarks',
                'API access',
                'Priority rendering',
            ],
            notIncluded: [
                'Custom models',
            ],
            cta: 'Start Pro Trial',
            highlighted: true,
        },
        {
            name: 'Enterprise',
            description: 'For teams and organizations',
            price: { monthly: null, yearly: null },
            features: [
                'Unlimited generations',
                '8K resolution',
                'Unlimited duration',
                'All features included',
                'Dedicated support',
                'Custom models',
                'SLA guarantee',
                'SSO & SAML',
                'Custom integrations',
                'On-premise option',
            ],
            notIncluded: [],
            cta: 'Contact Sales',
            highlighted: false,
        },
    ];

    const faqs = [
        {
            question: 'What counts as a video generation?',
            answer: 'Each video generation request counts as one generation, regardless of the length or resolution. Failed generations are not counted against your quota.',
        },
        {
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle.',
        },
        {
            question: 'Is there a free trial for Pro?',
            answer: 'Yes, we offer a 14-day free trial of Pro with full access to all features. No credit card required to start.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise customers.',
        },
        {
            question: 'Do unused generations roll over?',
            answer: 'No, unused generations do not roll over to the next month. We recommend upgrading if you consistently need more generations.',
        },
        {
            question: 'What is your refund policy?',
            answer: 'We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions can be cancelled at any time.',
        },
    ];

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding hero-gradient">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Simple, transparent <span className="gradient-text">pricing</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--marketing-muted)] mb-8">
                            Start free, scale as you grow. No hidden fees, no surprises.
                        </p>
                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-4 p-1 rounded-full bg-[var(--marketing-card)] border border-[var(--marketing-border)]">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'monthly'
                                    ? 'bg-[var(--marketing-accent)] text-[var(--marketing-bg)]'
                                    : 'text-[var(--marketing-muted)] hover:text-white'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'yearly'
                                    ? 'bg-[var(--marketing-accent)] text-[var(--marketing-bg)]'
                                    : 'text-[var(--marketing-muted)] hover:text-white'
                                    }`}
                            >
                                Yearly
                                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Save 20%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="section-padding -mt-8">
                <div className="container-marketing">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`pricing-card ${plan.highlighted ? 'featured' : ''}`}
                            >
                                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-[var(--marketing-muted)] text-sm mb-6">{plan.description}</p>

                                <div className="mb-6">
                                    {plan.price[billingPeriod] !== null ? (
                                        <>
                                            <span className="text-4xl font-bold text-white">
                                                ${plan.price[billingPeriod]}
                                            </span>
                                            <span className="text-[var(--marketing-muted)]">/month</span>
                                            {billingPeriod === 'yearly' && plan.price.yearly !== null && plan.price.yearly !== 0 && (
                                                <p className="text-sm text-[var(--marketing-muted)] mt-1">
                                                    Billed annually (${plan.price.yearly * 12}/year)
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-white">Custom pricing</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => plan.name === 'Enterprise' ? setIsBookDemoOpen(true) : null}
                                    className={`w-full mb-6 ${plan.highlighted ? 'btn-primary' : 'btn-secondary'
                                        }`}
                                >
                                    {plan.cta}
                                </button>

                                <div className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-[var(--marketing-accent)] flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.notIncluded.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <X className="w-5 h-5 text-[var(--marketing-muted)] flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-[var(--marketing-muted)]">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-y border-[var(--marketing-border)]">
                <div className="container-marketing">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        Compare plans
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <th className="text-left py-4 text-[var(--marketing-muted)] font-medium">Feature</th>
                                    <th className="text-center py-4 text-white font-medium">Free</th>
                                    <th className="text-center py-4 text-white font-medium">Pro</th>
                                    <th className="text-center py-4 text-white font-medium">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">Video generations/month</td>
                                    <td className="py-4 text-center text-[var(--marketing-muted)]">50</td>
                                    <td className="py-4 text-center text-white">500</td>
                                    <td className="py-4 text-center text-[var(--marketing-accent)]">Unlimited</td>
                                </tr>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">Max resolution</td>
                                    <td className="py-4 text-center text-[var(--marketing-muted)]">720p</td>
                                    <td className="py-4 text-center text-white">4K</td>
                                    <td className="py-4 text-center text-[var(--marketing-accent)]">8K</td>
                                </tr>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">Max video duration</td>
                                    <td className="py-4 text-center text-[var(--marketing-muted)]">10s</td>
                                    <td className="py-4 text-center text-white">60s</td>
                                    <td className="py-4 text-center text-[var(--marketing-accent)]">Unlimited</td>
                                </tr>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">API access</td>
                                    <td className="py-4 text-center"><X className="w-5 h-5 text-[var(--marketing-muted)] mx-auto" /></td>
                                    <td className="py-4 text-center"><Check className="w-5 h-5 text-[var(--marketing-accent)] mx-auto" /></td>
                                    <td className="py-4 text-center"><Check className="w-5 h-5 text-[var(--marketing-accent)] mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">Priority rendering</td>
                                    <td className="py-4 text-center"><X className="w-5 h-5 text-[var(--marketing-muted)] mx-auto" /></td>
                                    <td className="py-4 text-center"><Check className="w-5 h-5 text-[var(--marketing-accent)] mx-auto" /></td>
                                    <td className="py-4 text-center"><Check className="w-5 h-5 text-[var(--marketing-accent)] mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">Custom models</td>
                                    <td className="py-4 text-center"><X className="w-5 h-5 text-[var(--marketing-muted)] mx-auto" /></td>
                                    <td className="py-4 text-center"><X className="w-5 h-5 text-[var(--marketing-muted)] mx-auto" /></td>
                                    <td className="py-4 text-center"><Check className="w-5 h-5 text-[var(--marketing-accent)] mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-[var(--marketing-border)]">
                                    <td className="py-4 text-gray-300">Support</td>
                                    <td className="py-4 text-center text-[var(--marketing-muted)]">Community</td>
                                    <td className="py-4 text-center text-white">Priority</td>
                                    <td className="py-4 text-center text-[var(--marketing-accent)]">Dedicated</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section-padding">
                <div className="container-marketing">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                            Frequently asked questions
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="glass-card overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-medium text-white pr-4">{faq.question}</span>
                                        <HelpCircle className={`w-5 h-5 text-[var(--marketing-accent)] flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''
                                            }`} />
                                    </button>
                                    {openFaq === index && (
                                        <div className="px-6 pb-6 text-[var(--marketing-muted)]">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-[var(--marketing-card)]/30 border-t border-[var(--marketing-border)]">
                <div className="container-marketing text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-[var(--marketing-muted)] text-lg max-w-xl mx-auto mb-8">
                        Our team is here to help. Book a demo to discuss your needs.
                    </p>
                    <button
                        onClick={() => setIsBookDemoOpen(true)}
                        className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
                    >
                        Talk to Sales
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <BookDemoModal isOpen={isBookDemoOpen} onClose={() => setIsBookDemoOpen(false)} />
        </>
    );
};

export default Pricing;
