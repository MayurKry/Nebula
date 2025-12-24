import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Show after a small delay
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false); // Still close it, but maybe track preference
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Cookie className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold mb-1">We use cookies</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            To ensure you get the best experience on our website. We use cookies for analytics and personalized content. <Link to="/cookies" className="text-purple-400 hover:underline">Read Policy</Link>.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleAccept}
                        className="flex-1 py-2 bg-white text-black font-semibold rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={handleDecline}
                        className="flex-1 py-2 bg-white/5 text-white font-medium rounded-lg text-sm hover:bg-white/10 transition-colors"
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
