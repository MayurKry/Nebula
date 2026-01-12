import { useState } from 'react';
import { X, Scissors } from 'lucide-react';

interface TrimmerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string; // If actual video exists
    duration: number; // Total duration
    onTrimConfirm: (start: number, end: number) => void;
}

const TrimmerModal = ({ isOpen, onClose, videoUrl, duration, onTrimConfirm }: TrimmerModalProps) => {
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(duration);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-6">

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-[#00FF88]" />
                        Trim Video
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    {/* Placeholder for video player since we might mostly have images in this mock */}
                    {videoUrl ? (
                        <video src={videoUrl} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-gray-500 text-sm">Video Preview Unavailable</div>
                    )}
                </div>

                {/* Timeline Slider */}
                <div className="relative h-12 bg-[#222] rounded-lg mb-6 overflow-hidden select-none">
                    {/* Track */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-white/10 rounded-full mx-2" />
                    {/* Active Region */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-2 bg-[#00FF88] rounded-full"
                        style={{
                            left: `${(start / duration) * 100}%`,
                            width: `${((end - start) / duration) * 100}%`
                        }}
                    />

                    {/* Handles - Mocking Interactivity for simplicity in this artifact */}
                    <input
                        type="range" min="0" max={duration} step="0.1"
                        value={start}
                        onChange={e => setStart(Math.min(parseFloat(e.target.value), end - 0.5))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                    />
                    <input
                        type="range" min="0" max={duration} step="0.1"
                        value={end}
                        onChange={e => setEnd(Math.max(parseFloat(e.target.value), start + 0.5))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                    />

                    <div className="absolute top-0 bottom-0 bg-white/20 w-1 pointer-events-none" style={{ left: `${(start / duration) * 100}%` }} />
                    <div className="absolute top-0 bottom-0 bg-white/20 w-1 pointer-events-none" style={{ left: `${(end / duration) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                        <span>Start: <span className="text-white">{start.toFixed(1)}s</span></span>
                        <span>End: <span className="text-white">{end.toFixed(1)}s</span></span>
                        <span>Duration: <span className="text-[#00FF88]">{(end - start).toFixed(1)}s</span></span>
                    </div>
                    <button
                        onClick={() => onTrimConfirm(start, end)}
                        className="px-6 py-2 bg-[#00FF88] text-black font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-wider"
                    >
                        Apply Trim
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TrimmerModal;
