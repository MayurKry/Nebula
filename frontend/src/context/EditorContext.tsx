import React, { createContext, useContext, useState } from 'react';

// Interfaces
export interface Scene {
    id: string;
    order: number; // Added order property
    thumbnail: string;
    duration: number; // in seconds
    prompt: string;
    style: string;
    status: 'draft' | 'generating' | 'completed' | 'failed';
    videoUrl?: string;
    character?: {
        region: string;
        faceId: string;
    };
    voice?: {
        language: string;
        accent: string;
        gender: string;
        voiceId: string;
    };
    settings: {
        cameraRequest: string;
        motionIntensity: number;
        lighting: string;
        transition: 'cut' | 'fade';
    };
}

interface EditorState {
    projectId: string | null;
    scenes: Scene[];
    currentSceneId: string | null;
    currentTime: number;
    isPlaying: boolean;
    history: Scene[][];
    historyIndex: number;
}

interface EditorContextType extends EditorState {
    initProject: (id: string) => void;
    addScene: () => void;
    updateScene: (id: string, updates: Partial<Scene>) => void;
    deleteScene: (id: string) => void;
    duplicateScene: (id: string) => void;
    selectScene: (id: string) => void;
    reorderScenes: (startIndex: number, endIndex: number) => void;
    togglePlayback: () => void;
    seekTo: (time: number) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};

// Initial Mock Scene for MVP
const initialScene: Scene = {
    id: 'scene-1',
    order: 0,
    thumbnail: 'https://picsum.photos/seed/scene1/320/180',
    duration: 3,
    prompt: 'A futuristic city skyline with flying cars at sunset',
    style: 'Cinematic',
    status: 'draft',
    settings: {
        cameraRequest: 'Slow Pan',
        motionIntensity: 50,
        lighting: 'Golden Hour',
        transition: 'cut',
    }
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [projectId, setProjectId] = useState<string | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([initialScene]);
    const [currentSceneId, setCurrentSceneId] = useState<string | null>(initialScene.id);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // History Management
    const [history, setHistory] = useState<Scene[][]>([[initialScene]]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const pushToHistory = (newScenes: Scene[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newScenes);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const initProject = (id: string) => {
        setProjectId(id);
        // In a real app, fetch project data here
    };

    const addScene = () => {
        const newScene: Scene = {
            ...initialScene,
            id: `scene-${Date.now()}`,
            thumbnail: `https://picsum.photos/seed/${Date.now()}/320/180`,
            prompt: '',
        };
        const newScenes = [...scenes, newScene];
        setScenes(newScenes);
        setCurrentSceneId(newScene.id);
        pushToHistory(newScenes);
    };

    const updateScene = (id: string, updates: Partial<Scene>) => {
        const newScenes = scenes.map(scene =>
            scene.id === id ? { ...scene, ...updates } : scene
        );
        setScenes(newScenes);
        // Debounce history push for minor updates if needed, pushing directly for MVP simplicity
        pushToHistory(newScenes);
    };

    const deleteScene = (id: string) => {
        if (scenes.length <= 1) return; // Prevent deleting last scene
        const newScenes = scenes.filter(s => s.id !== id);
        setScenes(newScenes);
        if (currentSceneId === id) {
            setCurrentSceneId(newScenes[0].id);
        }
        pushToHistory(newScenes);
    };

    const duplicateScene = (id: string) => {
        const sceneToDiff = scenes.find(s => s.id === id);
        if (!sceneToDiff) return;

        const newScene = {
            ...sceneToDiff,
            id: `scene-${Date.now()}`,
        };

        const index = scenes.findIndex(s => s.id === id);
        const newScenes = [...scenes];
        newScenes.splice(index + 1, 0, newScene);

        setScenes(newScenes);
        pushToHistory(newScenes);
    };

    const reorderScenes = (startIndex: number, endIndex: number) => {
        const newScenes = Array.from(scenes);
        const [removed] = newScenes.splice(startIndex, 1);
        newScenes.splice(endIndex, 0, removed);
        setScenes(newScenes);
        pushToHistory(newScenes);
    };

    const togglePlayback = () => setIsPlaying(!isPlaying);

    const seekTo = (time: number) => setCurrentTime(time);

    const selectScene = (id: string) => setCurrentSceneId(id);

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setScenes(history[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setScenes(history[historyIndex + 1]);
        }
    };

    return (
        <EditorContext.Provider value={{
            projectId,
            scenes,
            currentSceneId,
            currentTime,
            isPlaying,
            history,
            historyIndex,
            initProject,
            addScene,
            updateScene,
            deleteScene,
            duplicateScene,
            selectScene,
            reorderScenes,
            togglePlayback,
            seekTo,
            undo,
            redo,
            canUndo: historyIndex > 0,
            canRedo: historyIndex < history.length - 1
        }}>
            {children}
        </EditorContext.Provider>
    );
};
