import { Layers, Sparkles } from 'lucide-react';
import NLEEditor from '@/components/editor/NLEEditor';

const VideoEditorPreviewPage = () => {
    // Mock project for the preview
    const mockProject: any = {
        id: 'preview',
        scenes: [
            {
                id: '1',
                imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
                description: 'Cinematic preview scene',
                duration: 5,
                properties: { opacity: 100, scale: 100 }
            }
        ],
        settings: { duration: 30, style: 'Cinematic' }
    };

    return (
        <div className="h-full bg-[#0A0A0A] flex flex-col relative overflow-hidden">
            <div className="bg-purple-900/30 border-b border-purple-500/30 px-4 py-2 text-center relative z-50">
                <span className="text-xs font-bold text-purple-200 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Preview Mode: Vision of Future Pro Editor
                </span>
            </div>

            <div className="flex-1 relative pointer-events-none opacity-40 grayscale-[0.3] select-none">
                <NLEEditor
                    initialProject={mockProject}
                    onGoBack={() => { }}
                />
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md text-center space-y-6 shadow-2xl pointer-events-auto mx-4">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Layers className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Advanced Editor Coming Soon</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        This tool demonstrates our vision for a full-featured Non-Linear Editor within Nebula.
                        <br /><br />
                        Future capabilities will include multi-track compositing, advanced effects, keyframe animation, and precision audio mixing.
                    </p>
                    <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full inline-block">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Roadmap Item: Q3 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoEditorPreviewPage;
