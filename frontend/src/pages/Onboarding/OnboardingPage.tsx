import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Megaphone, Film, GraduationCap, Gamepad2, Share2, ShoppingBag, MoreHorizontal,
    Video, BookOpen, Package, Users, Sparkles,
    User, UserCheck, Award
} from 'lucide-react';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState({
        industry: '',
        useCase: '',
        skillLevel: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const industries = [
        { id: 'marketing', label: 'Marketing & Advertising', icon: Megaphone },
        { id: 'entertainment', label: 'Film & Entertainment', icon: Film },
        { id: 'education', label: 'Education & Training', icon: GraduationCap },
        { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
        { id: 'social', label: 'Social Media', icon: Share2 },
        { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
        { id: 'other', label: 'Other', icon: MoreHorizontal },
    ];

    const useCases = [
        { id: 'ads', label: 'Ads & Commercials', icon: Video },
        { id: 'shortfilms', label: 'Short Films', icon: Film },
        { id: 'explainers', label: 'Explainer Videos', icon: BookOpen },
        { id: 'product', label: 'Product Videos', icon: Package },
        { id: 'social', label: 'Social Content', icon: Users },
        { id: 'animations', label: 'Animations', icon: Sparkles },
    ];

    const skillLevels = [
        {
            id: 'beginner',
            label: 'Beginner',
            description: 'New to AI video creation',
            icon: User,
        },
        {
            id: 'intermediate',
            label: 'Intermediate',
            description: 'Some experience with video tools',
            icon: UserCheck,
        },
        {
            id: 'expert',
            label: 'Expert',
            description: 'Professional video creator',
            icon: Award,
        },
    ];

    const handleSelect = (key: string, value: string) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        // Simulate API call to save onboarding data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate('/app/dashboard');
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return selections.industry !== '';
            case 2:
                return selections.useCase !== '';
            case 3:
                return selections.skillLevel !== '';
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00FF88]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-300 ${s === step
                                ? 'w-10 bg-[#00FF88]'
                                : s < step
                                    ? 'w-10 bg-[#00FF88]/40'
                                    : 'w-10 bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-xl">
                    {/* Step 1: Industry */}
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <h1 className="text-3xl font-bold text-white mb-3 text-center">
                                Welcome to Nebula! 🚀
                            </h1>
                            <p className="text-gray-400 text-center mb-8">
                                What industry are you in? This helps us personalize your experience.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {industries.map((industry) => (
                                    <button
                                        key={industry.id}
                                        onClick={() => handleSelect('industry', industry.id)}
                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:scale-[1.02] ${selections.industry === industry.id
                                            ? 'border-[#00FF88] bg-[#00FF88]/10'
                                            : 'border-white/10 bg-[#1A1A1A] hover:border-white/20'
                                            }`}
                                    >
                                        <industry.icon
                                            className={`w-8 h-8 ${selections.industry === industry.id
                                                ? 'text-[#00FF88]'
                                                : 'text-gray-400'
                                                }`}
                                        />
                                        <span
                                            className={`text-sm font-medium text-center ${selections.industry === industry.id
                                                ? 'text-white'
                                                : 'text-gray-300'
                                                }`}
                                        >
                                            {industry.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Use Case */}
                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <h1 className="text-3xl font-bold text-white mb-3 text-center">
                                What will you create?
                            </h1>
                            <p className="text-gray-400 text-center mb-8">
                                Select your primary use case for AI video creation.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {useCases.map((useCase) => (
                                    <button
                                        key={useCase.id}
                                        onClick={() => handleSelect('useCase', useCase.id)}
                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:scale-[1.02] ${selections.useCase === useCase.id
                                            ? 'border-[#00FF88] bg-[#00FF88]/10'
                                            : 'border-white/10 bg-[#1A1A1A] hover:border-white/20'
                                            }`}
                                    >
                                        <useCase.icon
                                            className={`w-8 h-8 ${selections.useCase === useCase.id
                                                ? 'text-[#00FF88]'
                                                : 'text-gray-400'
                                                }`}
                                        />
                                        <span
                                            className={`text-sm font-medium text-center ${selections.useCase === useCase.id
                                                ? 'text-white'
                                                : 'text-gray-300'
                                                }`}
                                        >
                                            {useCase.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Skill Level */}
                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <h1 className="text-3xl font-bold text-white mb-3 text-center">
                                What's your experience level?
                            </h1>
                            <p className="text-gray-400 text-center mb-8">
                                We'll tailor the interface to match your expertise.
                            </p>
                            <div className="space-y-4">
                                {skillLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => handleSelect('skillLevel', level.id)}
                                        className={`w-full p-5 rounded-xl border transition-all flex items-center gap-4 hover:scale-[1.01] ${selections.skillLevel === level.id
                                            ? 'border-[#00FF88] bg-[#00FF88]/10'
                                            : 'border-white/10 bg-[#1A1A1A] hover:border-white/20'
                                            }`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${selections.skillLevel === level.id
                                                ? 'bg-[#00FF88]/20'
                                                : 'bg-white/5'
                                                }`}
                                        >
                                            <level.icon
                                                className={`w-6 h-6 ${selections.skillLevel === level.id
                                                    ? 'text-[#00FF88]'
                                                    : 'text-gray-400'
                                                    }`}
                                            />
                                        </div>
                                        <div className="text-left">
                                            <h3
                                                className={`font-semibold ${selections.skillLevel === level.id
                                                    ? 'text-white'
                                                    : 'text-gray-300'
                                                    }`}
                                            >
                                                {level.label}
                                            </h3>
                                            <p className="text-sm text-gray-500">{level.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1}
                            className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-0 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!canProceed() || isSubmitting}
                            className="px-8 py-3 bg-[#00FF88] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#00FF88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {step === 3
                                ? isSubmitting
                                    ? 'Setting up...'
                                    : 'Get Started'
                                : 'Continue'}
                        </button>
                    </div>
                </div>

                {/* Skip option */}
                <button
                    onClick={() => navigate('/app/dashboard')}
                    className="block mx-auto mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default OnboardingPage;
