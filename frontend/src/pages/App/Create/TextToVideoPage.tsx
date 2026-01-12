import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import TextToVideoInput from '@/components/create/text-to-video/TextToVideoInput';
import TextToVideoResult from '@/components/create/text-to-video/TextToVideoResult';
import { useGeneration } from '@/components/generation/GenerationContext';
import { Sparkles } from 'lucide-react';

const TextToVideoPage = () => {
    const { projectId } = useParams();
    const { addJob } = useGeneration();

    // Workflow State
    const [step, setStep] = useState<'input' | 'result'>('input');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationData, setGenerationData] = useState<any>(null);

    // Auto-load if projectId is present (mocking this behavior for consistency with previous version)
    useEffect(() => {
        if (projectId) {
            // In a real scenario, fetch project by ID.
            // For now, we just reset to input or simulate a loaded state if needed.
            // decided to keep it simple: just show input unless we persist state.
        }
    }, [projectId]);

    const handleGenerate = async (data: { prompt: string; settings: any }) => {
        setIsGenerating(true);

        // Mock Generation Delay
        // In real app: call aiService.generateVideoProject(data)
        try {
            // Using a timeout to simulate the "Flow AI" processing time
            await new Promise(resolve => setTimeout(resolve, 3000));

            const sceneCount = data.settings.duration > 10 ? Math.ceil(data.settings.duration / 5) : 1;

            // Mock Response Structure
            const mockScenes = Array.from({ length: sceneCount }).map((_, i) => ({
                id: `scene-${Date.now()}-${i}`,
                description: i === 0 ? data.prompt : `${data.prompt} - continued sequence part ${i + 1}`,
                imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(data.prompt + " " + i)}?width=1280&height=720&nologo=true`,
                duration: 5,
            }));

            const result = {
                prompt: data.prompt,
                settings: data.settings,
                scenes: mockScenes
            };

            setGenerationData(result);
            setStep('result');
            toast.success("Video Generated Successfully!");

            // Add to background jobs strictly for tracking if needed
            addJob({
                type: 'text-to-video',
                prompt: data.prompt,
                settings: data.settings,
            });

        } catch (error) {
            toast.error("Generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveToAssets = (scene: any) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Saving to My Assets...',
                success: `Saved scene "${scene.id}" to Library!`,
                error: 'Failed to save.'
            }
        );
    };

    const handleRegenerate = async (sceneId: string, newPrompt: string) => {
        // Mock regeneration of a specific scene
        toast.info(`Regenerating scene ${sceneId} with: ${newPrompt.slice(0, 10)}...`);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {isGenerating && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,136,0.5)]"></div>
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#00FF88] animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight">Creating Cinema...</h3>
                        <p className="text-gray-400 font-medium">Nebula AI is rendering your vision.</p>
                    </div>
                </div>
            )}

            {step === 'input' && (
                <TextToVideoInput
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                />
            )}

            {step === 'result' && generationData && (
                <TextToVideoResult
                    project={generationData}
                    onBack={() => setStep('input')}
                    onSaveToAssets={handleSaveToAssets}
                    onRegenerate={handleRegenerate}
                />
            )}
        </div>
    );
};

export default TextToVideoPage;
