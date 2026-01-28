import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { aiService } from '@/services/ai.service';
import { assetService } from '@/services/asset.service';
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

        try {
            // Real API Call
            const response = await aiService.generateVideo({
                prompt: data.prompt,
                model: data.settings.model,
                style: data.settings.style || 'Cinematic', // Use settings style
                duration: data.settings.duration
            });

            // If immediate error
            if (!response || !response.jobId) {
                throw new Error("Failed to start video generation");
            }

            const jobId = response.jobId;
            toast.success("Generation started! Rendering video...");

            // Poll for completion
            let attempts = 0;
            const maxAttempts = 30; // 30 * 10s = 5 minutes (Veo is fast but let's be safe)

            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const statusRes = await aiService.checkVideoStatus(jobId);
                    const status = statusRes.status as string;

                    if (status === 'completed' || status === 'succeeded') { // Handle both statii
                        clearInterval(pollInterval);

                        // Construct success result
                        const result = {
                            prompt: data.prompt,
                            settings: data.settings,
                            scenes: [{
                                id: jobId,
                                description: data.prompt,
                                imageUrl: statusRes.thumbnailUrl || statusRes.videoUrl, // Use video thumbnail or url
                                videoUrl: statusRes.videoUrl,
                                duration: data.settings.duration
                            }]
                        };

                        setGenerationData(result);
                        setStep('result');
                        setIsGenerating(false);
                        toast.success("Video Generated Successfully!");

                        // Add to context for history tracking
                        addJob({
                            type: 'text-to-video',
                            prompt: data.prompt,
                            settings: data.settings,
                        });
                    } else if (statusRes.status === 'failed') {
                        clearInterval(pollInterval);
                        setIsGenerating(false);
                        toast.error("Video generation failed via API.");
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        setIsGenerating(false);
                        toast.error("Generation timed out. Please check History later.");
                    }
                    // If processing, continue polling
                } catch (e) {
                    console.error("Polling error:", e);
                    // Don't stop polling on transient network error, but maybe limit errors?
                }
            }, 10000); // Poll every 10 seconds

        } catch (error) {
            console.error("Generation error:", error);
            toast.error("Failed to start generation.");
            setIsGenerating(false);
        }
        // Note: moved setIsGenerating(false) into polling completion to keep loader active
    };

    const handleSaveToAssets = async (scene: any) => {
        try {
            await assetService.createAsset({
                name: scene.description.slice(0, 50) || 'Generated Video',
                type: 'video',
                url: scene.videoUrl,
                thumbnailUrl: scene.imageUrl,
                duration: scene.duration
            });
            toast.success("Saved to Asset Library!");
        } catch (error) {
            console.error("Failed to save asset:", error);
            toast.error("Failed to save to assets.");
        }
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
