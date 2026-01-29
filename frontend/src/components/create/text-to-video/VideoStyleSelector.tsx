import React from 'react';
import {
    Camera,
    Palette,
    Film,
    Wind,
    Zap,
    Tv
} from 'lucide-react';

export interface VideoStyle {
    id: string;
    label: string;
    icon: React.ReactNode;
    prompt: string;
}

export const videoStyles: VideoStyle[] = [
    { id: 'cinematic', label: 'Cinematic', icon: <Film className="w-4 h-4" />, prompt: 'high-quality cinematic style, professional lighting, 4k, detailed' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: <Zap className="w-4 h-4" />, prompt: 'cyberpunk aesthetic, neon lights, futuristic, dark moody atmosphere' },
    { id: 'anime', label: 'Anime', icon: <Tv className="w-4 h-4" />, prompt: 'anime style, vibrant colors, expressive characters, hand-drawn look' },
    { id: 'watercolor', label: 'Watercolor', icon: <Palette className="w-4 h-4" />, prompt: 'watercolor painting style, soft edges, artistic, flowing colors' },
    { id: 'noir', label: 'Noir', icon: <Camera className="w-4 h-4" />, prompt: 'film noir style, black and white, high contrast, dramatic shadows' },
    { id: 'nature', label: 'Nature', icon: <Wind className="w-4 h-4" />, prompt: 'natural lighting, realistic, organic textures, outdoor setting' },
];

interface VideoStyleSelectorProps {
    selectedId: string;
    onSelect: (style: VideoStyle) => void;
}

const VideoStyleSelector: React.FC<VideoStyleSelectorProps> = ({ selectedId, onSelect }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">Visual Preset</h3>
            <div className="grid grid-cols-2 gap-2">
                {videoStyles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => onSelect(style)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${selectedId === style.id
                                ? 'bg-[#00FF88] border-[#00FF88] text-black shadow-[0_10px_20px_rgba(0,255,136,0.2)] scale-[1.02]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <div className={`p-2 rounded-xl ${selectedId === style.id ? 'bg-black/10' : 'bg-black/20'}`}>
                            {style.icon}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight">{style.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VideoStyleSelector;
