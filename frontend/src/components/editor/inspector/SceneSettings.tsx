import { useEditor } from '@/context/EditorContext';
import { Camera, Zap, Sun, Move } from 'lucide-react';

const SceneSettings = () => {
    const { scenes, currentSceneId, updateScene } = useEditor();

    // Safety check if no scene selected
    if (!currentSceneId) return <div className="p-4 text-center text-gray-500">No scene selected</div>;

    const scene = scenes.find(s => s.id === currentSceneId);
    if (!scene) return null;

    return (
        <div className="space-y-6">
            {/* Prompt Editor */}
            <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium ml-1">Scene Prompt</label>
                <textarea
                    value={scene.prompt}
                    onChange={(e) => updateScene(currentSceneId, { prompt: e.target.value })}
                    className="w-full h-32 bg-[#141414] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/50 resize-none"
                    placeholder="Describe your scene..."
                />
            </div>

            {/* Camera Motion */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                    <Camera className="w-4 h-4 text-[#00FF88]" />
                    Camera Movement
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {['Static', 'Pan Left', 'Pan Right', 'Zoom In', 'Zoom Out', 'Orbit'].map(move => (
                        <button
                            key={move}
                            onClick={() => updateScene(currentSceneId, {
                                settings: { ...scene.settings, cameraRequest: move }
                            })}
                            className={`px-3 py-2 text-xs rounded-lg border transition-all ${scene.settings.cameraRequest === move
                                ? 'bg-white/10 border-white/30 text-white'
                                : 'bg-[#141414] border-white/10 text-gray-400 hover:border-white/20'
                                }`}
                        >
                            {move}
                        </button>
                    ))}
                </div>
            </div>

            {/* Intensity Slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Motion Intensity
                    </div>
                    <span className="text-xs text-gray-500">{scene.settings.motionIntensity}%</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="100"
                    value={scene.settings.motionIntensity}
                    onChange={(e) => updateScene(currentSceneId, {
                        settings: { ...scene.settings, motionIntensity: parseInt(e.target.value) }
                    })}
                    className="w-full accent-[#00FF88] h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Lighting */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                    <Sun className="w-4 h-4 text-orange-400" />
                    Lighting
                </div>
                <select
                    value={scene.settings.lighting}
                    onChange={(e) => updateScene(currentSceneId, {
                        settings: { ...scene.settings, lighting: e.target.value }
                    })}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                    {['Natural', 'Cinematic', 'Golden Hour', 'Neon', 'Dramatic', 'Studio'].map(l => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
            </div>

            {/* Transition */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                    <Move className="w-4 h-4 text-blue-400" />
                    Transition
                </div>
                <div className="flex gap-2">
                    {['cut', 'fade'].map(t => (
                        <button
                            key={t}
                            onClick={() => updateScene(currentSceneId, {
                                settings: { ...scene.settings, transition: t as 'cut' | 'fade' }
                            })}
                            className={`flex-1 py-2 text-xs uppercase font-medium rounded-lg border transition-all ${scene.settings.transition === t
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                : 'bg-[#141414] border-white/10 text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SceneSettings;
