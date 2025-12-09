import { useState } from 'react';
import {
    ChevronDown, ChevronUp, Sliders, Palette, Maximize2, Dice5
} from 'lucide-react';

interface AdvancedPanelProps {
    settings: {
        cameraAngle: string;
        depth: number;
        fidelity: number;
        colorTemperature: number;
    };
    onChange: (settings: any) => void;
}

const cameraAngles = [
    'Eye Level', 'Low Angle', 'High Angle', 'Dutch Angle', 'Bird\'s Eye', 'Worm\'s Eye'
];

export const AdvancedPanel: React.FC<AdvancedPanelProps> = ({ settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1A1A] hover:bg-[#1F1F1F] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#00FF88]" />
                    <span className="text-sm font-medium text-white">Advanced Options</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {isOpen && (
                <div className="p-4 bg-[#141414] space-y-4 animate-slideDown">
                    {/* Camera Angle */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Camera Angle</label>
                        <div className="grid grid-cols-3 gap-2">
                            {cameraAngles.map((angle) => (
                                <button
                                    key={angle}
                                    onClick={() => onChange({ ...settings, cameraAngle: angle })}
                                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${settings.cameraAngle === angle
                                        ? 'border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]'
                                        : 'border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    {angle}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Depth/Intensity */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Depth / Intensity</label>
                            <span className="text-xs text-[#00FF88]">{settings.depth}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.depth}
                            onChange={(e) => onChange({ ...settings, depth: parseInt(e.target.value) })}
                            className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#00FF88]"
                        />
                    </div>

                    {/* Rendering Fidelity */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Rendering Fidelity</label>
                            <span className="text-xs text-[#00FF88]">{settings.fidelity}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.fidelity}
                            onChange={(e) => onChange({ ...settings, fidelity: parseInt(e.target.value) })}
                            className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#00FF88]"
                        />
                    </div>

                    {/* Color Temperature */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Color Temperature</label>
                            <span className="text-xs text-[#00FF88]">
                                {settings.colorTemperature < 50 ? 'Cool' : settings.colorTemperature > 50 ? 'Warm' : 'Neutral'}
                            </span>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 h-2 rounded-lg bg-gradient-to-r from-blue-500 via-white to-orange-500 opacity-30" />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.colorTemperature}
                                onChange={(e) => onChange({ ...settings, colorTemperature: parseInt(e.target.value) })}
                                className="relative w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-[#00FF88]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Style selector component
interface StyleSelectorProps {
    styles: string[];
    selected: string;
    onSelect: (style: string) => void;
    icon?: React.ReactNode;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selected, onSelect, icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-300 hover:border-white/20 transition-colors"
            >
                {icon || <Palette className="w-4 h-4 text-[#00FF88]" />}
                {selected}
                <ChevronDown className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-2 z-50">
                        {styles.map((style) => (
                            <button
                                key={style}
                                onClick={() => {
                                    onSelect(style);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${selected === style ? 'text-[#00FF88]' : 'text-gray-300'
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Aspect ratio selector
interface AspectRatioSelectorProps {
    selected: string;
    onSelect: (ratio: string) => void;
}

const aspectRatios = [
    { id: '1:1', label: 'Square (1:1)', icon: '◻' },
    { id: '16:9', label: 'Landscape (16:9)', icon: '▭' },
    { id: '9:16', label: 'Portrait (9:16)', icon: '▯' },
    { id: '4:3', label: 'Classic (4:3)', icon: '◻' },
    { id: '21:9', label: 'Cinematic (21:9)', icon: '━' },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const current = aspectRatios.find(r => r.id === selected) || aspectRatios[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-300 hover:border-white/20 transition-colors"
            >
                <Maximize2 className="w-4 h-4 text-[#00FF88]" />
                {current.label}
                <ChevronDown className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-2 z-50">
                        {aspectRatios.map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => {
                                    onSelect(ratio.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-3 ${selected === ratio.id ? 'text-[#00FF88]' : 'text-gray-300'
                                    }`}
                            >
                                <span className="text-lg">{ratio.icon}</span>
                                {ratio.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Seed toggle
interface SeedToggleProps {
    enabled: boolean;
    seed: number;
    onToggle: (enabled: boolean) => void;
    onSeedChange: (seed: number) => void;
}

export const SeedToggle: React.FC<SeedToggleProps> = ({ enabled, seed, onToggle, onSeedChange }) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onToggle(!enabled)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${enabled
                    ? 'border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
            >
                <Dice5 className="w-4 h-4" />
                Seed
            </button>

            {enabled && (
                <input
                    type="number"
                    value={seed}
                    onChange={(e) => onSeedChange(parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF88]/50"
                    placeholder="Seed"
                />
            )}
        </div>
    );
};

export default AdvancedPanel;
