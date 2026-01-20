
import { Sparkles } from 'lucide-react';

const Palettes = [
    {
        name: "Current Tech Green",
        description: "Your current high-tech, matrix-inspired branding.",
        colors: [
            { name: "Background", hex: "#0A0A0A" },
            { name: "Card", hex: "#141414" },
            { name: "Accent", hex: "#00FF88" },
            { name: "Muted", hex: "#8E8E93" },
        ]
    },
    {
        name: "Orion Nebula",
        description: "Authentic cosmetic clouds. Deep purples and ionizing bright pinks.",
        colors: [
            { name: "Void", hex: "#210535" },
            { name: "Deep Dust", hex: "#430D4B" },
            { name: "Ionized Gas", hex: "#7B337D" },
            { name: "Stellar Core", hex: "#C874B2" },
            { name: "Highlight", hex: "#F5D5E0" },
        ]
    },
    {
        name: "Lagoon Nebula",
        description: "Deep cosmic oceans. Cyans, teals, and deep blues.",
        colors: [
            { name: "Abyss", hex: "#010B19" },
            { name: "Deep Blue", hex: "#03214A" },
            { name: "Nebula Blue", hex: "#3D94AE" },
            { name: "Starlight", hex: "#B5FFF6" },
        ]
    },
    {
        name: "Carina Nebula",
        description: "Warm, dusty, and majestic. Coppers, deep browns, and glowing oranges.",
        colors: [
            { name: "Dust Lane", hex: "#26110E" },
            { name: "Cosmic Rust", hex: "#7A3E26" },
            { name: "Gas Gloom", hex: "#C46D42" },
            { name: "Star Birth", hex: "#F2A766" },
        ]
    },
    {
        name: "Pillars of Creation",
        description: "Ethereal and mysterious. Soft golds, teals, and deep space blacks.",
        colors: [
            { name: "Deep Space", hex: "#0B1026" },
            { name: "Pillar Teal", hex: "#2B3A42" },
            { name: "Ion Gold", hex: "#BF9B30" },
            { name: "Gas Cloud", hex: "#489BCF" },
        ]
    }
];

const ThemeExplorer = () => {
    return (
        <div className="min-h-screen bg-black text-white p-20 font-sans">
            <h1 className="text-5xl font-bold mb-4">Nebula Theme Explorer</h1>
            <p className="text-xl text-gray-400 mb-16 max-w-2xl">
                Comparing your current branding with authentic color palettes extracted from NASA imagery of real nebulae.
            </p>

            <div className="space-y-20">
                {Palettes.map((palette) => (
                    <div key={palette.name}>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <Sparkles className="w-6 h-6" style={{ color: palette.colors[2].hex }} />
                                {palette.name}
                            </h2>
                            <p className="text-gray-400">{palette.description}</p>
                        </div>

                        {/* Color Swatches */}
                        <div className="flex gap-4 mb-8">
                            {palette.colors.map((color) => (
                                <div key={color.hex} className="flex flex-col gap-2">
                                    <div
                                        className="w-32 h-32 rounded-2xl shadow-lg border border-white/10"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <div className="text-sm">
                                        <div className="font-bold">{color.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{color.hex}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* UI Mockup */}
                        <div
                            className="p-10 rounded-3xl border border-white/10 max-w-4xl"
                            style={{
                                backgroundColor: palette.colors[0].hex,
                                borderColor: palette.colors[1].hex
                            }}
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div className="font-bold text-xl" style={{ color: palette.colors[palette.colors.length - 1].hex }}>Nebula Studio</div>
                                <button
                                    className="px-6 py-2 rounded-full font-bold text-sm transition-transform hover:scale-105"
                                    style={{
                                        backgroundColor: palette.colors[2].hex,
                                        color: palette.name === "Current Tech Green" ? "#000" : "#FFF"
                                    }}
                                >
                                    Start Creating
                                </button>
                            </div>

                            <h3 className="text-6xl font-black mb-6 leading-tight">
                                The <span style={{ color: palette.colors[2].hex }}>Multi-Model</span><br />
                                AI Foundry
                            </h3>

                            <p className="max-w-xl text-lg opacity-80 mb-8" style={{ color: palette.colors[palette.colors.length - 1].hex }}>
                                Orchestrate the universe's most powerful models. Transform your creative workflow with authentic cosmic power.
                            </p>

                            <div className="flex gap-4">
                                <div
                                    className="w-full h-40 rounded-xl opacity-20"
                                    style={{ background: `linear-gradient(45deg, ${palette.colors[2].hex}, transparent)` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemeExplorer;
