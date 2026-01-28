import { useState } from 'react';
import { Settings2, User } from 'lucide-react';
import SceneSettings from './inspector/SceneSettings';
import CharacterControl from './inspector/CharacterControl';

const Inspector = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'character'>('settings');

    return (
        <div className="w-80 border-l border-white/5 bg-[#0a0a0a] flex flex-col h-full">
            {/* Tabs */}
            <div className="flex p-1 m-4 mb-2 bg-[#141414] rounded-xl border border-white/10">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'settings'
                        ? 'bg-white/5 text-white shadow-sm border border-white/10'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    Settings
                </button>
                <button
                    onClick={() => setActiveTab('character')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'character'
                        ? 'bg-white/5 text-white shadow-sm border border-white/10'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <User className="w-3.5 h-3.5" />
                    Character
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'settings' ? <SceneSettings /> : <CharacterControl />}
            </div>
        </div>
    );
};

export default Inspector;
