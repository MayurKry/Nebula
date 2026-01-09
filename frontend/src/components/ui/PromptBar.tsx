import React, { useRef, useEffect } from 'react';
import { Paperclip, Settings2, ArrowUp, Wand2, X } from 'lucide-react';

interface PromptBarProps {
    value: string;
    onChange: (value: string) => void;
    onGenerate: () => void;
    onEnhance?: () => void;
    placeholder?: string;
    isGenerating?: boolean;
    isEnhancing?: boolean;
    onFileSelect?: (file: File) => void;
    settings?: any;
    onSettingsChange?: (settings: any) => void;
    actions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
}

const PromptBar: React.FC<PromptBarProps> = ({
    value,
    onChange,
    onGenerate,
    onEnhance,
    onFileSelect,
    settings,
    onSettingsChange,
    placeholder = "Ask anything",
    isGenerating = false,
    isEnhancing = false,
    actions = []
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSettings, setShowSettings] = React.useState(false);
    const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
            onFileSelect?.(file);
            // In a real app, you'd show a preview or chips
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="relative bg-[#141414] border border-white/10 rounded-[24px] p-2 shadow-2xl focus-within:border-[#00FF88]/40 transition-all duration-300">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />

                {attachedFile && (
                    <div className="px-4 pt-2 flex items-center gap-2">
                        <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 text-xs text-gray-400 group/file">
                            <span className="truncate max-w-[150px]">{attachedFile.name}</span>
                            <button
                                onClick={() => setAttachedFile(null)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="px-4 pt-4 pb-2">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-600 resize-none min-h-[60px] max-h-[200px] py-1 scrollbar-hide"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!isGenerating && value.trim()) onGenerate();
                            }
                        }}
                    />
                </div>

                <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-white/5 mt-1">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleFileClick}
                            className={`p-2.5 rounded-xl hover:bg-white/5 transition-all group relative ${attachedFile ? 'text-[#00FF88]' : 'text-gray-400 hover:text-white'}`}
                            title="Attach Files"
                        >
                            <Paperclip className={`w-5 h-5 group-hover:rotate-12 transition-transform ${attachedFile ? 'rotate-12' : ''}`} />
                            <div className={`absolute top-2 right-2 w-1.5 h-1.5 bg-[#00FF88] rounded-full transition-opacity ${attachedFile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        </button>

                        {onEnhance && (
                            <button
                                onClick={onEnhance}
                                disabled={isEnhancing || !value.trim()}
                                className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#00FF88] transition-all group disabled:opacity-30 flex items-center gap-2"
                                title="Enhance Prompt"
                            >
                                <Wand2 className={`w-5 h-5 group-hover:scale-110 transition-transform ${isEnhancing ? 'animate-spin' : ''}`} />
                                {value.trim() && <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Enhance</span>}
                            </button>
                        )}

                        <div className="relative" ref={popoverRef}>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-2.5 rounded-xl hover:bg-white/5 transition-all group ${showSettings ? 'text-[#00FF88] bg-white/5' : 'text-gray-400 hover:text-white'}`}
                                title="Generation Settings"
                            >
                                <Settings2 className={`w-5 h-5 group-hover:rotate-90 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full left-0 mb-4 w-72 bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Generation Settings</h4>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Quality Mode</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Fast', 'Pro'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => onSettingsChange?.({ ...settings, quality: mode })}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs transition-all font-medium ${settings?.quality === mode ? 'bg-[#00FF88] text-black border-[#00FF88]' : 'bg-white/5 border-white/5 text-white hover:border-[#00FF88]/40'}`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Aspect Ratio</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['1:1', '16:9', '9:16'].map(ratio => (
                                                    <button
                                                        key={ratio}
                                                        onClick={() => onSettingsChange?.({ ...settings, aspectRatio: ratio })}
                                                        className={`px-2 py-1.5 border rounded-lg text-[10px] transition-all ${settings?.aspectRatio === ratio ? 'bg-[#00FF88] text-black border-[#00FF88]' : 'bg-white/5 border-white/5 text-white hover:border-[#00FF88]/40'}`}
                                                    >
                                                        {ratio}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-white/5">
                                            <button className="w-full py-2 bg-[#00FF88] text-black text-xs font-bold rounded-xl hover:opacity-90 transition-all">
                                                Apply Parameters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !value.trim()}
                        className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${value.trim()
                            ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                            : 'bg-white/5 text-gray-700 cursor-not-allowed scale-95'
                            }`}
                    >
                        {isGenerating ? (
                            <div className="w-5 h-5 border-[2.5px] border-black/20 border-t-black animate-spin rounded-full" />
                        ) : (
                            <ArrowUp className="w-6 h-6 stroke-[3.5px]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Prompt Pills / Suggestions */}
            {actions.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2.5 px-4">
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#141414] border border-white/5 hover:border-white/20 rounded-full text-[13px] font-medium text-gray-400 hover:text-white transition-all hover:bg-white/10 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromptBar;
