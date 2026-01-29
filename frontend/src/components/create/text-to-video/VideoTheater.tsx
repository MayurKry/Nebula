import React, { useRef, useState } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Download,
    RefreshCw,
    Film
} from 'lucide-react';

interface VideoTheaterProps {
    videoUrl: string;
    thumbnailUrl?: string;
    title?: string;
    onDownload?: () => void;
}

const VideoTheater: React.FC<VideoTheaterProps> = ({
    videoUrl,
    thumbnailUrl,
    title = "Untitled Production",
    onDownload
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(p);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    return (
        <div className="relative group bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 aspect-video">
            <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnailUrl}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between transform -translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                        <Film className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#00FF88] uppercase tracking-widest">Cinema Studio</p>
                        <h4 className="text-white font-bold text-xs truncate max-w-[200px]">{title}</h4>
                    </div>
                </div>
                {onDownload && (
                    <button
                        onClick={onDownload}
                        className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-[#00FF88] hover:text-black transition-all text-white"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Center Play Button (Large) */}
            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-20 h-20 bg-[#00FF88] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-110 transition-transform z-20"
                >
                    <Play className="w-8 h-8 text-black fill-current ml-1" />
                </button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 inset-x-0 p-8 space-y-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                {/* Progress Bar */}
                <div
                    className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress relative"
                    onClick={(e) => {
                        if (!videoRef.current) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const pct = x / rect.width;
                        videoRef.current.currentTime = pct * videoRef.current.duration;
                    }}
                >
                    <div
                        className="h-full bg-[#00FF88] shadow-[0_0_10px_#00FF88] transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-[#00FF88] transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>

                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-[#00FF88] transition-colors">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <span className="text-[10px] font-mono text-gray-400 font-bold">
                                {Math.floor(videoRef.current?.currentTime || 0)}s / {Math.floor(duration)}s
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-white hover:text-[#00FF88] transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={handleFullscreen} className="text-white hover:text-[#00FF88] transition-colors">
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Indicator */}
            {isPlaying && !videoRef.current?.readyState && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default VideoTheater;
