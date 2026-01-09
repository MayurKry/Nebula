import { useState, useEffect } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import {
    RefreshCw, Filter, AlertCircle, Loader2, CheckCircle2,
    Clock, XCircle, Play, FileText, Image, Mic, ExternalLink
} from 'lucide-react';
import { jobService, type Job, type JobModule, type JobStatus } from '@/services/job.service';
import { toast } from 'sonner';

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

const getStatusBadge = (status: JobStatus) => {
    switch (status) {
        case 'completed': return <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> COMPLETED</span>;
        case 'processing': return <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin" /> PROCESSING</span>;
        case 'failed': return <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> FAILED</span>;
        case 'queued': return <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> QUEUED</span>;
        default: return <span className="text-[10px] font-bold text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full">{status}</span>;
    }
};

const JobHistoryPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterModule, setFilterModule] = useState<JobModule | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');

    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const data = await jobService.getUserJobs({
                module: filterModule === 'all' ? undefined : filterModule,
                status: filterStatus === 'all' ? undefined : filterStatus,
                limit: 50
            });
            setJobs(data.jobs);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Failed to load job history');
        } finally {
            setIsLoading(false);
        }
    };

    const [pollInterval, setPollInterval] = useState(30000); // Default 30s
    const [isLive, setIsLive] = useState(false);

    // Calculate active jobs to adjust polling
    const activeJobCount = jobs.filter(j => ['processing', 'queued', 'retrying'].includes(j.status)).length;

    useEffect(() => {
        // If there are active jobs, poll faster (10s), otherwise slow (60s)
        setPollInterval(activeJobCount > 0 ? 10000 : 60000);
    }, [activeJobCount]);

    useEffect(() => {
        const fetchIfAuth = () => {
            const token = localStorage.getItem('accessToken');
            if (token) fetchJobs();
        };

        // Initial fetch only
        fetchIfAuth();

        let interval: NodeJS.Timeout;

        if (isLive) {
            interval = setInterval(() => {
                const token = localStorage.getItem('accessToken');
                if (token && document.hasFocus()) {
                    fetchJobs();
                }
            }, pollInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLive, pollInterval, filterModule, filterStatus]);

    const handleRetry = async (jobId: string) => {
        try {
            await jobService.retryJob(jobId);
            toast.success('Job retry started');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to retry job');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <GSAPTransition animation="fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Job Queue & History</h1>
                        <p className="text-gray-400">Monitor your generation tasks across all modules.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${isLive
                                    ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                                    : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#00FF88] animate-pulse' : 'bg-gray-600'}`} />
                            {isLive ? 'LIVE MONITORING' : 'ENABLE LIVE MONITORING'}
                        </button>
                        <button
                            onClick={fetchJobs}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex items-center gap-2 text-xs font-bold"
                        >
                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                            REFRESH
                        </button>
                    </div>
                </div>
            </GSAPTransition>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value as any)}
                    className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-white/20"
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
                    className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-white/20"
                >
                    <option value="all">All Statuses</option>
                    <option value="queued">Queued</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Job List */}
            <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Job ID / Time</th>
                                <th className="px-6 py-4 font-medium">Module</th>
                                <th className="px-6 py-4 font-medium">Input/Prompt</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading && jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading jobs...
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No jobs found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-mono text-xs opacity-70 mb-1">#{job._id.slice(-6)}</span>
                                                <span className="text-gray-400 text-xs">
                                                    {new Date(job.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-white/80">
                                                {getModuleIcon(job.module)}
                                                <span className="text-sm capitalize">{job.module.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-gray-300 line-clamp-2" title={job.input?.prompt || JSON.stringify(job.input)}>
                                                {job.input?.prompt || 'No prompt provided'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(job.status)}
                                            {job.error && (
                                                <div className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]" title={job.error.message}>{job.error.message}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {job.status === 'failed' && (
                                                    <button
                                                        onClick={() => handleRetry(job._id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                                                        title="Retry Job"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {job.status === 'completed' && job.output?.[0]?.url && (
                                                    <a
                                                        href={job.output[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-white/10 rounded-lg text-green-400 transition-colors"
                                                        title="View Result"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default JobHistoryPage;
