import { useState, useEffect, useRef } from 'react';

import {
    RefreshCw, AlertCircle, Loader2, CheckCircle2,
    Clock, XCircle, Play, Pause, FileText, Image, Mic, ExternalLink,
    Zap, Clock4, Gauge, History, Trash2, Search, RotateCcw, Download
} from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { jobService, type Job, type JobModule, type JobStatus } from '@/services/job.service';
import { toast } from 'sonner';
import { TokenStorage } from '@/api/tokenStorage';
import Pagination from '@/components/ui/Pagination';
import { assetService } from '@/services/asset.service';

const getModuleIcon = (module: JobModule) => {
    switch (module) {
        case 'campaign_wizard': return <FileText className="w-4 h-4" />;
        case 'text_to_image': return <Image className="w-4 h-4" />;
        case 'text_to_video':
        case 'image_to_video': return <Play className="w-4 h-4" />;
        case 'text_to_audio': return <Mic className="w-4 h-4" />;
        default: return <FileText className="w-4 h-4" />;
    }
};

const getStatusStyles = (status: JobStatus) => {
    switch (status) {
        case 'completed': return {
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            shadow: ''
        };
        case 'processing': return {
            color: 'text-sky-400',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
            icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
            shadow: ''
        };
        case 'failed': return {
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            icon: <XCircle className="w-3.5 h-3.5" />,
            shadow: ''
        };
        case 'queued': return {
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            icon: <Clock className="w-3.5 h-3.5" />,
            shadow: ''
        };
        default: return {
            color: 'text-gray-400',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/20',
            icon: <History className="w-3.5 h-3.5" />,
            shadow: ''
        };
    }
};

const JobHistoryPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterModule, setFilterModule] = useState<JobModule | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [pollInterval, setPollInterval] = useState(30000);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 20;

    const containerRef = useRef<HTMLDivElement>(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getMediaUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/v1';
        const serverBase = apiBase.replace('/v1', '');
        return `${serverBase}${url}`;
    };

    const openModal = (job: Job) => setSelectedJob(job);
    const closeModal = () => setSelectedJob(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchJobs(false, page);

        // Find the scrollable container in AppLayout and scroll it
        const mainContent = document.querySelector('main > div.overflow-y-auto');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const fetchJobs = async (silent = false, page = currentPage) => {
        // Don't fetch if no token is available
        const token = TokenStorage.getAccessToken();
        if (!token) {
            console.warn('No access token found, skipping fetch');
            setIsLoading(false);
            return;
        }

        try {
            if (!silent) setIsLoading(true);
            const data = await jobService.getUserJobs({
                module: filterModule === 'all' ? undefined : filterModule,
                status: filterStatus === 'all' ? undefined : filterStatus,
                limit: ITEMS_PER_PAGE,
                skip: (page - 1) * ITEMS_PER_PAGE
            });
            setJobs(data.jobs);
            // Update total counts
            const total = data.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        } catch (error: any) {
            console.error('Failed to fetch jobs:', error);
            // Don't show toast for polling failures or expected 401s that interceptors handle
            if (!silent && error.response?.status !== 401) {
                toast.error('Failed to load job history');
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const activeJobCount = jobs.filter(j => ['processing', 'queued', 'retrying'].includes(j.status)).length;
    const completedCount = jobs.filter(j => j.status === 'completed').length;
    const failedCount = jobs.filter(j => j.status === 'failed').length;

    useEffect(() => {
        setPollInterval(activeJobCount > 0 ? 10000 : 60000);
    }, [activeJobCount]);

    // Initial fetch and fetch on filter change
    useEffect(() => {
        setCurrentPage(1);
        fetchJobs(false, 1);
    }, [filterModule, filterStatus]);

    // Polling effect - separate from filter changes to avoid redundant calls
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isLive) {
            // Only create interval if live mode is enabled
            interval = setInterval(() => {
                // Fetch silently (no loading spinner) when polling
                if (document.hasFocus()) fetchJobs(true, currentPage);
            }, pollInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLive, pollInterval, currentPage]); // Added currentPage dependency to safeguard polling

    const handleRetry = async (jobId: string) => {
        try {
            await jobService.retryJob(jobId);
            toast.success('Job retry started');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to retry job');
        }
    };

    const handleDownload = async (url: string, filename: string, assetId?: string) => {
        try {
            toast.info('Preparing file for download...');
            let blob;

            if (assetId) {
                // Use proxy service for reliable download
                try {
                    blob = await assetService.downloadAsset(assetId);
                } catch (proxyError) {
                    console.warn('Proxy download failed, trying direct fetch:', proxyError);
                    // Fallback to direct fetch if proxy fails
                    try {
                        const response = await fetch(getMediaUrl(url), { mode: 'cors', credentials: 'include' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        blob = await response.blob();
                    } catch (fetchError) {
                        // Retry without credentials (for external URLs causing CORS issues)
                        const response = await fetch(getMediaUrl(url), { mode: 'cors', credentials: 'omit' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        blob = await response.blob();
                    }
                }
            } else {
                // Direct fetch for metadata-less results
                try {
                    const response = await fetch(getMediaUrl(url), { mode: 'cors', credentials: 'include' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    blob = await response.blob();
                } catch (fetchError) {
                    // Retry without credentials (for external URLs causing CORS issues)
                    const response = await fetch(getMediaUrl(url), { mode: 'cors', credentials: 'omit' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    blob = await response.blob();
                }
            }

            // Determine file extension from blob type or URL
            let extension = '';
            if (blob.type) {
                const mimeMap: Record<string, string> = {
                    'image/png': '.png',
                    'image/jpeg': '.jpg',
                    'image/webp': '.webp',
                    'video/mp4': '.mp4',
                    'audio/mpeg': '.mp3',
                    'audio/wav': '.wav'
                };
                extension = mimeMap[blob.type] || '';
            }
            if (!extension) {
                // Try to get from URL
                const urlExt = url.split('.').pop()?.split('?')[0];
                if (urlExt && urlExt.length <= 4) extension = `.${urlExt}`;
            }

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename + extension;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success('Download completed');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Download failed. Please try again or contact support.');
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.input?.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Animation removed for better UX - items now display immediately

    return (
        <div ref={containerRef} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00CC6A]">Archive</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Monitor and manage your creative pipeline from a single portal.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border ${isLive
                            ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 shadow-[0_0_20px_rgba(0,255,136,0.1)]'
                            : 'bg-white/5 text-gray-500 border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#00FF88] animate-pulse' : 'bg-gray-600'}`} />
                        {isLive ? 'LIVE RADAR ACTIVE' : 'ENABLE LIVE RADAR'}
                    </button>
                    <button
                        onClick={() => fetchJobs(false, currentPage)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group"
                        title="Refresh History"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Operations', value: jobs.length, icon: Gauge, color: 'text-white' },
                    { label: 'Successful', value: completedCount, icon: Zap, color: 'text-[#00FF88]' },
                    { label: 'Active Pipeline', value: activeJobCount, icon: Clock4, color: 'text-sky-400' },
                    { label: 'Failed Tasks', value: failedCount, icon: AlertCircle, color: 'text-rose-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#141414] border border-white/5 p-4 rounded-2xl shadow-lg group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color} opacity-60`} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-black text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-[#141414] p-4 rounded-2xl border border-white/5 shadow-xl">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00FF88] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by prompt or job ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#00FF88]/40 transition-all w-full placeholder:text-gray-600"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value as any)}
                        className="bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00FF88]/40 min-w-[140px]"
                    >
                        <option value="all">All Modules</option>
                        <option value="campaign_wizard">Campaign Wizard</option>
                        <option value="text_to_image">Text to Image</option>
                        <option value="text_to_video">Text to Video</option>
                        <option value="image_to_video">Image to Video</option>
                        <option value="text_to_audio">Text to Audio</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00FF88]/40"
                    >
                        <option value="all">Every Status</option>
                        <option value="queued">Queued</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Job Grid/List */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading && filteredJobs.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-[#141414] rounded-3xl border border-dashed border-white/5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#00FF88] blur-xl opacity-20 animate-pulse" />
                            <Loader2 className="w-12 h-12 text-[#00FF88] animate-spin relative" />
                        </div>
                        <p className="text-gray-400 font-medium animate-pulse">Scanning Archive...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="py-24 text-center bg-[#141414] rounded-3xl border border-dashed border-white/5">
                        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg">No Results Found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any generation tasks matching your current filters.</p>
                        <button
                            onClick={() => { setFilterModule('all'); setFilterStatus('all'); setSearchQuery(''); }}
                            className="mt-6 text-[#00FF88] text-sm font-bold flex items-center gap-2 mx-auto hover:underline"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                        </button>
                    </div>
                ) : (
                    filteredJobs.map((job) => {
                        const style = getStatusStyles(job.status);
                        return (
                            <div
                                key={job._id}
                                onClick={() => openModal(job)}
                                className="job-card group bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-6 hover:bg-[#1A1A1A] hover:border-white/10 transition-all cursor-pointer"
                            >
                                {/* Module Icon / Thumbnail */}
                                {/* Module Icon / Thumbnail */}
                                <div className="flex-shrink-0">
                                    {(job.output && job.output.length > 0 && job.output[0].url) ? (
                                        <div className="relative w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden border border-white/10 group-hover:border-[#00FF88]/50 transition-all bg-black">
                                            {['text_to_video', 'image_to_video'].includes(job.module) ? (
                                                <>
                                                    <video
                                                        src={job.output[0].url}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        muted
                                                        loop
                                                        playsInline
                                                        onMouseOver={(e) => e.currentTarget.play().catch(() => { })}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.pause();
                                                            e.currentTarget.currentTime = 0;
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                                                            <Play className="w-3 h-3 text-white fill-current" />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <img
                                                    src={job.output[0].url}
                                                    alt="Result"
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    onError={(e) => {
                                                        // Fallback if image fails to load
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.classList.add('fallback-icon-mode');
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all ${style.shadow}`}>
                                            {getModuleIcon(job.module)}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0 space-y-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">#{job._id.slice(-8)}</span>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${style.bg} ${style.color} ${style.border}`}>
                                            {style.icon}
                                            {job.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <h3 className="text-gray-200 font-medium line-clamp-1 group-hover:text-white transition-colors" title={job.input?.prompt || 'No prompt'}>
                                        {job.input?.prompt || <span className="text-gray-600">Advanced Generation Task</span>}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5 capitalize"><FileText className="w-3 h-3" /> {job.module.replace(/_/g, ' ')}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleString()}</span>
                                        {job.creditsUsed > 0 && <span className="flex items-center gap-1.5 text-amber-500/80"><Zap className="w-3 h-3" /> {job.creditsUsed} Fuel</span>}
                                    </div>

                                    {job.error && (
                                        <div className="mt-2 text-[11px] text-rose-400 font-medium flex items-center gap-1.5 border-l-2 border-rose-500/30 pl-3">
                                            <AlertCircle className="w-3 h-3" />
                                            {job.error.message}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 md:pl-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                                    {job.status === 'failed' && (
                                        <button
                                            onClick={() => handleRetry(job._id)}
                                            className="px-4 py-2 bg-white/5 hover:bg-rose-500/20 text-white rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-rose-500/20 flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-3 h-3" /> RETRY
                                        </button>
                                    )}
                                    {job.status === 'completed' && job.output?.[0]?.url && (
                                        <a
                                            href={job.output[0].url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-[#00FF88] text-black rounded-xl text-xs font-bold transition-all hover:bg-[#00CC6A] hover:scale-105 flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-3 h-3" /> VIEW RESULT
                                        </a>
                                    )}
                                    <button className="p-2.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && jobs.length > 0 && (
                <div className="mt-8 border-t border-white/5 pt-6 pb-12">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                    <div className="text-center mt-4 text-xs text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} operations
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeModal} />

                    <GSAPTransition animation="scale-in" className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${getStatusStyles(selectedJob.status).color}`}>
                                        {getModuleIcon(selectedJob.module)}
                                    </div>
                                    Job Details
                                </h2>
                                <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-widest">#{selectedJob._id}</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-8">
                            {/* Asset Preview */}
                            <div className="space-y-4">
                                <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 group relative">
                                    {selectedJob.status === 'completed' && selectedJob.output?.[0]?.url ? (
                                        selectedJob.output[0].type === 'video' ? (
                                            <video
                                                src={getMediaUrl(selectedJob.output[0].url)}
                                                controls
                                                autoPlay
                                                className="w-full h-full object-contain"
                                            />
                                        ) : selectedJob.output[0].type === 'audio' ? (
                                            <div className="flex flex-col items-center gap-6 w-full h-full justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${audioPlaying ? 'bg-[#00FF88] scale-110 shadow-[0_0_30px_rgba(0,255,136,0.4)]' : 'bg-white/5 border border-white/10'}`}>
                                                    <button
                                                        onClick={() => {
                                                            if (audioRef.current) {
                                                                if (audioPlaying) audioRef.current.pause();
                                                                else audioRef.current.play().catch(() => toast.error("Playback failed"));
                                                            }
                                                        }}
                                                        className={`transition-colors ${audioPlaying ? 'text-black' : 'text-white hover:text-[#00FF88]'}`}
                                                    >
                                                        {audioPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                                                    </button>
                                                </div>
                                                <audio
                                                    ref={audioRef}
                                                    src={getMediaUrl(selectedJob.output[0].url)}
                                                    onPlay={() => setAudioPlaying(true)}
                                                    onPause={() => setAudioPlaying(false)}
                                                    onEnded={() => setAudioPlaying(false)}
                                                    className="hidden"
                                                />
                                                <p className="text-gray-400 text-xs font-bold font-pixel tracking-widest uppercase">Click to Play</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={getMediaUrl(selectedJob.output[0].url)}
                                                className="w-full h-full object-contain"
                                                alt="Result"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                                            <Loader2 className="w-8 h-8 text-[#00FF88] animate-spin" />
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Processing Asset...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Prompt</h4>
                                    <p className="text-sm text-gray-200 leading-relaxed">
                                        "{selectedJob.input?.prompt || 'No prompt provided'}"
                                    </p>
                                </div>
                            </div>

                            {/* Details & Info */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</div>
                                        <div className={`text-sm font-bold capitalize ${getStatusStyles(selectedJob.status).color}`}>{selectedJob.status}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Credits</div>
                                        <div className="text-sm font-bold text-amber-500">{selectedJob.creditsUsed} Fuel</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Module</div>
                                        <div className="text-sm font-bold text-gray-300 capitalize">{selectedJob.module.replace(/_/g, ' ')}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Created At</div>
                                        <div className="text-sm font-bold text-gray-300">{new Date(selectedJob.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                {selectedJob.input?.config && (
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Technical Configuration</h4>
                                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                                            {Object.entries(selectedJob.input.config).map(([key, value]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <span className="text-gray-300 font-medium">{String(value).toLowerCase() === 'runway' ? 'Nebula' : String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.status === 'completed' && selectedJob.output?.[0]?.url && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const output = selectedJob.output![0];
                                                const assetId = output.metadata?.assetId;
                                                handleDownload(output.url!, `nebula-${selectedJob._id.slice(-8)}`, assetId);
                                            }}
                                            className="flex-1 bg-[#00FF88] text-black h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00CC6A] transition-all"
                                        >
                                            <Download className="w-4 h-4" /> Download Result
                                        </button>
                                        <button
                                            onClick={() => window.open(getMediaUrl(selectedJob.output![0].url), '_blank')}
                                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
                                        >
                                            <ExternalLink className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GSAPTransition>
                </div>
            )}
        </div>
    );
};

export default JobHistoryPage;
