import React, { useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface PromptBarProps {
    value: string;
    onChange: (value: string) => void;
    onGenerate: () => void;
    placeholder?: string;
    isGenerating?: boolean;
    actions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
    extraActions?: React.ReactNode;
}

const PromptBar: React.FC<PromptBarProps> = ({
    value,
    onChange,
    onGenerate,
    placeholder = "Ask anything",
    isGenerating = false,
    actions = [],
    extraActions,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                        {extraActions}
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
