import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import GSAPTransition from '@/components/ui/GSAPTransition';

interface LegalPageLayoutProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-6">
            <div className="max-w-3xl mx-auto">
                <GSAPTransition animation="fade-in-up">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
                    <p className="text-gray-500 mb-12">Last updated: {lastUpdated}</p>

                    <div className="prose prose-invert prose-purple max-w-none prose-headings:text-white prose-p:text-gray-400 prose-a:text-purple-400">
                        {children}
                    </div>
                </GSAPTransition>
            </div>
        </div>
    );
};

export default LegalPageLayout;
