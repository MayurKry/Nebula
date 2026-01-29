import React, { useRef, useState } from 'react';
import { Play, Pause, Download, Share2, Clock, Sparkles, RotateCw, Zap } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export interface AudioResult {
    id: string;
    url: string;
    prompt: string;
    voiceId: string;
    tone: string;
    timestamp: Date;
}

interface AudioResultCardProps {
    audio: AudioResult;
    onDownload: (url: string, name: string) => void;
    onRegenerate: () => void;
}

const AudioResultCard: React.FC<AudioResultCardProps> = ({ audio, onDownload, onRegenerate }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[#141414] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">
            <audio
                ref={audioRef}
                src={audio.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <div className="p-10 space-y-8">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 max-w-[70%]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-full">
                            <Sparkles className="w-3.5 h-3.5 text-[#00FF88]" />
                            <span className="text-[10px] font-black text-[#00FF88] uppercase tracking-[0.2em]">Synthesis Complete</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter leading-none italic opacity-90 line-clamp-2">
                            "{audio.prompt}"
                        </h3>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onRegenerate}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 transition-all hover:text-white"
                        >
                            <RotateCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDownload(audio.url, `nebula-${audio.id}`)}
                            className="p-3 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 rounded-2xl text-[#00FF88] transition-all"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative bg-black/40 rounded-[2.5rem] p-12 border border-white/5 group overflow-hidden">
                    <div className={`absolute inset-0 bg-[#00FF88]/5 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />

                    <div className="relative z-10 space-y-8">
                        <AudioVisualizer isActive={isPlaying} sensitivity={1.2} />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Model</p>
                                    <p className="text-xs font-bold text-white uppercase">Master Quality Render</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-mono text-gray-400 font-bold bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                <Clock className="w-4 h-4 text-[#00FF88]" />
                                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 bg-black/20 p-6 rounded-[2rem] border border-white/5">
                    <button
                        onClick={togglePlay}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isPlaying
                                ? 'bg-white text-black scale-105'
                                : 'bg-[#00FF88] text-black hover:scale-110 shadow-[0_0_30px_rgba(0,255,136,0.3)]'
                            }`}
                    >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>

                    <div className="flex-1 space-y-4">
                        <div
                            className="h-2 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer group/progress"
                            onClick={(e) => {
                                if (!audioRef.current) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const pct = x / rect.width;
                                audioRef.current.currentTime = pct * audioRef.current.duration;
                            }}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-[#00FF88] via-emerald-400 to-[#00FF88] transition-all relative"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${audio.voiceId}`}
                                    alt={audio.voiceId}
                                    className="w-6 h-6 rounded-full bg-white/5"
                                />
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{audio.voiceId} Synthetic Fluidity</span>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black text-[#00FF88] uppercase tracking-widest hover:underline">
                                <Share2 className="w-3.5 h-3.5" />
                                Share Audio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioResultCard;
