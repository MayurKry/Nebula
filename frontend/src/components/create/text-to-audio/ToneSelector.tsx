import React from 'react';

export const tones = [
    'Neutral', 'Professional', 'Friendly', 'Energetic',
    'Dramatic', 'Whisper', 'Shouting', 'Sad', 'Excited'
];

interface ToneSelectorProps {
    selected: string;
    onSelect: (tone: string) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ selected, onSelect }) => {
    return (
        <div className="space-y-4">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">
                Emotional Inflection
            </label>
            <div className="flex flex-wrap gap-2">
                {tones.map((tone) => {
                    const isSelected = selected === tone;
                    return (
                        <button
                            key={tone}
                            onClick={() => onSelect(tone)}
                            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border uppercase tracking-widest ${isSelected
                                ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_10px_20px_rgba(0,255,136,0.1)]'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/8'
                                }`}
                        >
                            {tone}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ToneSelector;
