import { Outlet } from 'react-router-dom';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import CookieConsent from '@/components/ui/CookieConsent';

const MarketingLayout = () => {
    return (
        <div className="marketing-page min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-16 md:pt-20">
                <Outlet />
            </main>
            <Footer />
            <CookieConsent />
        </div>
    );
};

export default MarketingLayout;
