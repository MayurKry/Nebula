import { Route } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import Home from '@/pages/Marketing/Home';
import Products from '@/pages/Marketing/Products';
import UseCases from '@/pages/Marketing/UseCases';
import Models from '@/pages/Marketing/Models';
import Resources from '@/pages/Marketing/Resources';
import Pricing from '@/pages/Marketing/Pricing';
import Research from '@/pages/Marketing/Research';
import Company from '@/pages/Marketing/Company';
import Contact from '@/pages/Marketing/Contact';
import CaseStudyDetail from '@/pages/Marketing/CaseStudyDetail';
import EthicalPolicyPage from '@/pages/Marketing/EthicalPolicyPage';

import PrivacyPolicy from '@/pages/Marketing/Legal/PrivacyPolicy';
import TermsOfService from '@/pages/Marketing/Legal/TermsOfService';
import CookiePolicy from '@/pages/Marketing/Legal/CookiePolicy';
import Security from '@/pages/Marketing/Legal/Security';

const MarketingRoutes = () => {
    return (
        <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/use-cases/:id" element={<CaseStudyDetail />} />
            <Route path="/models" element={<Models />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/research" element={<Research />} />
            <Route path="/company" element={<Company />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ethical-policy" element={<EthicalPolicyPage />} />

            {/* Legal Routes */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/security" element={<Security />} />
        </Route>
    );
};

export default MarketingRoutes;
