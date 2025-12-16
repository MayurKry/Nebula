import React from 'react';
import { useEditor } from '@/context/EditorContext';
import type { Scene } from '@/context/EditorContext';
import {
    Plus, Trash2, Copy, GripVertical, Image as ImageIcon
} from 'lucide-react';

const SceneThumbnail = ({ scene, isActive, onClick, onDelete, onDuplicate }: {
    scene: Scene;
    isActive: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onDuplicate: (e: React.MouseEvent) => void;
}) => (
    <div
        onClick={onClick}
        className={`group relative flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isActive
            ? 'bg-[#1A1A1A] border-[#00FF88]/50 shadow-[0_0_15px_-3px_rgba(0,255,136,0.1)]'
            : 'bg-transparent border-transparent hover:bg-[#141414] hover:border-white/5'
            }`}
    >
        {/* Drag Handle */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-600 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
        </div>

        {/* Thumbnail */}
        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
            {scene.thumbnail ? (
                <img src={scene.thumbnail} alt="Scene" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                </div>
            )}
            <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                {scene.duration}s
            </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-sm text-gray-300 truncate font-medium">
                {scene.prompt || 'New Scene'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
                {scene.style} • {scene.settings.transition}
            </p>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={onDuplicate}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Duplicate"
            >
                <Copy className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={onDelete}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Delete"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);

const SceneList = () => {
    const {
        scenes, currentSceneId, addScene, selectScene,
        deleteScene, duplicateScene
    } = useEditor();

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] border-r border-white/5 w-80">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Scenes</h2>
                <span className="text-xs text-gray-500">{scenes.length} clips • {scenes.reduce((acc, s) => acc + s.duration, 0)}s total</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {scenes.map((scene) => (
                    <SceneThumbnail
                        key={scene.id}
                        scene={scene}
                        isActive={scene.id === currentSceneId}
                        onClick={() => selectScene(scene.id)}
                        onDelete={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                        onDuplicate={(e) => { e.stopPropagation(); duplicateScene(scene.id); }}
                    />
                ))}
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={addScene}
                    className="w-full py-3 bg-[#141414] border border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Add New Scene</span>
                </button>
            </div>
        </div>
    );
};

export default SceneList;
