import React from 'react';
import { X, Check, AlertCircle, Clock, Loader2, RotateCw, ArrowRight, Image, Video } from 'lucide-react';
import { useGeneration, type GenerationJob } from './GenerationContext';

const GenerationQueue: React.FC = () => {
    const { jobs, queueVisible, setQueueVisible, cancelJob, retryJob, clearCompleted } = useGeneration();

    if (!queueVisible) return null;

    const renderingJobs = jobs.filter(j => j.status === 'rendering' || j.status === 'queued');
    const completedJobs = jobs.filter(j => j.status === 'completed');
    const errorJobs = jobs.filter(j => j.status === 'error');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'queued':
                return <Clock className="w-4 h-4 text-gray-400" />;
            case 'rendering':
                return <Loader2 className="w-4 h-4 text-[#00FF88] animate-spin" />;
            case 'completed':
                return <Check className="w-4 h-4 text-[#00FF88]" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            default:
                return null;
        }
    };

    const getTypeIcon = (type: string) => {
        return type.includes('video') ? (
            <Video className="w-4 h-4 text-purple-400" />
        ) : (
            <Image className="w-4 h-4 text-blue-400" />
        );
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    const JobCard = ({ job }: { job: GenerationJob }) => (
        <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded-lg hover:border-white/20 transition-all">
            <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {job.thumbnail ? (
                        <img src={job.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : job.status === 'rendering' ? (
                        <div className="w-full h-full bg-gradient-to-r from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] animate-shimmer" />
                    ) : (
                        getTypeIcon(job.type)
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(job.status)}
                        <span className="text-xs text-gray-500 capitalize">{job.status}</span>
                    </div>
                    <p className="text-sm text-white truncate">{job.prompt.slice(0, 40)}...</p>

                    {/* Progress bar */}
                    {(job.status === 'rendering' || job.status === 'queued') && (
                        <div className="mt-2">
                            <div className="h-1 bg-[#0A0A0A] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00FF88] transition-all duration-300"
                                    style={{ width: `${job.progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {job.status === 'queued' ? 'Waiting...' : `${Math.round(job.progress)}%`}
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {job.status === 'error' && (
                        <p className="text-xs text-red-400 mt-1">{job.error}</p>
                    )}

                    {/* Time */}
                    {job.status === 'completed' && (
                        <p className="text-xs text-gray-500 mt-1">{formatTime(job.completedAt!)}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                    {job.status === 'rendering' && (
                        <button
                            onClick={() => cancelJob(job.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            title="Cancel"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {job.status === 'error' && (
                        <button
                            onClick={() => retryJob(job.id)}
                            className="p-1 text-gray-500 hover:text-[#00FF88] transition-colors"
                            title="Retry"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    )}
                    {job.status === 'completed' && (
                        <button
                            className="p-1 text-gray-500 hover:text-[#00FF88] transition-colors"
                            title="View"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="font-semibold text-white">Generation Queue</h2>
                <button
                    onClick={() => setQueueVisible(false)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-500">No generation jobs</p>
                        <p className="text-xs text-gray-600 mt-1">Start creating to see jobs here</p>
                    </div>
                ) : (
                    <>
                        {/* Rendering */}
                        {renderingJobs.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Rendering ({renderingJobs.length})
                                </h3>
                                <div className="space-y-2">
                                    {renderingJobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Errors */}
                        {errorJobs.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-red-400 uppercase mb-2">
                                    Failed ({errorJobs.length})
                                </h3>
                                <div className="space-y-2">
                                    {errorJobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed */}
                        {completedJobs.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase">
                                        Completed ({completedJobs.length})
                                    </h3>
                                    <button
                                        onClick={clearCompleted}
                                        className="text-xs text-gray-500 hover:text-white transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {completedJobs.slice(0, 5).map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {jobs.length > 0 && (
                <div className="p-4 border-t border-white/10">
                    <button className="w-full py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all">
                        Move All to Assets
                    </button>
                </div>
            )}
        </div>
    );
};

export default GenerationQueue;
