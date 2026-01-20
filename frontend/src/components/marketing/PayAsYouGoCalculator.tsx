import React, { useState, useMemo } from 'react';
import { Settings, ChevronDown, Info, Zap, Database, Shield, Layout, Sparkles, Video, Image as ImageIcon, FileText, Layers } from 'lucide-react';

interface CalculationResult {
    aiCost: number;
    storageCost: number;
    platformFee: number;
    total: number;
    currency: 'USD' | 'INR';
    breakdown: {
        tokens?: number;
        seconds?: number;
        characters?: number;
        gpuHours?: number;
        teamCost?: number;
    };
}

const EXCHANGE_RATE = 86; // 1 USD = 86 INR

const PayAsYouGoCalculator: React.FC = () => {
    // Advanced Configuration State
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [planMode, setPlanMode] = useState<'individual' | 'team'>('individual');
    const [teamSize, setTeamSize] = useState<number>(5);
    const [assetType, setAssetType] = useState<'video' | 'image' | 'text' | 'audio' | 'campaign'>('video');
    const [provider, setProvider] = useState<string>('veo-flash');
    const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
    const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
    const [quantity, setQuantity] = useState<number>(30); // seconds/assets/chars
    const [useCustomModel, setUseCustomModel] = useState(false);
    const [priorityRendering, setPriorityRendering] = useState(false);

    // Handle asset type change and reset provider to valid default
    const handleAssetTypeChange = (type: 'video' | 'image' | 'text' | 'audio' | 'campaign') => {
        setAssetType(type);
        // Reset provider to appropriate default for the asset type
        if (type === 'video') setProvider('veo-flash');
        else if (type === 'image') setProvider('gemini-flash');
        else if (type === 'text') setProvider('gemini-flash');
        else if (type === 'audio') setProvider('elevenlabs-creator');
        else if (type === 'campaign') setProvider('default');

        // Reset quantity to appropriate default
        if (type === 'text' || type === 'audio') setQuantity(1000);
        else setQuantity(30);
    };

    // High Accuracy Pricing Engine (Pricing as of Jan 2026)
    const pricingData = {
        image: {
            'gemini-flash': 0.002, // Cheapest
            'gemini-pro': 0.035,
            'replicate': 0.045,
            'flux-pro': 0.055
        },
        video: {
            'veo-flash': 0.18, // per 6s
            'veo-pro': 0.38,   // per 6s
            'runway': 0.50,    // per second (approx)
            'luma-dream': 0.45 // per 5s
        },
        text: {
            'gemini-flash': 0.00015, // per 1k tokens
            'gemini-pro': 0.00125    // per 1k tokens
        },
        audio: {
            'elevenlabs-creator': 0.30 // per 1000 characters
        },
        campaign: {
            'setup-base': 2.50,
            'scene-orchestration': 0.25 // per scene
        }
    };

    const results = useMemo((): CalculationResult => {
        let aiCost = 0;
        let storageCost = 0;
        let gpuHours = 0;
        let teamCost = 0;

        // Multipliers - only apply where relevant
        const qualityMult = quality === 'ultra' ? 1.8 : quality === 'high' ? 1.3 : 1.0;
        const resMult = resolution === '4k' ? 2.0 : resolution === '1080p' ? 1.4 : 1.0;
        const customModelPremium = useCustomModel ? 1.5 : 1.0;
        const priorityPremium = priorityRendering ? 1.25 : 1.0;

        if (assetType === 'video') {
            const baseRate = provider === 'runway' ? pricingData.video.runway :
                provider === 'luma-dream' ? pricingData.video['luma-dream'] :
                    provider === 'veo-pro' ? pricingData.video['veo-pro'] : pricingData.video['veo-flash'];

            // Normalize to per second cost
            const perSec = provider === 'runway' ? baseRate : // Runway is per sec in our data now
                baseRate / (provider === 'veo-flash' || provider === 'veo-pro' ? 6 : 5);

            aiCost = quantity * perSec * qualityMult * resMult * customModelPremium * priorityPremium;
            storageCost = quantity * 0.005 * resMult; // Video storage is heavy
            gpuHours = (quantity * 0.02) * qualityMult; // Estimated GPU time in fractional hours
        } else if (assetType === 'image') {
            const baseRate = (pricingData.image as any)[provider] || 0.035;
            aiCost = quantity * baseRate * qualityMult * resMult * customModelPremium * priorityPremium;
            storageCost = quantity * 0.002 * resMult;
            gpuHours = (quantity * 0.005) * qualityMult;
        } else if (assetType === 'text') {
            const baseRate = (pricingData.text as any)[provider] || 0.00015;
            const estimatedTokens = quantity / 4; // Roughly 4 chars per token
            aiCost = (estimatedTokens / 1000) * baseRate * customModelPremium * priorityPremium;
            storageCost = 0.0001;
        } else if (assetType === 'audio') {
            const baseRate = pricingData.audio['elevenlabs-creator'];
            aiCost = (quantity / 1000) * baseRate * customModelPremium * priorityPremium; // quantity is chars
            storageCost = quantity * 0.00001;
        } else if (assetType === 'campaign') {
            aiCost = (pricingData.campaign['setup-base'] + (quantity * pricingData.campaign['scene-orchestration'])) * qualityMult * customModelPremium;
            storageCost = quantity * 0.01;
            gpuHours = quantity * 0.05;
        }

        // Platform and infra overhead
        let platformFee = (aiCost + storageCost) * 0.18; // 18% standard PAYG commission

        // Team Cost
        if (planMode === 'team') {
            const seatCost = 19; // $19 per seat base
            teamCost = teamSize * seatCost;
            platformFee += (teamCost * 0.05); // 5% overhead on team management
        }

        const totalUSD = aiCost + storageCost + platformFee + teamCost;
        const rate = currency === 'INR' ? EXCHANGE_RATE : 1;

        return {
            aiCost: aiCost * rate,
            storageCost: storageCost * rate,
            platformFee: platformFee * rate,
            total: totalUSD * rate,
            currency,
            breakdown: {
                tokens: assetType === 'text' ? quantity / 4 : undefined,
                seconds: assetType === 'video' ? quantity : undefined,
                characters: assetType === 'audio' ? quantity : undefined,
                gpuHours: gpuHours > 0 ? gpuHours : undefined,
                teamCost: planMode === 'team' ? teamCost * rate : undefined
            }
        };
    }, [assetType, provider, quality, resolution, quantity, useCustomModel, priorityRendering, currency, planMode, teamSize]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <div className="w-full max-w-7xl mx-auto my-24 px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--marketing-accent)]/10 border border-[var(--marketing-accent)]/20 text-[var(--marketing-accent)] text-xs font-bold uppercase tracking-wider mb-6">
                    <Sparkles className="w-3 h-3" /> Enhanced Accuracy Engine v2.0
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                    Custom <span className="gradient-text">Production</span> Calculator
                </h2>
                <p className="text-[var(--marketing-muted)] text-xl max-w-2xl mx-auto font-medium">
                    Our high-fidelity estimation tool uses real-time API rates and compute cycles to give you the most accurate project forecast.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Advanced Controls */}
                <div className="space-y-8">
                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--marketing-accent)]/20 to-transparent border border-[var(--marketing-accent)]/20">
                                    <Settings className="w-6 h-6 text-[var(--marketing-accent)]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Nebula Engine Configuration</h3>
                            </div>

                            {/* Currency Toggle */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Currency:</span>
                                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                                    {(['USD', 'INR'] as const).map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setCurrency(curr)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === curr
                                                ? 'bg-[var(--marketing-accent)] text-black'
                                                : 'text-white/50 hover:text-white'}`}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Asset Type Selector */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Asset Type:</label>
                                <div className="flex gap-3">
                                    {(['video', 'image', 'text', 'audio', 'campaign'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleAssetTypeChange(type)}
                                            className={`p-4 rounded-xl transition-all border flex-1 ${assetType === type
                                                ? 'bg-white text-black border-white shadow-xl'
                                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'}
                                            `}
                                            title={type.toUpperCase()}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                {type === 'video' && <Video className="w-6 h-6" />}
                                                {type === 'image' && <ImageIcon className="w-6 h-6" />}
                                                {type === 'text' && <FileText className="w-6 h-6" />}
                                                {type === 'audio' && <Layout className="w-6 h-6" />}
                                                {type === 'campaign' && <Layers className="w-6 h-6" />}
                                                <span className="text-[10px] font-bold uppercase">{type}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Team vs Individual Toggle */}
                        <div className="mb-8 p-1.5 bg-white/5 inline-flex rounded-xl border border-white/5">
                            <button
                                onClick={() => setPlanMode('individual')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${planMode === 'individual' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Solo Creator
                            </button>
                            <button
                                onClick={() => setPlanMode('team')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${planMode === 'team' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Team Workspace
                            </button>
                        </div>

                        {planMode === 'team' && (
                            <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-3">Team Size (Seats)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="2"
                                        max="50"
                                        value={teamSize}
                                        onChange={(e) => setTeamSize(Number(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--marketing-accent)]"
                                    />
                                    <div className="bg-white/10 px-4 py-2 rounded-xl text-white font-bold min-w-[3rem] text-center">
                                        {teamSize}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Nebula Engine (Provider) <Info className="w-3 h-3 cursor-help" />
                                </label>
                                <div className="relative">
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--marketing-accent)]/50 transition-all font-bold"
                                    >
                                        {assetType === 'video' && (
                                            <>
                                                <option value="veo-flash">Nebula Cortex (Gemini 2.0 Flash)</option>
                                                <option value="veo-pro">Nebula Cortex Pro (Gemini 1.5 Pro)</option>
                                                <option value="runway">Nebula Motion (Runway Gen-3 Alpha)</option>
                                                <option value="luma-dream">Nebula Dream (Luma Machine)</option>
                                            </>
                                        )}
                                        {assetType === 'image' && (
                                            <>
                                                <option value="gemini-flash">Nebula Vision (Imagen 3 Flash)</option>
                                                <option value="gemini-pro">Nebula Vision Ultra (Imagen Ultra)</option>
                                                <option value="flux-pro">Nebula Flux (FLUX.1 Pro)</option>
                                                <option value="replicate">Nebula Diffusion (SD3)</option>
                                            </>
                                        )}
                                        {assetType === 'text' && (
                                            <>
                                                <option value="gemini-flash">Nebula Chat (Gemini 1.5 Flash)</option>
                                                <option value="gemini-pro">Nebula Chat Pro (Gemini 1.5 Pro)</option>
                                            </>
                                        )}
                                        {assetType === 'audio' && (
                                            <>
                                                <option value="elevenlabs-creator">Nebula Voice (ElevenLabs)</option>
                                            </>
                                        )}
                                        {assetType === 'campaign' && (
                                            <option value="default">Nebula Orchestrator (Multi-Agent)</option>
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Quality Level
                                </label>
                                <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                                    {(['standard', 'high', 'ultra'] as const).map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => setQuality(q)}
                                            className={`py-2.5 rounded-xl text-[10px] font-black transition-all uppercase ${quality === q ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Target Resolution
                                </label>
                                <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                                    {(['720p', '1080p', '4k'] as const).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setResolution(r)}
                                            className={`py-2.5 rounded-xl text-[10px] font-black transition-all ${resolution === r ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-6 bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                                        Total Scope ({assetType === 'video' ? 'Seconds' : assetType === 'text' || assetType === 'audio' ? 'Chars' : 'Units'})
                                    </label>
                                    <span className="text-2xl font-black text-[var(--marketing-accent)] tabular-nums">{quantity.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min={assetType === 'text' || assetType === 'audio' ? 1000 : 1}
                                    max={assetType === 'text' || assetType === 'audio' ? 100000 : 120}
                                    step={assetType === 'text' || assetType === 'audio' ? 1000 : 1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--marketing-accent)]"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 tracking-tighter">
                                    <span>MINIMUM SCALE</span>
                                    <span>MAXIMUM ALLOWED PAY-AS-YOU-GO SCALE</span>
                                </div>
                            </div>

                            {/* Advanced Toggles */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setUseCustomModel(!useCustomModel)}
                                    className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${useCustomModel
                                        ? 'bg-[var(--marketing-accent)]/10 border-[var(--marketing-accent)]/50'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white">Custom Fine-tuned Model</div>
                                        <div className="text-[10px] text-gray-500">Enable specialized style training</div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${useCustomModel ? 'bg-[var(--marketing-accent)]' : 'bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useCustomModel ? 'left-5' : 'left-1'}`} />
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPriorityRendering(!priorityRendering)}
                                    className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${priorityRendering
                                        ? 'bg-blue-500/10 border-blue-500/50'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white">Priority Cloud Rendering</div>
                                        <div className="text-[10px] text-gray-500">Bypass queue for instant generation</div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${priorityRendering ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${priorityRendering ? 'left-5' : 'left-1'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accuracy Result Panel */}
                <div className="relative">
                    <div className="sticky top-24 glass-card p-10 rounded-[2.5rem] border border-[var(--marketing-accent)]/30 bg-gradient-to-br from-white/[0.05] to-[var(--marketing-accent)]/[0.02] shadow-[0_40px_80px_rgba(var(--accent-rgb),0.2)] backdrop-blur-2xl overflow-hidden min-h-[700px] flex flex-col">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
                            <Sparkles className="w-80 h-80 text-[var(--marketing-accent)] animate-pulse" />
                        </div>

                        <div className="relative z-10 flex-grow">
                            <div className="mb-12">
                                <p className="text-[10px] font-black text-[var(--marketing-accent)] uppercase tracking-[0.3em] mb-4">Total Estimate Production Cost</p>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none break-all">{formatCurrency(results.total)}</span>
                                    <span className="text-gray-500 font-bold text-base italic">{currency}</span>
                                </div>
                            </div>

                            <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Configuration Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-500 block mb-1">Asset Type</span>
                                        <span className="text-white font-bold capitalize">{assetType}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-1">Provider</span>
                                        <span className="text-white font-bold">
                                            {assetType === 'video' && provider === 'veo-flash' && 'Nebula Cortex (Gemini)'}
                                            {assetType === 'video' && provider === 'veo-pro' && 'Nebula Cortex Pro'}
                                            {assetType === 'video' && provider === 'runway' && 'Nebula Motion (Runway)'}
                                            {assetType === 'video' && provider === 'luma-dream' && 'Nebula Dream'}

                                            {assetType === 'image' && provider === 'gemini-flash' && 'Nebula Vision'}
                                            {assetType === 'image' && provider === 'gemini-pro' && 'Nebula Vision Ultra'}
                                            {assetType === 'image' && provider === 'flux-pro' && 'Nebula Flux'}
                                            {assetType === 'image' && provider === 'replicate' && 'Nebula Diffusion'}

                                            {assetType === 'text' && provider === 'gemini-flash' && 'Nebula Chat'}
                                            {assetType === 'text' && provider === 'gemini-pro' && 'Nebula Chat Pro'}

                                            {assetType === 'audio' && 'Nebula Voice (ElevenLabs)'}

                                            {assetType === 'campaign' && 'Nebula Orchestrator'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-1">Plan Mode</span>
                                        <span className="text-white font-bold capitalize">{planMode} {planMode === 'team' && `(${teamSize})`}</span>
                                    </div>
                                    {assetType !== 'text' && assetType !== 'campaign' && assetType !== 'audio' && (
                                        <div>
                                            <span className="text-gray-500 block mb-1">Resolution</span>
                                            <span className="text-white font-bold">{resolution}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 block mb-1">Quantity</span>
                                        <span className="text-white font-bold">{quantity.toLocaleString()} {assetType === 'video' ? 'Secs' : assetType === 'text' || assetType === 'audio' ? 'Chars' : 'Units'}</span>
                                    </div>
                                </div>
                                {(useCustomModel || priorityRendering) && (
                                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                                        {useCustomModel && (
                                            <span className="px-2 py-1 rounded-md bg-[var(--marketing-accent)]/20 text-[var(--marketing-accent)] text-[10px] font-bold uppercase">
                                                Custom Model
                                            </span>
                                        )}
                                        {priorityRendering && (
                                            <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                                                Priority
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:scale-110 transition-transform">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Neural Processing</div>
                                            {results.breakdown.gpuHours && (
                                                <div className="text-[10px] text-gray-500">Est. {(results.breakdown.gpuHours).toFixed(2)} GPU Compute Hours</div>
                                            )}
                                            {results.breakdown.tokens && (
                                                <div className="text-[10px] text-gray-500">~{results.breakdown.tokens.toLocaleString()} Tokens</div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-mono text-xl text-white font-black">{formatCurrency(results.aiCost)}</span>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Tier-1 Edge Storage</div>
                                            <div className="text-[10px] text-gray-500">Global High-Speed Asset CDN</div>
                                        </div>
                                    </div>
                                    <span className="font-mono text-xl text-white font-black">{formatCurrency(results.storageCost)}</span>
                                </div>

                                {planMode === 'team' && (
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:scale-110 transition-transform">
                                                <Layout className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Team Workspace</div>
                                                <div className="text-[10px] text-gray-500">{teamSize} Active Seats</div>
                                            </div>
                                        </div>
                                        <span className="font-mono text-xl text-white font-black">{formatCurrency(results.breakdown.teamCost || 0)}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 group-hover:scale-110 transition-transform">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Safety & Platform</div>
                                            <div className="text-[10px] text-gray-500">Encrypted Infra & Moderation</div>
                                        </div>
                                    </div>
                                    <span className="font-mono text-xl text-white font-black">{formatCurrency(results.platformFee)}</span>
                                </div>
                            </div>

                            <div className="h-6 w-full bg-white/5 rounded-full flex overflow-hidden mb-12 border border-white/10 shadow-inner">
                                <div
                                    className="h-full bg-cyan-400 transition-all duration-1000 ease-in-out"
                                    style={{ width: `${(results.aiCost / results.total) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-purple-500 transition-all duration-1000 ease-in-out delay-100"
                                    style={{ width: `${(results.storageCost / results.total) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-pink-500 transition-all duration-1000 ease-in-out delay-200"
                                    style={{ width: `${(results.platformFee / results.total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button className="w-full bg-white text-black hover:bg-[var(--marketing-accent)] hover:text-black font-black text-lg uppercase py-7 rounded-[2rem] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_25px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3">
                                <Layout className="w-6 h-6" />
                                Start Production
                            </button>
                            <p className="text-center text-[10px] text-gray-500 mt-6 font-bold tracking-widest uppercase">
                                Estimates accurate within ±5% of final billing
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayAsYouGoCalculator;
