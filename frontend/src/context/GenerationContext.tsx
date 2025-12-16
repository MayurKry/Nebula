import React, { createContext, useContext, useState } from 'react';

interface GeneratedVideo {
    id: string;
    name: string;
    thumbnail: string;
    url: string;
    status: 'processing' | 'ready' | 'failed';
    createdAt: Date;
    type?: string;
    date?: string;
}

interface GenerationContextType {
    generatedVideos: GeneratedVideo[];
    isGenerating: boolean;
    generateVideo: (prompt: string) => Promise<void>;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [generatedVideos] = useState<GeneratedVideo[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateVideo = async (_prompt: string) => {
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <GenerationContext.Provider value={{ generatedVideos, isGenerating, generateVideo }}>
            {children}
        </GenerationContext.Provider>
    );
};

export const useGeneration = () => {
    const context = useContext(GenerationContext);
    if (!context) {
        throw new Error('useGeneration must be used within a GenerationProvider');
    }
    return context;
};
