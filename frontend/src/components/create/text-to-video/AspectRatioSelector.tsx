import React from 'react';
import {
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Smartphone,
    Tv
} from 'lucide-react';

export interface AspectRatio {
    id: string;
    label: string;
    value: string;
    icon: React.ReactNode;
}

export const aspectRatios: AspectRatio[] = [
    { id: '16:9', label: 'Widescreen', value: '16:9', icon: <RectangleHorizontal className="w-4 h-4" /> },
    { id: '9:16', label: 'Vertical', value: '9:16', icon: <Smartphone className="w-4 h-4" /> },
    { id: '1:1', label: 'Square', value: '1:1', icon: <Square className="w-4 h-4" /> },
    { id: '21:9', label: 'Cinematic', value: '21:9', icon: <Tv className="w-4 h-4" /> },
    { id: '4:3', label: 'Classic', value: '4:3', icon: <RectangleVertical className="w-4 h-4" /> },
];

interface AspectRatioSelectorProps {
    selectedId: string;
    onSelect: (ratio: AspectRatio) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedId, onSelect }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">Canvas Ratio</h3>
            <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                    <button
                        key={ratio.id}
                        onClick={() => onSelect(ratio)}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${selectedId === ratio.id
                                ? 'bg-[#00FF88] border-[#00FF88] text-black shadow-[0_10px_20px_rgba(0,255,136,0.2)] scale-[1.02]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {ratio.icon}
                        <span className="text-[10px] font-black uppercase tracking-tighter">{ratio.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AspectRatioSelector;
