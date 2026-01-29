import React from 'react';
import { Play, Pause, Check, Mic2 } from 'lucide-react';

export interface Voice {
    id: string;
    name: string;
    description: string;
    gender: 'M' | 'F';
    tone: string;
    previewUrl?: string;
}

export const voices: Voice[] = [
    { id: 'v1', name: 'James', description: 'Deep & Commanding', gender: 'M', tone: 'Professional', previewUrl: 'https://cdn.runwayml.com/presets/voices/james_preview.mp3' },
    { id: 'v2', name: 'Sophie', description: 'Warm & Friendly', gender: 'F', tone: 'Friendly', previewUrl: 'https://cdn.runwayml.com/presets/voices/sophie_preview.mp3' },
    { id: 'v3', name: 'Marcus', description: 'Energetic & Youthful', gender: 'M', tone: 'Energetic' },
    { id: 'v4', name: 'Elena', description: 'Sophisticated & Clear', gender: 'F', tone: 'Sophisticated' },
    { id: 'v5', name: 'David', description: 'Gravelly & Intense', gender: 'M', tone: 'Dramatic' },
    { id: 'v6', name: 'Aria', description: 'Soft & Ethereal', gender: 'F', tone: 'Soft' },
];

interface VoiceSelectorProps {
    selectedId: string;
    onSelect: (voice: Voice) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
    selectedId,
    onSelect
}) => {
    const [previewingId, setPreviewingId] = React.useState<string | null>(null);

    const onPreview = (voice: Voice) => {
        if (previewingId === voice.id) {
            setPreviewingId(null);
        } else {
            setPreviewingId(voice.id);
            // In a real app, play the preview audio here
        }
    };
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voices.map((voice) => {
                const isSelected = selectedId === voice.id;
                const isPreviewing = previewingId === voice.id;

                return (
                    <button
                        key={voice.id}
                        onClick={() => onSelect(voice)}
                        className={`group relative p-5 rounded-[2rem] border transition-all duration-500 text-center flex flex-col items-center gap-4 ${isSelected
                            ? 'bg-white/10 border-[#00FF88] shadow-[0_20px_40px_rgba(0,255,136,0.1)] scale-[1.02]'
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8 hover:translate-y-[-4px]'
                            }`}
                    >
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full p-1 transition-all duration-500 ${isSelected ? 'bg-gradient-to-br from-[#00FF88] to-emerald-500 rotate-12' : 'bg-white/5'
                                }`}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1A1A] border-2 border-[#1A1A1A]">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${voice.name}&backgroundColor=transparent`}
                                        alt={voice.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#00FF88] rounded-full flex items-center justify-center border-4 border-[#1A1A1A] animate-in zoom-in-0 duration-300">
                                    <Check className="w-3.5 h-3.5 text-black" />
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview(voice);
                                }}
                                className={`absolute inset-0 m-auto w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${isPreviewing
                                    ? 'bg-[#00FF88] text-black scale-100 opacity-100 shadow-[0_0_20px_#00FF88]'
                                    : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 scale-90 hover:scale-110'
                                    }`}
                            >
                                {isPreviewing ? (
                                    <Pause className="w-5 h-5 fill-current" />
                                ) : (
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                )}
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h4 className="font-black text-white text-lg tracking-tight">{voice.name}</h4>
                            <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-[#00FF88]' : 'text-gray-500'
                                }`}>
                                {voice.tone}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 group-hover:border-white/10 transition-all">
                            <Mic2 className={`w-3 h-3 ${isSelected ? 'text-[#00FF88]' : 'text-gray-600'}`} />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{voice.description}</span>
                        </div>

                        {isSelected && (
                            <div className="absolute inset-0 rounded-[2rem] bg-[#00FF88]/5 animate-pulse -z-10" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default VoiceSelector;
