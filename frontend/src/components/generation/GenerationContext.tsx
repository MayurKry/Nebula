import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Types
export interface GenerationJob {
    id: string;
    type: 'text-to-image' | 'text-to-video' | 'image-to-video';
    prompt: string;
    status: 'queued' | 'rendering' | 'completed' | 'error';
    progress: number;
    createdAt: Date;
    completedAt?: Date;
    results?: string[];
    thumbnail?: string;
    error?: string;
    settings: GenerationSettings;
}

export interface GenerationSettings {
    style?: string;
    aspectRatio?: string;
    seed?: number;
    duration?: number;
    motionLevel?: number;
    cameraPath?: string;
    fidelity?: number;
    colorTemperature?: number;
    referenceImage?: string;
}

interface GenerationContextType {
    jobs: GenerationJob[];
    activeJob: GenerationJob | null;
    queueVisible: boolean;
    setQueueVisible: (visible: boolean) => void;
    addJob: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress'>) => string;
    cancelJob: (id: string) => void;
    retryJob: (id: string) => void;
    clearCompleted: () => void;
}

const GenerationContext = createContext<GenerationContextType | null>(null);

// Sample image URLs for demo
export const SAMPLE_IMAGES = [
    'https://picsum.photos/seed/nebula1/1024/1024',
    'https://picsum.photos/seed/nebula2/1024/1024',
    'https://picsum.photos/seed/nebula3/1024/1024',
    'https://picsum.photos/seed/nebula4/1024/1024',
    'https://picsum.photos/seed/nebula5/1024/1024',
    'https://picsum.photos/seed/nebula6/1024/1024',
    'https://picsum.photos/seed/nebula7/1024/1024',
    'https://picsum.photos/seed/nebula8/1024/1024',
];

export const SAMPLE_VIDEO_THUMBS = [
    'https://picsum.photos/seed/video1/1920/1080',
    'https://picsum.photos/seed/video2/1920/1080',
    'https://picsum.photos/seed/video3/1920/1080',
    'https://picsum.photos/seed/video4/1920/1080',
];

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [jobs, setJobs] = useState<GenerationJob[]>([]);
    const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
    const [queueVisible, setQueueVisible] = useState(false);

    const simulateGeneration = useCallback((jobId: string, type: string) => {
        const duration = type === 'text-to-video' ? 12000 : type === 'image-to-video' ? 10000 : 6000;
        const interval = 100;
        let progress = 0;

        const timer = setInterval(() => {
            progress += (interval / duration) * 100;

            setJobs(prev => prev.map(job => {
                if (job.id === jobId) {
                    if (progress >= 100) {
                        clearInterval(timer);
                        return {
                            ...job,
                            status: 'completed' as const,
                            progress: 100,
                            completedAt: new Date(),
                            results: type.includes('video')
                                ? SAMPLE_VIDEO_THUMBS.slice(0, 2)
                                : SAMPLE_IMAGES.slice(0, 6),
                            thumbnail: type.includes('video')
                                ? SAMPLE_VIDEO_THUMBS[0]
                                : SAMPLE_IMAGES[0],
                        };
                    }
                    return { ...job, status: 'rendering' as const, progress: Math.min(progress, 99) };
                }
                return job;
            }));

            if (progress >= 100) {
                setActiveJob(null);
            }
        }, interval);
    }, []);

    const addJob = useCallback((jobData: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress'>) => {
        const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newJob: GenerationJob = {
            ...jobData,
            id,
            createdAt: new Date(),
            status: 'queued',
            progress: 0,
        };

        setJobs(prev => [newJob, ...prev]);
        setActiveJob(newJob);
        setQueueVisible(true);

        // Start simulation
        setTimeout(() => simulateGeneration(id, jobData.type), 500);

        return id;
    }, [simulateGeneration]);

    const cancelJob = useCallback((id: string) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, status: 'error' as const, error: 'Cancelled by user' } : job
        ));
        if (activeJob?.id === id) {
            setActiveJob(null);
        }
    }, [activeJob]);

    const retryJob = useCallback((id: string) => {
        const job = jobs.find(j => j.id === id);
        if (job) {
            setJobs(prev => prev.map(j =>
                j.id === id ? { ...j, status: 'queued' as const, progress: 0, error: undefined } : j
            ));
            setTimeout(() => simulateGeneration(id, job.type), 500);
        }
    }, [jobs, simulateGeneration]);

    const clearCompleted = useCallback(() => {
        setJobs(prev => prev.filter(job => job.status !== 'completed'));
    }, []);

    return (
        <GenerationContext.Provider value={{
            jobs,
            activeJob,
            queueVisible,
            setQueueVisible,
            addJob,
            cancelJob,
            retryJob,
            clearCompleted,
        }}>
            {children}
        </GenerationContext.Provider>
    );
};

export const useGeneration = () => {
    const context = useContext(GenerationContext);
    if (!context) {
        throw new Error('useGeneration must be used within GenerationProvider');
    }
    return context;
};
