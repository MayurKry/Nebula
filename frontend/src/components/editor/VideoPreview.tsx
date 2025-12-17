import { useEffect, useRef } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
    Play, Pause, SkipBack, SkipForward, Maximize,
    Volume2, Video as VideoIcon
} from 'lucide-react';

const VideoPreview = () => {
    const {
        scenes, currentSceneId, isPlaying, togglePlayback,
        seekTo, currentTime, selectScene
    } = useEditor();

    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Playback Logic Loop
    const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        // Mock progress update logic would live here if we were using real time
        // Since we are using React state for time in this MVP, we might rely on setInterval in useEffect
        requestRef.current = requestAnimationFrame(animate);
    };

    // Simple Interval for MVP playback simulation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
                let nextTime = currentTime + 0.1;

                if (nextTime >= totalDuration) {
                    nextTime = 0; // Loop or stop
                    togglePlayback(); // Stop at end
                }

                seekTo(nextTime);

                // Auto-switch Scene based on time
                let accumulated = 0;
                for (const scene of scenes) {
                    if (nextTime >= accumulated && nextTime < accumulated + scene.duration) {
                        if (currentSceneId !== scene.id) {
                            selectScene(scene.id);
                        }
                        break;
                    }
                    accumulated += scene.duration;
                }

            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTime, scenes, currentSceneId]);

    const activeScene = scenes.find(s => s.id === currentSceneId);

    return (
        <div className="flex flex-col flex-1 bg-[#050505] p-4 min-h-0">
            {/* Viewport Container */}
            <div className="flex-1 flex items-center justify-center relative min-h-0">
                <div className="aspect-video h-full max-h-full bg-black rounded-lg border border-white/10 relative overflow-hidden shadow-2xl group">
                    {/* Placeholder Content */}
                    {/* Content Display */}
                    {activeScene ? (
                        <>
                            <img
                                key={activeScene.id} // Re-render on scene change
                                src={activeScene.thumbnail}
                                alt={`Scene ${activeScene.order + 1}`}
                                onError={(e) => {
                                    // Fallback if image fails
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                            {/* Fallback Element (Hidden by default, shown on error) */}
                            <div className="absolute inset-0 bg-[#1A1A1A] hidden flex flex-col items-center justify-center text-gray-500">
                                <Maximize className="w-12 h-12 mb-2 opacity-20" />
                                <span className="text-sm">Preview Unavailable</span>
                            </div>

                            {/* Playback Overlay */}
                            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full border border-white/10 group-hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute top-4 left-4 pointer-events-none">
                                <span className="bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white font-mono mr-2">
                                    Scene {activeScene.order + 1}
                                </span>
                                <span className="bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-[#00FF88] font-mono">
                                    {activeScene.duration}s
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-[#0A0A0A]">
                            <VideoIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a scene to preview</p>
                        </div>
                    )}

                    {/* Overlay Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <div className="text-xs font-mono text-white">
                            {currentTime.toFixed(1)}s / {scenes.reduce((t, s) => t + s.duration, 0)}s
                        </div>
                        <div className="flex items-center gap-4">
                            <Volume2 className="w-4 h-4 text-white cursor-pointer" />
                            <Maximize className="w-4 h-4 text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="h-14 flex items-center justify-center gap-6 mt-2">
                <button
                    onClick={() => seekTo(0)}
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                    <SkipBack className="w-5 h-5" />
                </button>

                <button
                    onClick={togglePlayback}
                    className="p-4 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10 active:scale-95"
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                    ) : (
                        <Play className="w-6 h-6 fill-current ml-1" />
                    )}
                </button>

                <button
                    onClick={() => {
                        const total = scenes.reduce((t, s) => t + s.duration, 0);
                        seekTo(total);
                    }}
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                    <SkipForward className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default VideoPreview;
