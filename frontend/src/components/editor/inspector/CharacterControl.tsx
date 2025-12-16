import { useEditor } from '@/context/EditorContext';
import { User, Globe, Mic } from 'lucide-react';

const REGIONS = [
    { id: 'na', name: 'North America', faces: ['na1', 'na2', 'na3'] },
    { id: 'eu', name: 'Europe', faces: ['eu1', 'eu2', 'eu3'] },
    { id: 'asia', name: 'Asia', faces: ['asia1', 'asia2', 'asia3'] },
];

const VOICES = [
    { id: 'en-us-m', lang: 'English (US)', gender: 'Male', accent: 'American' },
    { id: 'en-us-f', lang: 'English (US)', gender: 'Female', accent: 'American' },
    { id: 'en-uk-m', lang: 'English (UK)', gender: 'Male', accent: 'British' },
    { id: 'en-uk-f', lang: 'English (UK)', gender: 'Female', accent: 'British' },
];

const CharacterControl = () => {
    const { scenes, currentSceneId, updateScene } = useEditor();

    // Safety check if no scene selected
    if (!currentSceneId) return <div className="p-4 text-center text-gray-500">No scene selected</div>;

    const scene = scenes.find(s => s.id === currentSceneId);
    if (!scene) return null;

    const handleRegionChange = (regionIdx: string) => {
        const region = REGIONS.find(r => r.id === regionIdx);
        if (region) {
            updateScene(currentSceneId, {
                character: {
                    region: region.id,
                    faceId: region.faces[0] // Set default face
                }
            });
        }
    };

    const handleVoiceChange = (voiceId: string) => {
        const voice = VOICES.find(v => v.id === voiceId);
        if (voice) {
            updateScene(currentSceneId, {
                voice: {
                    voiceId: voice.id,
                    language: voice.lang,
                    accent: voice.accent,
                    gender: voice.gender
                }
            });
        }
    };

    // Initialize character if not present
    const ensureCharacter = () => {
        if (!scene.character) {
            updateScene(currentSceneId, {
                character: { region: 'na', faceId: 'na1' }
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Enable Character Toggle */}
            <div className="flex items-center justify-between p-1 bg-[#141414] rounded-lg border border-white/10">
                <span className="text-sm font-medium text-gray-300 ml-3">Include Character</span>
                <label className="relative inline-flex items-center cursor-pointer p-1">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!scene.character}
                        onChange={(e) => {
                            if (e.target.checked) ensureCharacter();
                            else updateScene(currentSceneId, { character: undefined, voice: undefined });
                        }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:start-[6px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00FF88]"></div>
                </label>
            </div>

            {scene.character && (
                <>
                    {/* Face Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-[#00FF88] font-medium">
                            <User className="w-4 h-4" />
                            Face Selection
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5 ml-1">Region</label>
                            <div className="grid grid-cols-3 gap-2">
                                {REGIONS.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => handleRegionChange(r.id)}
                                        className={`px-3 py-2 text-xs rounded-lg border transition-all ${scene.character?.region === r.id
                                            ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                                            : 'bg-[#141414] border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5 ml-1">Presets</label>
                            <div className="grid grid-cols-4 gap-2">
                                {REGIONS.find(r => r.id === scene.character?.region)?.faces.map(face => (
                                    <button
                                        key={face}
                                        onClick={() => updateScene(currentSceneId, {
                                            character: { ...scene.character!, faceId: face }
                                        })}
                                        className={`aspect-square rounded-lg border overflow-hidden relative group ${scene.character?.faceId === face
                                            ? 'border-[#00FF88] ring-2 ring-[#00FF88]/20'
                                            : 'border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <img
                                            src={`https://picsum.photos/seed/${face}/100/100`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Voice Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-purple-400 font-medium">
                            <Mic className="w-4 h-4" />
                            Voice Selection
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {VOICES.map(voice => (
                                <button
                                    key={voice.id}
                                    onClick={() => handleVoiceChange(voice.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${scene.voice?.voiceId === voice.id
                                        ? 'bg-purple-500/10 border-purple-500/50'
                                        : 'bg-[#141414] border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div>
                                        <div className={`text-sm font-medium ${scene.voice?.voiceId === voice.id ? 'text-purple-400' : 'text-gray-200'}`}>
                                            {voice.lang}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {voice.gender}, {voice.accent}
                                        </div>
                                    </div>
                                    {scene.voice?.voiceId === voice.id && (
                                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Validation Warning */}
                        {scene.character.region === 'asia' && scene.voice?.language.includes('English') && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
                                <Globe className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-yellow-200/80">
                                    Region mismatch: Asian character with English voice. This might look unnatural.
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CharacterControl;
