import React, { useState } from 'react';
import { X, Check, Download, Video } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'config' | 'rendering' | 'success'>('config');
    const [progress, setProgress] = useState(0);

    if (!isOpen) return null;

    const handleExport = () => {
        setStep('rendering');
        let currentProgress = 0;

        const interval = setInterval(() => {
            currentProgress += 2; // Fast simulation
            if (currentProgress > 100) {
                currentProgress = 100;
                clearInterval(interval);
                setStep('success');
            }
            setProgress(currentProgress);
        }, 50);
    };

    const handleClose = () => {
        if (step === 'rendering') return; // Prevent closing during render
        setStep('config');
        setProgress(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    disabled={step === 'rendering'}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white disabled:opacity-0"
                >
                    <X className="w-5 h-5" />
                </button>

                {step === 'config' && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-[#00FF88]/20 flex items-center justify-center">
                                <Video className="w-5 h-5 text-[#00FF88]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Export Video</h2>
                                <p className="text-sm text-gray-400">Choose export settings</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm text-gray-300 font-medium mb-2 block">Resolution</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2 bg-[#1A1A1A] border border-[#00FF88] text-white rounded-lg text-sm font-medium">1080p HD</button>
                                    <button className="py-2 bg-[#1A1A1A] border border-white/10 text-gray-400 rounded-lg text-sm font-medium hover:border-white/20">4K Ultra</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 font-medium mb-2 block">Format</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2 bg-[#1A1A1A] border border-[#00FF88] text-white rounded-lg text-sm font-medium">MP4 (H.264)</button>
                                    <button className="py-2 bg-[#1A1A1A] border border-white/10 text-gray-400 rounded-lg text-sm font-medium hover:border-white/20">MOV (ProRes)</button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            className="w-full py-3 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#00FF88]/90 transition-all"
                        >
                            Start Rendering
                        </button>
                    </div>
                )}

                {step === 'rendering' && (
                    <div className="p-8 text-center space-y-6">
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48" cy="48" r="40"
                                    fill="none"
                                    stroke="#333"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="48" cy="48" r="40"
                                    fill="none"
                                    stroke="#00FF88"
                                    strokeWidth="8"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                                    className="transition-all duration-300 ease-out"
                                />
                            </svg>
                            <span className="absolute text-xl font-bold text-white">{progress}%</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Rendering Video...</h3>
                            <p className="text-sm text-gray-400">Please wait while we process your scenes.</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-[#00FF88]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-[#00FF88]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Export Complete!</h3>
                            <p className="text-sm text-gray-400">Your video is ready for download.</p>
                        </div>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#00FF88]/90 transition-all flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                Download MP4
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full py-3 bg-[#1A1A1A] text-white font-medium rounded-xl hover:bg-[#252525] transition-all"
                            >
                                Back to Editor
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportModal;
