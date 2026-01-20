import React from 'react';
import { Sparkles, Video, Zap, Wand2, Wand, Globe, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoItemProps {
    title: string;
    description: string;
    icon: React.ElementType;
    className?: string;
    iconClassName?: string;
    badge?: string;
}

const BentoItem = ({ title, description, icon: Icon, className, iconClassName, badge }: BentoItemProps) => (
    <div className={cn(
        "group relative overflow-hidden rounded-3xl border border-[var(--marketing-border)] bg-[var(--marketing-card)] p-8 transition-all duration-300 hover:border-[var(--marketing-accent)]/30 hover:bg-[var(--marketing-card-hover)] hover:shadow-2xl hover:shadow-[var(--marketing-accent)]/10",
        className
    )}>
        <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
                <div className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--marketing-accent)]/10 transition-colors group-hover:bg-[var(--marketing-accent)]/20",
                    iconClassName
                )}>
                    <Icon className="h-6 w-6 text-[var(--marketing-accent)]" />
                </div>
                {badge && (
                    <span className="mb-2 inline-block rounded-full bg-[var(--marketing-accent)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--marketing-accent)]">
                        {badge}
                    </span>
                )}
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[var(--marketing-accent)] transition-colors">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--marketing-muted)]">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[var(--marketing-accent)] opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowUpRight className="h-3 w-3" />
            </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[var(--marketing-accent)]/5 blur-2xl transition-all group-hover:bg-[var(--marketing-accent)]/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl transition-all group-hover:bg-purple-500/10" />
    </div>
);

const BentoGrid = () => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-3 lg:gap-6">
            {/* Gen-4 AI Engine (Large) -> Nebula Cortex */}
            <BentoItem
                title="Nebula Cortex"
                description="Powered by Gemini 2.0. Multimodal reasoning engine that acts as the creative director, managing script context, narrative flow, and intricate prompt engineering."
                icon={Sparkles}
                className="md:col-span-2 md:row-span-2"
                iconClassName="h-16 w-16"
                badge="Reasoning Core"
            />

            {/* AI Video Generation (Wide) -> Nebula Motion */}
            <BentoItem
                title="Nebula Motion"
                description="Powered by Runway Gen-3 Alpha. Cinematic video generation with advanced physics simulation, complex lighting, and high-fidelity temporal consistency."
                icon={Video}
                className="md:col-span-2 md:row-span-1"
                badge="Cinematic Physics"
            />

            {/* Real-time Rendering (Small) -> Nebula Vision */}
            <BentoItem
                title="Nebula Vision"
                description="Powered by Imagen 3 Ultra & FLUX.1. Photorealistic asset synthesis."
                icon={Zap}
                className="md:col-span-1 md:row-span-1"
            />

            {/* Storyboarding (Tall) -> Nebula Orchestrator */}
            <BentoItem
                title="Nebula Orchestrator"
                description="Our proprietary multi-agent swarm architecture. Scores of specialized AI agents collaborate to handle production tasks in parallel, from sound design to color grading."
                icon={Wand2}
                className="md:col-span-1 md:row-span-2"
                badge="Agent Swarm"
            />

            {/* VFX & Styles (Wide) -> Nebula Voice */}
            <BentoItem
                title="Nebula Voice"
                description="Powered by ElevenLabs Turbo v2.5. Human-parity audio synthesis with emotive range, multi-speaker capabilities, and dynamic sound scaling."
                icon={Wand}
                className="md:col-span-2 md:row-span-1"
            />

            {/* Global Scale (Small) -> Infrastructure */}
            <BentoItem
                title="H100 Clusters"
                description="Enterprise-grade compute on Tier-1 GPUs for sub-second inference."
                icon={Globe}
                className="md:col-span-1 md:row-span-1"
            />
        </div>
    );
};

export default BentoGrid;
