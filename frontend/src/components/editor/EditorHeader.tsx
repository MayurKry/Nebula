import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
    ChevronLeft, Download, Share2, Undo2, Redo2, Cloud
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ExportModal from '@/components/shared/ExportModal';

const EditorHeader = () => {
    const {
        undo, redo, canUndo, canRedo, projectId
    } = useEditor();

    const [showExport, setShowExport] = useState(false);

    return (
        <header className="h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-4 z-40">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-4">
                <Link
                    to="/app/dashboard"
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-sm font-semibold text-white">Project {projectId || 'Untitled'}</h1>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>Changes saved</span>
                    </div>
                </div>
            </div>

            {/* Center: Playback & History */}
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#141414] rounded-lg p-1 border border-white/5">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Cloud className="w-3 h-3" />
                    <span>Auto-saved</span>
                </button>

                <div className="h-6 w-px bg-white/10" />

                <button
                    className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-[#252525] transition-colors flex items-center gap-2 border border-white/10"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>

                <button
                    onClick={() => setShowExport(true)}
                    className="px-4 py-2 bg-[#00FF88] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#00FF88]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[#00FF88]/20"
                >
                    <Download className="w-4 h-4" />
                    Export Video
                </button>
            </div>

            <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
        </header>
    );
};

export default EditorHeader;
