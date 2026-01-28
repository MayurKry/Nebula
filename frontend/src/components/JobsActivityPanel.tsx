import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Loader2, Check, AlertCircle, Clock, RotateCw,
    ChevronRight, Filter
} from 'lucide-react';
import { jobService } from '@/services/job.service';
import { authService } from '@/services/auth.service';
import type { Job, JobModule, JobStatus } from '@/services/job.service';

const JobsActivityPanel = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterModule] = useState<JobModule | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');

    const [pollInterval, setPollInterval] = useState(30000); // Default slow polling (30s)

    // Calculate active jobs to adjust polling
    const activeJobCount = jobs.filter(j => ['processing', 'queued', 'retrying'].includes(j.status)).length;

    useEffect(() => {
        // If there are active jobs, poll moderately (15s), otherwise slow (60s)
        setPollInterval(activeJobCount > 0 ? 15000 : 60000);
    }, [activeJobCount]);

    useEffect(() => {
        // Initial fetch
        if (authService.isAuthenticated()) {
            fetchJobs();
        }

        const interval = setInterval(() => {
            if (authService.isAuthenticated()) {
                fetchJobs();
            }
        }, pollInterval);
        return () => clearInterval(interval);
    }, [pollInterval, filterModule, filterStatus]);

    const fetchJobs = async () => {
        try {
            const filters: any = { limit: 10 };
            if (filterModule !== 'all') filters.module = filterModule;
            if (filterStatus !== 'all') filters.status = filterStatus;

            const result = await jobService.getUserJobs(filters);
            setJobs(result.jobs);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (jobId: string) => {
        try {
            await jobService.retryJob(jobId);
            await fetchJobs();
        } catch (error: any) {
            console.error('Failed to retry job:', error);
        }
    };

    const getStatusIcon = (status: JobStatus) => {
        switch (status) {
            case 'completed':
                return <Check className="w-4 h-4 text-green-400" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'processing':
            case 'retrying':
                return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'failed':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'processing':
            case 'retrying':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'cancelled':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getModuleName = (module: JobModule) => {
        const names: Record<JobModule, string> = {
            campaign_wizard: 'Campaign',
            text_to_image: 'Image',
            text_to_video: 'Video',
            image_to_video: 'Video',
            text_to_audio: 'Audio',
            export: 'Export'
        };
        return names[module];
    };

    const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued' || j.status === 'retrying');

    return (
        <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#00FF88]" />
                    <h3 className="text-sm font-bold text-white">Jobs Activity</h3>
                    {activeJobs.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full">
                            {activeJobs.length} active
                        </span>
                    )}
                </div>
                <Link
                    to="/app/activity"
                    className="text-xs text-[#00FF88] hover:text-[#00CC6A] flex items-center gap-1"
                >
                    View All
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'all'
                        ? 'bg-[#00FF88]/10 text-[#00FF88]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilterStatus('processing')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'processing'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilterStatus('failed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'failed'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    Failed
                </button>
            </div>

            {/* Job List */}
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="py-8 text-center">
                        <Loader2 className="w-6 h-6 text-[#00FF88] animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="py-8 text-center">
                        <Filter className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No jobs found</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div
                            key={job._id}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                {/* Status Icon */}
                                <div className={`mt-0.5 p-2 rounded-lg border ${getStatusColor(job.status)}`}>
                                    {getStatusIcon(job.status)}
                                </div>

                                {/* Job Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-white truncate">
                                            {getModuleName(job.module)}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </div>

                                    {/* Removed platform/provider display */}

                                    {job.error && (
                                        <p className="text-[10px] text-red-400 mb-1 truncate">
                                            {job.error.message}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(job.createdAt).toLocaleTimeString()}
                                        </span>

                                        {job.status === 'failed' && job.retryCount < job.maxRetries && (
                                            <button
                                                onClick={() => handleRetry(job._id)}
                                                className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-[10px] font-medium hover:bg-orange-500/20 transition-all"
                                            >
                                                <RotateCw className="w-3 h-3" />
                                                Retry
                                            </button>
                                        )}

                                        {job.status === 'completed' && job.creditsUsed > 0 && (
                                            <span className="text-[10px] text-[#00FF88]">
                                                {job.creditsUsed} credits
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Stats */}
            {jobs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-xs text-gray-500">Completed</p>
                            <p className="text-sm font-bold text-green-400">
                                {jobs.filter(j => j.status === 'completed').length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Active</p>
                            <p className="text-sm font-bold text-blue-400">
                                {activeJobs.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Failed</p>
                            <p className="text-sm font-bold text-red-400">
                                {jobs.filter(j => j.status === 'failed').length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsActivityPanel;
