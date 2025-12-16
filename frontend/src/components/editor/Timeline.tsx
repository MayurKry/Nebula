import React, { useRef } from 'react';
import type { Scene } from '@/context/EditorContext';
import { useEditor } from '@/context/EditorContext';
import { Clock } from 'lucide-react';

const TimelineBlock = ({ scene, isActive, onSelect, onResize }: {
    scene: Scene;
    isActive: boolean;
    onSelect: () => void;
    onResize: (id: string, newDuration: number) => void;
}) => {
    // Width calculation: 1 second = 40px
    const width = scene.duration * 40;

    // Simple resize simulation
    const handleResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Cycle duration between 2s, 4s, 6s, 8s, 10s for MVP simplicity
        const nextDuration = scene.duration >= 10 ? 2 : scene.duration + 2;
        onResize(scene.id, nextDuration);
    };

    return (
        <div
            style={{ width: `${width} px` }}
            onClick={onSelect}
            className={`relative h - 20 rounded - lg border flex - shrink - 0 transition - all cursor - pointer group select - none ${isActive
                ? 'bg-[#1A1A1A] border-[#00FF88] shadow-[0_0_10px_-2px_rgba(0,255,136,0.3)]'
                : 'bg-[#141414] border-white/10 hover:border-white/20'
                } `}
        >
            <div className="absolute inset-0 flex items-center px-3 gap-2 overflow-hidden">
                {scene.thumbnail && (
                    <img
                        src={scene.thumbnail}
                        className="h-14 w-24 object-cover rounded bg-black opacity-50 group-hover:opacity-80 transition-opacity"
                        alt=""
                        draggable={false}
                    />
                )}
                <span className={`text - xs font - medium truncate ${isActive ? 'text-white' : 'text-gray-400'} `}>
                    {scene.prompt || 'Untitled Scene'}
                </span>
            </div>

            {/* Duration Tag */}
            <div className="absolute top-1 right-2 text-[10px] text-gray-400 bg-black/50 px-1 rounded flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {scene.duration}s
            </div>

            {/* Resize Handle (Right) */}
            <div
                className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-[#00FF88]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={handleResize}
                title="Click to cycle duration (2s-10s)"
            >
                <div className="w-0.5 h-8 bg-white/20" />
            </div>
        </div>
    );
};

const Timeline = () => {
    const {
        scenes, currentSceneId, selectScene, updateScene,
        currentTime, seekTo
    } = useEditor();

    const timelineRef = useRef<HTMLDivElement>(null);

    const handleTimestampClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - 16; // 16px padding offset
        const time = Math.max(0, offsetX / 40); // 40px per second
        const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

        if (time <= totalDuration) {
            seekTo(Math.round(time * 10) / 10);
        }
    };

    // Calculate total duration for ruler
    const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
    const rulerMarks = Array.from({ length: Math.ceil(totalDuration) + 5 }, (_, i) => i);

    // Calculate Playhead Position
    const playheadPos = currentTime * 40;

    return (
        <div className="w-full h-full flex flex-col bg-[#080808] border-t border-white/5 select-none">
            {/* Timeline Toolbar */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-[#0A0A0A]">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>TIMELINE</span>
                    <span className="text-[#00FF88]">{currentTime.toFixed(1)}s</span>
                </div>
                <div className="text-xs text-gray-500">
                    Total: {totalDuration}s
                </div>
            </div>

            {/* Timeline Area relative wrapper */}
            <div className="flex-1 relative overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#050505]" ref={timelineRef}>
                <div className="absolute inset-0 min-w-full h-full" onClick={handleTimestampClick}>
                    {/* Time Ruler */}
                    <div className="h-6 border-b border-white/5 flex items-end relative min-w-max px-4">
                        {rulerMarks.map((t) => (
                            <div key={t} className="absolute bottom-0 text-[10px] text-gray-600 border-l border-white/5 pl-1 h-3" style={{ left: `${t * 40 + 16} px` }}>
                                {t}s
                            </div>
                        ))}
                    </div>

                    {/* Tracks Area */}
                    <div className="p-4 pt-6 flex gap-1 min-w-max">
                        {scenes.map((scene) => (
                            <TimelineBlock
                                key={scene.id}
                                scene={scene}
                                isActive={scene.id === currentSceneId}
                                onSelect={() => selectScene(scene.id)}
                                onResize={(id, dur) => updateScene(id, { duration: dur })}
                            />
                        ))}
                    </div>

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                        style={{ left: `${playheadPos + 16} px` }}
                    >
                        <div className="absolute -top-1 -translate-x-1/2 text-red-500">
                            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
                                <path d="M5.5 12L0 0H11L5.5 12Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
