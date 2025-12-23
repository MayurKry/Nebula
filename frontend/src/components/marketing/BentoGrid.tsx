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
            {/* Gen-4 AI Engine (Large) */}
            <BentoItem
                title="Gen-4 AI Engine"
                description="Our most advanced latent diffusion model yet. Experience unparalleled temporal consistency and hyper-realistic detail in every frame."
                icon={Sparkles}
                className="md:col-span-2 md:row-span-2"
                iconClassName="h-16 w-16"
                badge="Latest"
            />

            {/* AI Video Generation (Wide) */}
            <BentoItem
                title="Cinematic Generation"
                description="Transform text into breathtaking 4K videos. AI that understands cinematography, lighting, and physics."
                icon={Video}
                className="md:col-span-2 md:row-span-1"
            />

            {/* Real-time Rendering (Small) */}
            <BentoItem
                title="Instant Logic"
                description="Proprietary cloud rendering for lightning-fast results."
                icon={Zap}
                className="md:col-span-1 md:row-span-1"
            />

            {/* Storyboarding (Tall) */}
            <BentoItem
                title="AI Storyboards"
                description="From script to screen in seconds. Automated shot composition, blocking, and narrative flow planning."
                icon={Wand2}
                className="md:col-span-1 md:row-span-2"
            />

            {/* VFX & Styles (Wide) */}
            <BentoItem
                title="Style Transfer & VFX"
                description="Apply any artistic style or cinematic aesthetic instantly. Studio-grade visual effects powered by neural networks."
                icon={Wand}
                className="md:col-span-2 md:row-span-1"
            />

            {/* Global Scale (Small) */}
            <BentoItem
                title="Enterprise Scale"
                description="Reliability at global scale. 99.9% uptime and low-latency nodes worldwide."
                icon={Globe}
                className="md:col-span-1 md:row-span-1"
            />
        </div>
    );
};

export default BentoGrid;
