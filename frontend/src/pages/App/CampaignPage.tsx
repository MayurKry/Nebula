import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Target, ChevronLeft, ChevronRight, Sparkles,
    Image as ImageIcon, Video, Check, User, Megaphone,
    Loader2, FileText, Layout, RotateCw, Download, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService, type GenerateVideoProjectResponse } from '@/services/ai.service';

// Step configuration
const STEPS = [
    { id: 1, title: 'Campaign Basics', icon: Target },
    { id: 2, title: 'Target Audience', icon: User },
    { id: 3, title: 'Creative Direction', icon: Megaphone },
    { id: 4, title: 'Product Details', icon: Sparkles },
    { id: 5, title: 'Video Options', icon: Video },
    { id: 6, title: 'Review', icon: Check },
    { id: 7, title: 'Results', icon: Layout },
];

// Options data
const campaignGoals = ['Brand Awareness', 'Lead Generation', 'Sales/Conversion', 'Engagement', 'App Install', 'Website Traffic'];
const toneStyles = ['Professional', 'Playful', 'Bold', 'Minimalist', 'Luxury', 'Friendly', 'Urgent'];
const platforms = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter/X', 'Website'];
const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const ctaOptions = ['Shop Now', 'Learn More', 'Sign Up', 'Get Started', 'Download', 'Contact Us', 'Book Now'];

const aiCharacters = [
    { id: 'professional', name: 'Business Professional', description: 'Formal corporate look' },
    { id: 'friendly', name: 'Friendly Presenter', description: 'Approachable and warm' },
    { id: 'influencer', name: 'Casual Influencer', description: 'Modern and trendy' },
    { id: 'executive', name: 'Corporate Executive', description: 'Authority and trust' },
];

const voiceRegions = [
    { id: 'us', name: 'US English', flag: '🇺🇸' },
    { id: 'uk', name: 'British English', flag: '🇬🇧' },
    { id: 'in', name: 'Indian English', flag: '🇮🇳' },
    { id: 'au', name: 'Australian English', flag: '🇦🇺' },
    { id: 'es', name: 'Spanish', flag: '🇪🇸' },
    { id: 'fr', name: 'French', flag: '🇫🇷' },
    { id: 'de', name: 'German', flag: '🇩🇪' },
    { id: 'jp', name: 'Japanese', flag: '🇯🇵' },
];

interface CampaignData {
    // Step 1
    name: string;
    goal: string;
    // Step 2
    audienceDescription: string;
    ageRange: string;
    location: string;
    // Step 3
    tone: string;
    keyMessage: string;
    platform: string;
    // Step 4
    productName: string;
    productLink: string;
    productDescription: string;
    cta: string;
    // Step 5
    character: string;
    voiceRegion: string;
    voiceGender: 'male' | 'female';
}

const CampaignPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>("");
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generatedProject, setGeneratedProject] = useState<GenerateVideoProjectResponse | null>(null);
    const [resultType, setResultType] = useState<'image' | 'video' | null>(null);

    useEffect(() => {
        const savedData = sessionStorage.getItem('campaignDraft');
        if (savedData) {
            try {
                setCampaignData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    const [campaignData, setCampaignData] = useState<CampaignData>({
        name: '',
        goal: '',
        audienceDescription: '',
        ageRange: '',
        location: '',
        tone: '',
        keyMessage: '',
        platform: '',
        productName: '',
        productLink: '',
        productDescription: '',
        cta: '',
        character: '',
        voiceRegion: '',
        voiceGender: 'female',
    });

    useEffect(() => {
        sessionStorage.setItem('campaignDraft', JSON.stringify(campaignData));
    }, [campaignData]);

    const updateField = (field: keyof CampaignData, value: string) => {
        setCampaignData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!campaignData.name.trim() && !!campaignData.goal;
            case 2:
                return !!campaignData.audienceDescription.trim();
            case 3:
                return !!campaignData.tone && !!campaignData.platform;
            case 4:
                return true; // Optional step
            case 5:
                return true; // Optional step
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            toast.error('Please fill in the required fields');
            return;
        }
        if (currentStep < 7) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const generatePrompt = (): string => {
        const parts = [];

        parts.push(`Create a ${campaignData.tone.toLowerCase()} ${campaignData.goal.toLowerCase()} campaign`);

        if (campaignData.productName) {
            parts.push(`for ${campaignData.productName}`);
        }

        parts.push(`targeting ${campaignData.audienceDescription}`);

        if (campaignData.ageRange) {
            parts.push(`(age ${campaignData.ageRange})`);
        }

        if (campaignData.location) {
            parts.push(`in ${campaignData.location}`);
        }

        if (campaignData.keyMessage) {
            parts.push(`with the message: "${campaignData.keyMessage}"`);
        }

        parts.push(`for ${campaignData.platform}`);

        if (campaignData.cta) {
            parts.push(`with call-to-action: "${campaignData.cta}"`);
        }

        if (campaignData.productLink) {
            parts.push(`featuring product link: ${campaignData.productLink}`);
        }

        return parts.join(' ') + '. High quality, professional, eye-catching design.';
    };

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        setLoadingStep("Generating campaign images...");
        setResultType('image');

        try {
            const prompt = generatePrompt();
            const images = await aiService.generateImages({
                prompt,
                width: 1024,
                height: 1024,
                style: 'Photorealistic', // Default for campaigns
            }, 2); // Generate 2 options

            setGeneratedImages(images.map(img => img.url));
            setCurrentStep(7);
            toast.success("Images generated successfully!");
        } catch (error) {
            console.error("Image generation failed:", error);
            toast.error("Failed to generate details. Please try again.");
        } finally {
            setIsGenerating(false);
            setLoadingStep("");
        }
    };

    const handleGenerateVideo = async () => {
        setIsGenerating(true);
        setResultType('video');
        setLoadingStep("Analyzing campaign strategy...");

        try {
            const prompt = generatePrompt();

            // UX Simulation steps
            await new Promise(r => setTimeout(r, 1500));
            setLoadingStep("Drafting script & storyboard...");
            await new Promise(r => setTimeout(r, 1500));
            setLoadingStep("Casting AI actors & composing audio...");

            const project = await aiService.generateVideoProject({
                prompt,
                style: 'Cinematic', // Default
                duration: 30,
            });

            setGeneratedProject(project);
            setCurrentStep(7);
            toast.success("Video campaign project created!");
        } catch (error) {
            console.error("Video generation failed:", error);
            toast.error("Failed to create video project. Please try again.");
        } finally {
            setIsGenerating(false);
            setLoadingStep("");
        }
    };

    const handleOpenEditor = () => {
        if (generatedProject) {
            navigate(`/app/editor/${generatedProject.projectId}`);
        }
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Campaign Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={campaignData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="e.g., Summer Sale 2024"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Campaign Goal <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {campaignGoals.map((goal) => (
                                    <button
                                        key={goal}
                                        onClick={() => updateField('goal', goal)}
                                        className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all duration-300 ${campaignData.goal === goal
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-[1.02]'
                                            : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {goal}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Target Audience Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={campaignData.audienceDescription}
                                onChange={(e) => updateField('audienceDescription', e.target.value)}
                                placeholder="e.g., Young professionals interested in fitness and wellness..."
                                rows={4}
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
                            <div className="flex flex-wrap gap-2">
                                {ageRanges.map((age) => (
                                    <button
                                        key={age}
                                        onClick={() => updateField('ageRange', age)}
                                        className={`px-4 py-2 rounded-full border text-sm transition-all ${campaignData.ageRange === age
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {age}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                            <input
                                type="text"
                                value={campaignData.location}
                                onChange={(e) => updateField('location', e.target.value)}
                                placeholder="e.g., United States, Global, New York..."
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tone & Style <span className="text-red-400">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {toneStyles.map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => updateField('tone', tone)}
                                        className={`px-5 py-2.5 rounded-full border text-sm transition-all ${campaignData.tone === tone
                                            ? 'bg-white border-white text-black font-bold shadow-lg shadow-white/10'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Key Message / Tagline</label>
                            <input
                                type="text"
                                value={campaignData.keyMessage}
                                onChange={(e) => updateField('keyMessage', e.target.value)}
                                placeholder="e.g., Transform Your Life Today"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Target Platform <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {platforms.map((platform) => (
                                    <button
                                        key={platform}
                                        onClick={() => updateField('platform', platform)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${campaignData.platform === platform
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                            <p className="text-blue-400 text-sm">
                                💡 This step is optional. Fill in product details if you're promoting a specific product.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                            <input
                                type="text"
                                value={campaignData.productName}
                                onChange={(e) => updateField('productName', e.target.value)}
                                placeholder="e.g., Nike Air Max 2024"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Product Link</label>
                            <input
                                type="url"
                                value={campaignData.productLink}
                                onChange={(e) => updateField('productLink', e.target.value)}
                                placeholder="https://yourstore.com/product"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Product Description</label>
                            <textarea
                                value={campaignData.productDescription}
                                onChange={(e) => updateField('productDescription', e.target.value)}
                                placeholder="Brief description of your product..."
                                rows={3}
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Call-to-Action</label>
                            <div className="flex flex-wrap gap-2">
                                {ctaOptions.map((cta) => (
                                    <button
                                        key={cta}
                                        onClick={() => updateField('cta', cta)}
                                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${campaignData.cta === cta
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {cta}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                            <p className="text-purple-400 text-sm">
                                🎬 Configure AI character and voice for video content. Skip if generating images only.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">AI Character</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {aiCharacters.map((char) => (
                                    <button
                                        key={char.id}
                                        onClick={() => updateField('character', char.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${campaignData.character === char.id
                                            ? 'bg-[#00FF88] border-[#00FF88] shadow-lg shadow-[#00FF88]/20'
                                            : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
                                            }`}
                                    >
                                        <p className={`font-bold mb-1 ${campaignData.character === char.id ? 'text-black' : 'text-white'}`}>
                                            {char.name}
                                        </p>
                                        <p className={`text-sm ${campaignData.character === char.id ? 'text-black/70' : 'text-gray-500'}`}>{char.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Voice Region</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {voiceRegions.map((region) => (
                                    <button
                                        key={region.id}
                                        onClick={() => updateField('voiceRegion', region.id)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${campaignData.voiceRegion === region.id
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        <span>{region.flag}</span>
                                        <span>{region.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Voice Gender</label>
                            <div className="flex gap-3">
                                {(['female', 'male'] as const).map((gender) => (
                                    <button
                                        key={gender}
                                        onClick={() => setCampaignData(prev => ({ ...prev, voiceGender: gender }))}
                                        className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${campaignData.voiceGender === gender
                                            ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                                            : 'bg-[#1A1A1A] border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-[#1A1A1A] border border-white/10 rounded-xl space-y-4">
                            <h3 className="text-lg font-semibold text-white">Campaign Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Campaign Name</p>
                                    <p className="text-white font-medium">{campaignData.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Goal</p>
                                    <p className="text-white font-medium">{campaignData.goal || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Target Audience</p>
                                    <p className="text-white font-medium">{campaignData.audienceDescription || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Platform</p>
                                    <p className="text-white font-medium">{campaignData.platform || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Tone</p>
                                    <p className="text-white font-medium">{campaignData.tone || '-'}</p>
                                </div>
                                {campaignData.productName && (
                                    <div>
                                        <p className="text-gray-500">Product</p>
                                        <p className="text-white font-medium">{campaignData.productName}</p>
                                    </div>
                                )}
                                {campaignData.character && (
                                    <div>
                                        <p className="text-gray-500">AI Character</p>
                                        <p className="text-white font-medium">
                                            {aiCharacters.find(c => c.id === campaignData.character)?.name}
                                        </p>
                                    </div>
                                )}
                                {campaignData.voiceRegion && (
                                    <div>
                                        <p className="text-gray-500">Voice</p>
                                        <p className="text-white font-medium">
                                            {voiceRegions.find(r => r.id === campaignData.voiceRegion)?.flag}{' '}
                                            {voiceRegions.find(r => r.id === campaignData.voiceRegion)?.name} ({campaignData.voiceGender})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-[#1A1A1A] border border-white/10 rounded-xl">
                            <p className="text-gray-400 text-sm mb-2">Generated Prompt:</p>
                            <p className="text-white text-sm">{generatePrompt()}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGenerating}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {isGenerating && resultType === 'image' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ImageIcon className="w-5 h-5" />
                                )}
                                {isGenerating && resultType === 'image' ? 'Generating...' : 'Generate Images'}
                            </button>
                            <button
                                onClick={handleGenerateVideo}
                                disabled={isGenerating}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0A0A0A] font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {isGenerating && resultType === 'video' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Video className="w-5 h-5" />
                                )}
                                {isGenerating && resultType === 'video' ? 'Processing...' : 'Generate Video'}
                            </button>
                        </div>

                        {/* Loading Overlay */}
                        {isGenerating && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                                <div className="w-20 h-20 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">{loadingStep}</h3>
                                <p className="text-gray-400">Using Gemini AI to craft your campaign content...</p>
                            </div>
                        )}
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-8">
                        {resultType === 'image' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white">Generated Images</h3>
                                    <button
                                        onClick={handleGenerateImage}
                                        disabled={isGenerating}
                                        className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#252525] flex items-center gap-2 text-sm"
                                    >
                                        <RotateCw className="w-4 h-4" /> Regenerate
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {generatedImages.map((url, i) => (
                                        <div key={i} className="group relative aspect-square bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/10">
                                            <img src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <a href={url} download={`campaign-image-${i}.png`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white backdrop-blur-sm transition-colors">
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resultType === 'video' && generatedProject && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1A1A1A] border border-white/10 rounded-xl">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{campaignData.name} - Video Project</h3>
                                            <p className="text-gray-400 text-sm">Targeting: {campaignData.audienceDescription}</p>
                                        </div>
                                        <button
                                            onClick={handleOpenEditor}
                                            className="px-6 py-3 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            Open Full Editor <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Script Preview */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Script Preview
                                        </h4>
                                        <div className="p-4 bg-black/30 rounded-lg border border-white/5 h-48 overflow-y-auto custom-scrollbar">
                                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm font-mono">
                                                {generatedProject.script}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Scenes Preview */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                            <Layout className="w-4 h-4" /> Scenes ({generatedProject.scenes.length})
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {generatedProject.scenes.map((scene, i) => (
                                                <div key={scene.id} className="relative aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/5">
                                                    <img src={scene.imageUrl} alt={`Scene ${i + 1}`} className="w-full h-full object-cover opacity-80" />
                                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white">
                                                        Scene {i + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-8 border-t border-white/10">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
                            >
                                Start New Campaign
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
                            <Target className="w-5 h-5 text-[#0A0A0A]" />
                        </div>
                        Campaign Wizard
                    </h1>
                    <p className="text-gray-400 mt-2">Create stunning campaign content with AI</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1A1A1A] -translate-y-1/2 rounded-full" />
                    <div className="absolute top-1/2 left-0 h-0.5 bg-[#00FF88] -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />

                    <div className="relative flex justify-between">
                        {STEPS.map((step, index) => {
                            const isActive = currentStep >= step.id;
                            const isCurrent = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 group">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ${isActive
                                            ? 'bg-[#00FF88] text-[#0A0A0A] ring-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.5)] scale-110'
                                            : 'bg-[#0A0A0A] text-gray-600 ring-[#0A0A0A] border border-white/10'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className={`absolute top-12 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${isCurrent
                                        ? 'opacity-100 translate-y-0 bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20'
                                        : 'opacity-0 -translate-y-2 pointer-events-none'
                                        }`}>
                                        {step.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Target className="w-64 h-64 text-white" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="text-[#00FF88] opacity-50">0{currentStep}</span>
                            {STEPS[currentStep - 1].title}
                        </h2>
                        {renderStepContent()}
                    </div>
                </div>

                {/* Navigation Buttons - Hide overlap with generation buttons in step 6 & 7 */}
                {currentStep < 6 && (
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${currentStep === 1
                                ? 'bg-[#1A1A1A] text-gray-600 cursor-not-allowed'
                                : 'bg-[#1A1A1A] text-white hover:bg-[#252525]'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-[#00FF88] text-[#0A0A0A] font-semibold rounded-xl hover:opacity-90 transition-all"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CampaignPage;
