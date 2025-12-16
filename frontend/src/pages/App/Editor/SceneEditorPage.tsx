import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EditorProvider, useEditor } from '@/context/EditorContext';
import EditorHeader from '@/components/editor/EditorHeader';
import SceneList from '@/components/editor/SceneList';
import Timeline from '@/components/editor/Timeline';
import VideoPreview from '@/components/editor/VideoPreview';
import Inspector from '@/components/editor/Inspector';

const EditorLayout = () => {
    const { projectId } = useParams();
    const { initProject } = useEditor();

    useEffect(() => {
        if (projectId) {
            initProject(projectId);
        }
    }, [projectId]);

    return (
        <div className="h-screen flex flex-col bg-[#0A0A0A] overflow-hidden">
            <EditorHeader />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <SceneList />

                {/* Center Viewport & Timeline */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
                    {/* Viewport */}
                    <VideoPreview />

                    {/* Timeline */}
                    <div className="h-64 bg-[#0A0A0A] border-t border-white/5">
                        <Timeline />
                    </div>
                </div>

                {/* Right Inspector */}
                <Inspector />
            </div>
        </div>
    );
};

const SceneEditorPage = () => {
    return (
        <EditorProvider>
            <EditorLayout />
        </EditorProvider>
    );
};

export default SceneEditorPage;
