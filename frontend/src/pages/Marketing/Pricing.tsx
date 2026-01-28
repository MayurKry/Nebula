import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, HelpCircle, X } from 'lucide-react';
import BookDemoModal from '@/components/marketing/BookDemoModal';
import PayAsYouGoCalculator from '@/components/marketing/PayAsYouGoCalculator';

const Pricing = () => {
    const navigate = useNavigate();
    const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for exploring AI content creation',
            price: { monthly: 0, yearly: 0 },
            features: [
                '100 AI credits/month (~10 videos)',
                'Nebula Vision (Imagen 3)',
                'Nebula Chat (Gemini Flash)',
                '720p video resolution',
                '5-second video clips',
                '50 image generations',
                'Community support',
                'Nebula watermark on outputs',
            ],
            notIncluded: [
                'HD/4K video quality',
                'Nebula Motion (Runway)',
                'Nebula Voice (Audio)',
                'API access',
                'Priority rendering',
                'Team collaboration',
                'Custom fine-tuning',
            ],
            cta: 'Start Free',
            highlighted: false,
        },
        {
            name: 'Creator',
            description: 'For professional creators and agencies',
            price: { monthly: 79, yearly: 59 },
            features: [
                '1,000 AI credits/month (~100 videos)',
                'All Nebula engines (Cortex, Motion, Vision, Voice)',
                'Up to 4K video resolution',
                '30-second video clips',
                '500 image generations',
                'Unlimited text generation',
                '100K characters audio/month',
                'Priority rendering queue',
                'No watermarks',
                'Email support (24hr response)',
                'API access (10K requests/month)',
                'Campaign orchestration',
            ],
            notIncluded: [
                'Custom model fine-tuning',
                'Dedicated account manager',
                'SLA guarantees',
                'Team workspaces (5+ seats)',
            ],
            cta: 'Start 14-Day Trial',
            highlighted: true,
        },
        {
            name: 'Enterprise',
            description: 'For teams and large-scale production',
            price: { monthly: null, yearly: null },
            features: [
                'Custom AI credit allocation',
                'Volume discounts (up to 40% off)',
                'All premium engines + early access',
                'Unlimited resolution & duration',
                'Custom model fine-tuning',
                'Team workspaces (unlimited seats)',
                'Dedicated account manager',
                '99.9% uptime SLA',
                'Priority support (1hr response)',
                'Unlimited API access',
                'SSO & SAML authentication',
                'Custom integrations & webhooks',
                'On-premise deployment option',
                'White-label solutions',
            ],
            notIncluded: [],
            cta: 'Contact Sales',
            highlighted: false,
        },
    ];

    const faqs = [
        {
            question: 'What are AI credits and how do they work?',
            answer: 'AI credits are our unified currency for all content generation. Different assets consume different amounts: videos use ~10 credits per generation, images use ~1 credit, and text/audio are metered by usage. Credits reset monthly and don\'t roll over.',
        },
        {
            question: 'Which AI engines are included in each plan?',
            answer: 'Starter includes Nebula Vision (Imagen 3) and Nebula Chat (Gemini Flash). Creator unlocks all engines: Nebula Cortex (Gemini Pro), Nebula Motion (Runway), Nebula Voice (ElevenLabs), and more. Enterprise gets early access to new engines.',
        },
        {
            question: 'Can I use Pay-As-You-Go instead of a subscription?',
            answer: 'Yes! Our Custom Production Calculator below lets you estimate costs for pay-as-you-go usage. This is perfect for occasional users or those with variable needs. You only pay for what you use with no monthly commitment.',
        },
        {
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle, and you keep your current plan benefits until then.',
        },
        {
            question: 'Is there a free trial for Creator?',
            answer: 'Yes! We offer a 14-day free trial of the Creator plan with full access to all features and 1,000 AI credits. No credit card required to start your trial.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and bank transfers for Enterprise customers. All payments are processed securely through Stripe.',
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
                                    onClick={() => {
                                        if (plan.name === 'Enterprise') {
                                            setIsBookDemoOpen(true);
                                        } else {
                                            navigate(`/signup?plan=${plan.name.toLowerCase()}`);
                                        }
                                    }}
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

            <PayAsYouGoCalculator />

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
