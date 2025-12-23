import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        {
            name: 'Products',
            href: '/products',
            hasDropdown: true,
            dropdownItems: [
                { name: 'Video Generation', href: '/products#video-generation' },
                { name: 'Image Creation', href: '/products#image-creation' },
                { name: 'Audio Suite', href: '/products#audio-suite' },
                { name: 'All Features', href: '/products' },
            ],
        },
        { name: 'Use Cases', href: '/use-cases' },
        { name: 'Models', href: '/models' },
        {
            name: 'Resources',
            href: '/resources',
            hasDropdown: true,
            dropdownItems: [
                { name: 'Documentation', href: '/resources#documentation' },
                { name: 'API Reference', href: '/resources#api' },
                { name: 'Blog', href: '/resources#blog' },
                { name: 'Community', href: '/resources#community' },
            ],
        },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Research', href: '/research' },
        {
            name: 'Company',
            href: '/company',
            hasDropdown: true,
            dropdownItems: [
                { name: 'About Us', href: '/company' },
                { name: 'Careers', href: '/company#careers' },
                { name: 'Press', href: '/company#press' },
                { name: 'Contact', href: '/contact' },
            ],
        },
    ];

    const isActive = (href: string) => {
        return location.pathname === href;
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'header-blur' : 'bg-transparent'
                    }`}
            >
                <div className="container-marketing">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/nebula-logo.png" alt="Nebula" className="h-8 object-contain" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <div key={link.name} className="relative dropdown">
                                    <Link
                                        to={link.href}
                                        className={`flex items-center gap-1 px-4 py-2 text-sm nav-link ${isActive(link.href) ? 'active' : ''
                                            }`}
                                    >
                                        {link.name}
                                        {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                                    </Link>
                                    {link.hasDropdown && (
                                        <div className="dropdown-menu">
                                            {link.dropdownItems?.map((item) => (
                                                <Link key={item.name} to={item.href} className="dropdown-item">
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* CTA Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                                Sign In
                            </Link>
                            <Link to="/contact" className="btn-primary text-sm px-4 py-2">
                                Book Demo
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="flex items-center justify-between p-4 border-b border-[var(--marketing-border)]">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <img src="/nebula-logo.png" alt="Nebula" className="h-8 object-contain" />
                    </Link>
                    <button
                        className="p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-4">
                    {navLinks.map((link) => (
                        <div key={link.name} className="mb-2">
                            <Link
                                to={link.href}
                                className={`block px-4 py-3 text-base nav-link ${isActive(link.href) ? 'active' : ''
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                            {link.hasDropdown && (
                                <div className="ml-4 mt-1">
                                    {link.dropdownItems?.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className="block px-4 py-2 text-sm text-[var(--marketing-muted)] hover:text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="mt-6 space-y-3 px-4">
                        <Link
                            to="/login"
                            className="block w-full text-center btn-secondary text-sm py-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/contact"
                            className="block w-full text-center btn-primary text-sm py-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Book Demo
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Header;
