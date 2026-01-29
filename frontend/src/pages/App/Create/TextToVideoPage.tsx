import { useState } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/services/ai.service';
import TextToVideoInput from '@/components/create/text-to-video/TextToVideoInput';
import TextToVideoResult from '@/components/create/text-to-video/TextToVideoResult';
import { useGeneration } from '@/components/generation/GenerationContext';
import { Sparkles } from 'lucide-react';

const TextToVideoPage = () => {
    const { addJob } = useGeneration();

    // Workflow State
    const [step, setStep] = useState<'input' | 'result'>('input');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationData, setGenerationData] = useState<any>(null);

    const handleGenerate = async ({ prompt, settings }: any) => {
        setIsGenerating(true);
        try {
            const result = await aiService.generateVideo({
                prompt,
                ...settings
            });

            // Track in global system
            addJob({
                type: 'text-to-video',
                prompt,
                settings,
            });

            // Polling for completion
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await aiService.checkVideoStatus(result.jobId);
                    if (statusRes.status === 'completed') {
                        clearInterval(pollInterval);

                        setGenerationData({
                            scenes: [{
                                id: result.jobId,
                                description: prompt,
                                imageUrl: statusRes.thumbnailUrl || 'https://picsum.photos/seed/nebula/1280/720',
                                videoUrl: statusRes.videoUrl,
                                duration: settings.duration || 5
                            }],
                            settings
                        });

                        setStep('result');
                        setIsGenerating(false);
                        toast.success("Generation Complete!");
                    } else if (statusRes.status === 'failed') {
                        clearInterval(pollInterval);
                        toast.error("Generation failed.");
                        setIsGenerating(false);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 10000); // Poll every 10 seconds

        } catch (error) {
            console.error("Generation error:", error);
            toast.error("Failed to start generation.");
            setIsGenerating(false);
        }
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
                    data={generationData}
                    onPrimaryAction={() => setStep('input')}
                />
            )}
        </div>
    );
};

export default TextToVideoPage;
