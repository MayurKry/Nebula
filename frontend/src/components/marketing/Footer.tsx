import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Youtube } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        products: {
            title: 'Products',
            links: [
                { name: 'Video Generation', href: '/products#video-generation' },
                { name: 'Image Creation', href: '/products#image-creation' },
                { name: 'Audio Suite', href: '/products#audio-suite' },
                { name: 'Storyboard Creator', href: '/products#storyboard' },
                { name: 'API Access', href: '/products#api' },
            ],
        },
        useCases: {
            title: 'Use Cases',
            links: [
                { name: 'Marketing & Ads', href: '/use-cases#marketing' },
                { name: 'Entertainment', href: '/use-cases#entertainment' },
                { name: 'Education', href: '/use-cases#education' },
                { name: 'Social Media', href: '/use-cases#social' },
                { name: 'Enterprise', href: '/use-cases#enterprise' },
            ],
        },
        resources: {
            title: 'Resources',
            links: [
                { name: 'Documentation', href: '/resources#documentation' },
                { name: 'API Reference', href: '/resources#api' },
                { name: 'Blog', href: '/resources#blog' },
                { name: 'Tutorials', href: '/resources#tutorials' },
                { name: 'Community', href: '/resources#community' },
            ],
        },
        company: {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/company' },
                { name: 'Careers', href: '/company#careers' },
                { name: 'Press', href: '/company#press' },
                { name: 'Contact', href: '/contact' },
                { name: 'Partners', href: '/company#partners' },
            ],
        },
        legal: {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
                { name: 'Security', href: '/security' },
            ],
        },
    };

    const socialLinks = [
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/nebula' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/nebula' },
        { name: 'GitHub', icon: Github, href: 'https://github.com/nebula' },
        { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@nebula' },
    ];

    return (
        <footer className="bg-[#050505] border-t border-[var(--marketing-border)]">
            <div className="container-marketing">
                {/* Main Footer Content */}
                <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src="/nebula-logo.png" alt="Nebula" className="h-10 object-contain" />
                        </Link>
                        <p className="text-[var(--marketing-muted)] text-sm mb-6 max-w-xs">
                            Transform your creative vision into stunning video content with the power of AI.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-[var(--marketing-card)] border border-[var(--marketing-border)] flex items-center justify-center text-[var(--marketing-muted)] hover:text-[var(--marketing-accent)] hover:border-[var(--marketing-accent)] transition-all"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.values(footerLinks).map((section) => (
                        <div key={section.title}>
                            <h3 className="text-white font-semibold text-sm mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="text-[var(--marketing-muted)] text-sm hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter Section */}
                <div className="py-8 border-t border-[var(--marketing-border)]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-white font-semibold mb-1">Stay up to date</h3>
                            <p className="text-[var(--marketing-muted)] text-sm">
                                Get the latest news and updates from Nebula.
                            </p>
                        </div>
                        <form className="flex gap-3 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="form-input w-full md:w-64"
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-[var(--marketing-border)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[var(--marketing-muted)] text-sm">
                        © {currentYear} Nebula. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            to="/privacy"
                            className="text-[var(--marketing-muted)] text-sm hover:text-white transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/terms"
                            className="text-[var(--marketing-muted)] text-sm hover:text-white transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            to="/cookies"
                            className="text-[var(--marketing-muted)] text-sm hover:text-white transition-colors"
                        >
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
