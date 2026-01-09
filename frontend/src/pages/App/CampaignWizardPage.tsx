import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Target, ChevronLeft, ChevronRight, Sparkles, Check,
    Loader2, FileText, RotateCw, Download, Zap, AlertCircle,
    Globe, Palette, Package, Video,
    Eye, Upload, Search, X, Clock, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { campaignService, type Campaign } from '@/services/campaign.service';
import { jobService, type Job } from '@/services/job.service';
import {
    LANGUAGES, COUNTRIES, OBJECTIVES, PLATFORMS,
    AUDIENCE_TYPES, BRAND_TONES, CTA_OPTIONS,
    CONTENT_TYPES, VIDEO_DURATIONS, VISUAL_STYLES,
    CREDIT_COSTS
} from '@/constants/campaign.constants';

// Step configuration
const STEPS = [
    { id: 1, title: 'Campaign Overview', icon: Target },
    { id: 2, title: 'Audience & Region', icon: Globe },
    { id: 3, title: 'Brand Assets', icon: Palette },
    { id: 4, title: 'Product Details', icon: Package },
    { id: 5, title: 'Content Preferences', icon: Video },
    { id: 6, title: 'AI Review', icon: Eye },
    { id: 7, title: 'Generation Progress', icon: Zap },
    { id: 8, title: 'Preview Assets', icon: Eye },
    { id: 9, title: 'Export', icon: Download },
    { id: 10, title: 'Finish', icon: Check },
];

const CampaignWizardPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Campaign data
    const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
        platforms: [],
        audienceType: 'B2C',
        contentType: 'both',
        videoDuration: 15,
        country: 'United States',
        language: 'English',
        primaryColor: '#00FF88'
    });

    // Generation state
    const [generatedScript, setGeneratedScript] = useState('');
    const [sceneOutline, setSceneOutline] = useState<string[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [progress, setProgress] = useState({ total: 0, completed: 0, failed: 0, processing: 0 });

    // UI States for specific features
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isEditingScript, setIsEditingScript] = useState(false);
    const [languageSearch, setLanguageSearch] = useState('');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const languageRef = useRef<HTMLDivElement>(null);

    // Click outside to close language dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
                setShowLanguageDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto-save draft
    useEffect(() => {
        if (campaignId && currentStep < 7) {
            const timer = setTimeout(() => {
                saveDraft();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [campaignData, campaignId]);

    // Poll job status when generating
    useEffect(() => {
        if (currentStep === 7 && campaignId && progress.processing > 0) {
            const interval = setInterval(async () => {
                await updateCampaignStatus();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [currentStep, campaignId, progress.processing]);

    const saveDraft = async () => {
        if (!campaignId) return;
        try {
            await campaignService.updateCampaign(campaignId, {
                ...campaignData,
                generatedScript, // Save edited script
                sceneOutline
            });
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    };

    const updateField = <K extends keyof Campaign>(field: K, value: Campaign[K]) => {
        setCampaignData(prev => ({ ...prev, [field]: value }));
    };

    const togglePlatform = (platform: string) => {
        const platforms = campaignData.platforms || [];
        if (platforms.includes(platform)) {
            updateField('platforms', platforms.filter(p => p !== platform));
        } else {
            updateField('platforms', [...platforms, platform]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                updateField('brandLogo', result); // In a real app, upload this to S3 and get URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSceneEdit = (index: number, value: string) => {
        const newScenes = [...sceneOutline];
        newScenes[index] = value;
        setSceneOutline(newScenes);
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(campaignData.name?.trim() && campaignData.objective && campaignData.platforms && campaignData.platforms.length > 0);
            case 2:
                return !!(campaignData.country?.trim() && campaignData.language?.trim() && campaignData.audienceType);
            case 3:
                return !!(campaignData.brandName?.trim());
            case 4:
                return !!(campaignData.cta?.trim());
            case 5:
                return !!(campaignData.contentType);
            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Create campaign on first step
        if (currentStep === 1 && !campaignId) {
            try {
                setIsLoading(true);
                const campaign = await campaignService.createCampaign(campaignData);
                setCampaignId(campaign._id);
                toast.success('Campaign created!');
            } catch (error) {
                toast.error('Failed to create campaign');
                return;
            } finally {
                setIsLoading(false);
            }
        }

        // Save before moving to next step
        if (campaignId && currentStep < 6) {
            await saveDraft();
        }

        if (currentStep < 10) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleGenerateScript = async (isRegeneration = false) => {
        if (!campaignId) return;

        try {
            setIsLoading(true);
            const cost = isRegeneration ? CREDIT_COSTS.script_regeneration : CREDIT_COSTS.script_generation;
            setLoadingMessage(`${isRegeneration ? 'Regenerating' : 'Generating'} AI script (${cost} credits)...`);

            const result = await campaignService.generateScript(campaignId);
            setGeneratedScript(result.script);
            setSceneOutline(result.sceneOutline);
            setIsEditingScript(false);

            toast.success(`Script ${isRegeneration ? 'regenerated' : 'generated'} successfully!`);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to generate script';

            if (message.includes('Insufficient credits')) {
                toast.error('Not enough credits to generate script', {
                    description: `This action requires ${CREDIT_COSTS.script_generation} credits. Please top up.`
                });
            } else {
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleStartGeneration = async () => {
        if (!campaignId) return;

        // Save script changes first
        await saveDraft();

        try {
            setIsLoading(true);
            setLoadingMessage('Starting asset generation...');

            const result = await campaignService.startGeneration(campaignId);
            setJobs(result.jobs);
            setProgress({
                total: result.jobs.length,
                completed: 0,
                failed: 0,
                processing: result.jobs.length
            });

            setCurrentStep(7);
            toast.success('Generation started!');
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to start generation';

            if (message.includes('Insufficient credits')) {
                toast.error('Not enough credits to generate assets', {
                    description: 'Please upgrade your plan or purchase more credits.'
                });
                // Could also set a specific 'error' state variable here to show in the UI
            } else {
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const updateCampaignStatus = async () => {
        if (!campaignId) return;

        try {
            const status = await campaignService.getCampaignStatus(campaignId);
            setJobs(status.jobs);
            setProgress(status.progress);

            // Auto-advance to results when all done
            if (status.progress.processing === 0 && currentStep === 7) {
                setCurrentStep(8);
                toast.success('Generation complete!');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleRetryJob = async (jobId: string) => {
        try {
            await jobService.retryJob(jobId);
            toast.success('Job retry initiated');
            await updateCampaignStatus();
        } catch (error: any) {
            toast.error(error.message || 'Failed to retry job');
        }
    };

    const handleExport = async () => {
        if (!campaignId) return;

        try {
            setIsLoading(true);
            setLoadingMessage('Processing export request...');
            // In a real scenario, we might pass specific asset IDs here if we only want to export some
            await campaignService.exportCampaign(campaignId);
            toast.success('Export started! Check your jobs panel.');
            toast.success('Export started! Check your jobs panel.');
            setCurrentStep(10);
        } catch (error) {
            toast.error('Failed to start export');
        } finally {
            setIsLoading(false);
        }
    };

    const getJobStatusColor = (status: Job['status']) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'processing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'retrying': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'cancelled': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const filteredLanguages = LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
        l.code.toLowerCase().includes(languageSearch.toLowerCase())
    );

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
                                value={campaignData.name || ''}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="e.g., Summer Sale 2024"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Campaign Objective <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {OBJECTIVES.map((obj) => (
                                    <button
                                        key={obj}
                                        onClick={() => updateField('objective', obj)}
                                        className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all ${campaignData.objective === obj
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black shadow-lg'
                                            : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {obj}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Target Platforms <span className="text-red-400">*</span> (Select multiple)
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {PLATFORMS.map((platform) => (
                                    <button
                                        key={platform}
                                        onClick={() => togglePlatform(platform)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${campaignData.platforms?.includes(platform)
                                            ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Country <span className="text-red-400">*</span>
                                </label>
                                <select // Simple select for country as an MVP enhancement
                                    value={campaignData.country || ''}
                                    onChange={(e) => updateField('country', e.target.value)}
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select a country</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c} value={c} className="bg-gray-900">{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative" ref={languageRef}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Language <span className="text-red-400">*</span>
                                </label>
                                <div
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus-within:border-[#00FF88]/50 flex items-center justify-between cursor-pointer"
                                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                >
                                    <span>{campaignData.language || 'Select Language'}</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-90' : ''}`} />
                                </div>

                                {showLanguageDropdown && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="p-2 border-b border-white/5">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg">
                                                <Search className="w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={languageSearch}
                                                    onChange={(e) => setLanguageSearch(e.target.value)}
                                                    placeholder="Search language..."
                                                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredLanguages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        updateField('language', lang.name);
                                                        setShowLanguageDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 transition-colors text-sm text-gray-300 hover:text-white"
                                                >
                                                    <span className="text-lg">{lang.flag}</span>
                                                    {lang.name}
                                                    {campaignData.language === lang.name && (
                                                        <Check className="w-3 h-3 text-[#00FF88] ml-auto" />
                                                    )}
                                                </button>
                                            ))}
                                            {filteredLanguages.length === 0 && (
                                                <div className="p-4 text-center text-gray-500 text-sm">No languages found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Audience Type <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-4">
                                {AUDIENCE_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => updateField('audienceType', type)}
                                        className={`flex-1 px-6 py-4 rounded-xl border text-sm font-bold transition-all ${campaignData.audienceType === type
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Audience Description
                            </label>
                            <textarea
                                value={campaignData.audienceDescription || ''}
                                onChange={(e) => updateField('audienceDescription', e.target.value)}
                                placeholder="Describe your target audience..."
                                rows={4}
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Brand Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={campaignData.brandName || ''}
                                onChange={(e) => updateField('brandName', e.target.value)}
                                placeholder="e.g., Acme Corp"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Brand Logo (Optional)
                            </label>

                            {!logoPreview && !campaignData.brandLogo ? (
                                <div className="border border-dashed border-white/20 bg-black/20 rounded-xl p-8 text-center hover:bg-black/30 transition-colors">
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                            <Upload className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <span className="text-sm font-medium text-white">Click to upload logo</span>
                                        <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative w-fit group">
                                    <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={logoPreview || campaignData.brandLogo}
                                            alt="Brand Logo"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            setLogoPreview(null);
                                            updateField('brandLogo', undefined);
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Brand Tone
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {BRAND_TONES.map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => updateField('brandTone', tone)}
                                        className={`px-5 py-2.5 rounded-full border text-sm transition-all ${campaignData.brandTone === tone
                                            ? 'bg-white border-white text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Primary Brand Color
                            </label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="color"
                                    value={campaignData.primaryColor || '#00FF88'}
                                    onChange={(e) => updateField('primaryColor', e.target.value)}
                                    className="h-12 w-12 rounded-xl border border-white/10 bg-transparent cursor-pointer p-0 overflow-hidden"
                                />
                                <div className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-sm uppercase">
                                    {campaignData.primaryColor}
                                </div>
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
                                value={campaignData.productName || ''}
                                onChange={(e) => updateField('productName', e.target.value)}
                                placeholder="e.g., Premium Widget Pro"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Product Link
                                {campaignData.productLink && (
                                    <span className="text-xs font-normal text-gray-500 ml-2">(Will be validated)</span>
                                )}
                            </label>
                            <input
                                type="url"
                                value={campaignData.productLink || ''}
                                onChange={(e) => updateField('productLink', e.target.value)}
                                placeholder="https://yourstore.com/product"
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Product Description</label>
                            <textarea
                                value={campaignData.productDescription || ''}
                                onChange={(e) => updateField('productDescription', e.target.value)}
                                placeholder="Brief description of your product..."
                                rows={3}
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 focus:outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Call-to-Action <span className="text-red-400">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CTA_OPTIONS.map((cta) => (
                                    <button
                                        key={cta}
                                        onClick={() => updateField('cta', cta)}
                                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${campaignData.cta === cta
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
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
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Content Type <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {CONTENT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => updateField('contentType', type)}
                                        className={`px-6 py-4 rounded-xl border text-sm font-bold capitalize transition-all ${campaignData.contentType === type
                                            ? 'bg-[#00FF88] border-[#00FF88] text-black'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(campaignData.contentType === 'video' || campaignData.contentType === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Video Duration
                                </label>
                                <div className="flex gap-4">
                                    {VIDEO_DURATIONS.map((duration) => (
                                        <button
                                            key={duration}
                                            onClick={() => updateField('videoDuration', duration)}
                                            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${campaignData.videoDuration === duration
                                                ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]'
                                                : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            {duration}s
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Visual Style
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {VISUAL_STYLES.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => updateField('visualStyle', style)}
                                        className={`px-5 py-2.5 rounded-full border text-sm transition-all ${campaignData.visualStyle === style
                                            ? 'bg-white border-white text-black font-bold'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        {!generatedScript ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-[#00FF88]" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Generate AI Content</h3>
                                <p className="text-gray-400 mb-2">
                                    We'll create a custom script and scene outline for your campaign
                                </p>
                                <p className="text-xs text-gray-500 mb-6 flex items-center justify-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    Costs {CREDIT_COSTS.script_generation} credits
                                </p>
                                <button
                                    onClick={() => handleGenerateScript(false)}
                                    disabled={isLoading}
                                    className="px-8 py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate Script
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Generated Script {isEditingScript && <span className="text-xs text-[#00FF88]">(Editing)</span>}
                                        </h4>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setIsEditingScript(!isEditingScript)}
                                                className="text-xs text-gray-400 hover:text-white transition-colors"
                                            >
                                                {isEditingScript ? 'Done Editing' : 'Edit Script'}
                                            </button>
                                            <button
                                                onClick={() => handleGenerateScript(true)}
                                                disabled={isLoading}
                                                className="text-xs text-[#00FF88] hover:text-[#00CC6A] flex items-center gap-1"
                                                title={`Regenerate for ${CREDIT_COSTS.script_regeneration} credits`}
                                            >
                                                <RotateCw className="w-3 h-3" />
                                                Regenerate ({CREDIT_COSTS.script_regeneration} creds)
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`p-1 bg-black/30 rounded-lg border ${isEditingScript ? 'border-[#00FF88]/50' : 'border-white/5'} transition-colors`}>
                                        {isEditingScript ? (
                                            <textarea
                                                value={generatedScript}
                                                onChange={(e) => setGeneratedScript(e.target.value)}
                                                className="w-full h-64 bg-transparent border-none focus:ring-0 p-4 text-sm text-gray-300 leading-relaxed resize-none"
                                            />
                                        ) : (
                                            <div className="p-4 max-h-64 overflow-y-auto">
                                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                                                    {generatedScript}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-3">Scene Outline {isEditingScript && <span className="text-xs text-[#00FF88] ml-2">(Editable)</span>}</h4>
                                    <div className="space-y-2">
                                        {sceneOutline.map((scene, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                                <div className="w-6 h-6 rounded-full bg-[#00FF88]/10 text-[#00FF88] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                {isEditingScript ? (
                                                    <input
                                                        type="text"
                                                        value={scene}
                                                        onChange={(e) => handleSceneEdit(i, e.target.value)}
                                                        className="w-full bg-transparent border-none text-sm text-gray-300 focus:outline-none focus:text-white"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-300">{scene}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartGeneration}
                                    disabled={isLoading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            Start Generation
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Generating Your Campaign Assets</h3>
                            <p className="text-gray-400">This may take a few minutes...</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="p-6 bg-[#1A1A1A] border border-white/10 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                                <span className="text-sm font-bold text-[#00FF88]">
                                    {progress.completed} / {progress.total}
                                </span>
                            </div>
                            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A] transition-all duration-500"
                                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs">
                                <span className="text-gray-500">
                                    {progress.processing} processing
                                </span>
                                {progress.failed > 0 && (
                                    <span className="text-red-400">
                                        {progress.failed} failed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Job List */}
                        <div className="space-y-3">
                            {jobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="p-4 bg-[#1A1A1A] border border-white/10 rounded-xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${getJobStatusColor(job.status)}`}>
                                            {job.status === 'processing' ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : job.status === 'completed' ? (
                                                <Check className="w-5 h-5" />
                                            ) : job.status === 'failed' ? (
                                                <AlertCircle className="w-5 h-5" />
                                            ) : (
                                                <Zap className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {job.metadata?.platform || 'Asset'} - {job.metadata?.assetType || job.module}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">{job.status}</p>
                                        </div>
                                    </div>
                                    {job.status === 'failed' && job.retryCount < job.maxRetries && (
                                        <button
                                            onClick={() => handleRetryJob(job._id)}
                                            className="px-3 py-1.5 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-all"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {progress.processing === 0 && progress.total > 0 && (
                            <button
                                onClick={() => setCurrentStep(8)}
                                className="w-full px-6 py-4 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00FF88]/20"
                            >
                                <Check className="w-5 h-5" />
                                Proceed to Preview
                            </button>
                        )}

                        <div className="text-center pt-4">
                            <button
                                onClick={() => navigate('/app/history')}
                                className="text-sm text-[#00FF88] hover:underline flex items-center gap-2 mx-auto"
                            >
                                <Clock className="w-4 h-4" />
                                View Detailed Job Queue
                            </button>
                        </div>
                    </div>
                );

            case 8:
                const completedJobs = jobs.filter(j => j.status === 'completed');
                const failedJobs = jobs.filter(j => j.status === 'failed');
                const processingJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued');

                // Case: All failed logic
                if (completedJobs.length === 0 && processingJobs.length === 0 && failedJobs.length > 0) {
                    return (
                        <div className="text-center py-20 bg-[#1A1A1A] rounded-3xl border border-white/10 border-dashed">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                We couldn't generate your assets.
                                {failedJobs[0]?.error?.message ? (
                                    <span className="block mt-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
                                        Error: {failedJobs[0].error.message}
                                    </span>
                                ) : " Please try again."}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setCurrentStep(7)}
                                    className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back to Generation
                                </button>
                                <button
                                    onClick={() => navigate('/app/history')}
                                    className="px-6 py-3 bg-[#00FF88]/10 text-[#00FF88] font-bold rounded-xl hover:bg-[#00FF88]/20 transition-all flex items-center gap-2 border border-[#00FF88]/20"
                                >
                                    <Clock className="w-4 h-4" />
                                    Monitor Queue
                                </button>
                            </div>
                        </div>
                    );
                }

                if (completedJobs.length === 0 && processingJobs.length === 0) {
                    return (
                        <div className="text-center py-20 bg-[#1A1A1A] rounded-3xl border border-white/10 border-dashed">
                            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Assets Generated</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                It looks like the generation didn't start or was cancelled.
                            </p>
                            <button
                                onClick={() => setCurrentStep(7)} // Go back to progress to see if anything is stuck, or 6 to restart
                                className="px-6 py-3 bg-[#1A1A1A] text-white border border-white/20 rounded-xl hover:bg-[#252525] transition-all"
                            >
                                Back to Generation
                            </button>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">Preview Assets</h3>
                                <p className="text-gray-400 text-sm">
                                    Review your {completedJobs.length} generated assets. You can regenerate specific scenes if needed.
                                </p>
                            </div>
                            <button
                                onClick={() => setCurrentStep(9)}
                                className="px-6 py-3 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                            >
                                Proceed to Export
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {completedJobs.map((job, index) => (
                                <div key={job._id} className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#00FF88]/30 transition-all group">
                                    {/* Asset Preview Section */}
                                    <div className="w-full md:w-80 aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/5 relative flex-shrink-0">
                                        {job.output?.[0]?.type === 'image' && job.output[0].url && (
                                            <img
                                                src={job.output[0].url}
                                                alt={`Scene ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {job.output?.[0]?.type === 'video' && job.output[0].url && (
                                            <div className="w-full h-full relative">
                                                <video
                                                    src={job.output[0].url}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white border border-white/10 uppercase">
                                            {job.output?.[0]?.type || 'Asset'}
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-lg font-bold text-white flex items-center gap-3">
                                                    {job.output?.[0]?.type === 'video' ? 'Video' : 'Image'}
                                                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-400 font-normal border border-white/5">
                                                        {job.metadata?.platform || 'Universal'}
                                                    </span>
                                                </h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        title="Download"
                                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                        onClick={() => window.open(job.output?.[0]?.url, '_blank')}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Context & Script</label>
                                                <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                                                    {job.input?.prompt || sceneOutline[index] || 'No specific script or prompt data available for this asset.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Edit Controls */}
                                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                            {job.output?.[0]?.type === 'video' ? (
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Duration
                                                    </label>
                                                    <div className="text-sm text-white font-medium">
                                                        {campaignData.videoDuration || 15}s <span className="text-gray-600 text-xs">(Fixed)</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {/* Spacer for alignment if needed, or just let the grid handle it */}
                                                </div>
                                            )}
                                            <div className="flex items-end justify-end gap-3">
                                                <button
                                                    onClick={() => toast.info('Edit script feature coming soon')}
                                                    className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1.5 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                    Edit Details
                                                </button>
                                                <button
                                                    onClick={() => handleRetryJob(job._id)}
                                                    className="text-xs font-bold text-[#00FF88] hover:text-[#00CC6A] flex items-center gap-1.5 px-3 py-2 bg-[#00FF88]/10 rounded-lg border border-[#00FF88]/20 hover:bg-[#00FF88]/20 transition-all"
                                                >
                                                    <RotateCw className="w-3 h-3" />
                                                    Regenerate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-white/5">
                            <button
                                onClick={() => setCurrentStep(7)}
                                className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2 text-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Generation
                            </button>
                        </div>
                    </div>
                );

            case 9:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready to Export</h3>
                            <p className="text-gray-400">
                                {jobs.filter(j => j.status === 'completed').length} assets are ready for export
                            </p>
                        </div>

                        <div className="p-6 bg-[#1A1A1A] border border-white/10 rounded-xl">
                            <h4 className="text-sm font-medium text-gray-300 mb-4">Export Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Assets</span>
                                    <span className="text-white">{jobs.filter(j => j.status === 'completed').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Format</span>
                                    <span className="text-white">ZIP Archive</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">includes</span>
                                    <span className="text-white">Images, Videos, Scripts</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep(8)}
                                className="flex-1 px-6 py-4 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-[#252525] transition-all"
                            >
                                Back to Preview
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isLoading}
                                className="flex-[2] px-6 py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Preparing Export...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Export All Assets
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 10:
                return (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Download className="w-10 h-10 text-[#00FF88]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Export Complete!</h3>
                        <p className="text-gray-400 mb-8">
                            Your campaign assets are being packaged. Check the Jobs panel for download link.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/app/dashboard')}
                                className="px-6 py-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#252525] transition-all"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    setCampaignId(null);
                                    setCampaignData({
                                        platforms: [],
                                        audienceType: 'B2C',
                                        contentType: 'both',
                                        videoDuration: 15,
                                        country: 'United States',
                                        language: 'English',
                                        primaryColor: '#00FF88'
                                    });
                                    setCurrentStep(1);
                                }}
                                className="px-6 py-3 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 transition-all"
                            >
                                Create New Campaign
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
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
                            <Target className="w-5 h-5 text-[#0A0A0A]" />
                        </div>
                        Campaign Wizard
                    </h1>
                    <p className="text-gray-400 mt-2">Create AI-powered campaign content in {STEPS.length} simple steps</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12 relative hidden md:block">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1A1A1A] -translate-y-1/2 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-[#00FF88] -translate-y-1/2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    <div className="relative flex justify-between">
                        {STEPS.map((step) => {
                            const isActive = currentStep >= step.id;
                            const isCurrent = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ${isActive
                                            ? 'bg-[#00FF88] text-[#0A0A0A] ring-[#00FF88]/20 shadow-lg scale-110'
                                            : 'bg-[#0A0A0A] text-gray-600 ring-[#0A0A0A] border border-white/10'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    {isCurrent && (
                                        <div className="absolute top-12 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                                            {step.title}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Step Indicator */}
                <div className="md:hidden mb-8 flex items-center justify-between text-white">
                    <span className="font-bold">Step {currentStep} of {STEPS.length}</span>
                    <span className="text-[#00FF88]">{STEPS[currentStep - 1].title}</span>
                </div>

                {/* Step Content */}
                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="text-[#00FF88] opacity-50">0{currentStep}</span>
                            {STEPS[currentStep - 1].title}
                        </h2>
                        {renderStepContent()}
                    </div>
                </div>

                {/* Navigation Buttons */}
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
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-[#00FF88] text-[#0A0A0A] font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Loading Overlay */}
                {isLoading && loadingMessage && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="w-20 h-20 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">{loadingMessage}</h3>
                        <p className="text-gray-400">Please wait...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CampaignWizardPage;
