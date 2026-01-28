import { Button } from '@/components/ui/button';
import {
    Layers,
    Palette,
    MousePointer2,
    Sparkles,
    Activity,
    Type,
    Navigation,
    CheckCircle2,
    Calendar,
    Search,
    Bell,
    Settings,
    ChevronRight,
    ArrowRight,
    ShieldCheck,
    Zap
} from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const DesignSystemPage = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8 md:p-16 bg-grid pb-32">
            <div className="max-w-6xl mx-auto space-y-32">

                {/* Header Section */}
                <section className="space-y-6 text-center pt-12">
                    <GSAPTransition animation="fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00FF88] text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="w-4 h-4" />
                            Nebula Design System v2.0
                        </div>
                    </GSAPTransition>
                    <GSAPTransition animation="fade-in-up" delay={0.1}>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-4">
                            Visual <br />
                            <span className="text-gradient-nebula">Excellence.</span>
                        </h1>
                    </GSAPTransition>
                    <GSAPTransition animation="fade-in-up" delay={0.2}>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
                            Extended collection of premium components, typography scales, and interactive patterns designed for Nebula.
                        </p>
                    </GSAPTransition>
                </section>

                {/* Navigation & Tabs */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                            <Navigation className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Navigation Architecture</h2>
                            <p className="text-gray-500">Sophisticated wayfinding and state management</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="premium-card p-2 rounded-[2rem]">
                            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-3xl border border-white/5">
                                <button className="flex-1 py-3 px-6 rounded-2xl bg-white/10 text-white font-bold text-sm">Active Tab</button>
                                <button className="flex-1 py-3 px-6 rounded-2xl text-gray-400 hover:text-white font-bold text-sm transition-colors">Inactive</button>
                                <button className="flex-1 py-3 px-6 rounded-2xl text-gray-400 hover:text-white font-bold text-sm transition-colors">Settings</button>
                            </div>
                        </div>
                        <div className="premium-card p-6 flex items-center justify-between rounded-[2rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Search className="w-4 h-4" />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Settings className="w-4 h-4" />
                                </div>
                            </div>
                            <Button variant="premium" className="rounded-full px-8">Quick Action</Button>
                        </div>
                    </div>
                </section>

                {/* Advanced Typography */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400">
                            <Type className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Typography Scale</h2>
                            <p className="text-gray-500">Dynamic sizing and weight hierarchy</p>
                        </div>
                    </div>

                    <div className="premium-card p-12 rounded-[2.5rem] divide-y divide-white/5">
                        <div className="py-8 first:pt-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 block">Display Heading 01</span>
                            <h3 className="text-6xl md:text-8xl font-black tracking-tight leading-none italic">Nebula Bold Italic</h3>
                        </div>
                        <div className="py-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 block">Core Heading 02</span>
                            <h3 className="text-4xl md:text-5xl font-black text-white">The creator cloud for visionaires.</h3>
                        </div>
                        <div className="py-8 last:pb-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 block">Paragraph System</span>
                            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
                                Experience the next generation of creative tools. Our design system prioritizes legibility, high contrast, and premium aesthetics for professional workflows.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Buttons & Interactions */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[#00FF88]/10 text-[#00FF88]">
                            <MousePointer2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Interaction Models</h2>
                            <p className="text-gray-500">Tactile responses and interactive states</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Button variant="premium" size="lg" className="h-16 rounded-2xl text-base font-black shadow-lg">PREMIUM DEFAULT</Button>
                        <Button variant="nebula" size="lg" className="h-16 rounded-2xl text-base font-black">OUTLINE GLOW</Button>
                        <Button variant="glass" size="lg" className="h-16 rounded-2xl text-base font-black border-white/10">BLUR SURFACE</Button>
                        <Button variant="purple" size="lg" className="h-16 rounded-2xl text-base font-black">ROYAL GRADIENT</Button>
                    </div>
                </section>

                {/* Feature Cards & Glassmorphism */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Depth & Layering</h2>
                            <p className="text-gray-500">Surface hierarchy and lighting effects</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="premium-card p-8 rounded-[2rem] border-white/5 bg-[#141414] group hover-glow transition-all duration-500 cursor-pointer">
                            <div className="w-12 h-12 mb-6 rounded-2xl bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88]">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Instant Compute</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">Real-time processing with zero latency for high-stake creative demands.</p>
                            <div className="flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest">
                                LEARN MORE <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="glass-morphism p-8 rounded-[2rem] group cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Encrypted Cloud</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">Military-grade protection for your most valuable creative assets and IP.</p>
                            <div className="flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest">
                                SECURITY DOCS <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="premium-card p-8 rounded-[2rem] border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent group cursor-pointer">
                            <div className="w-12 h-12 mb-6 rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
                                <Palette className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Color Mastery</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">Professional grade color science tools for cinematic consistency across projects.</p>
                            <div className="flex items-center gap-2 text-xs font-black text-[#8B5CF6] uppercase tracking-widest">
                                OPEN PALETTE <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Small Components Showcase */}
                <section className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold">Forms & Inputs</h3>
                            <div className="space-y-4">
                                <input className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88] transition-all" placeholder="Enter project name..." />
                                <div className="flex gap-4">
                                    <div className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-6 flex items-center justify-between text-gray-400">
                                        <span className="text-sm">Select Quality</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-xl font-bold">Indicators & Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                                    <div className="text-sm font-bold">Service Online</div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                    <Activity className="w-5 h-5 text-orange-400" />
                                    <div className="text-sm font-bold">Processing...</div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    <div className="text-sm font-bold">Secured Sync</div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    <div className="text-sm font-bold">Scheduled</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer CTA Override */}
                <section className="bg-gradient-to-t from-[#00FF88]/20 to-transparent p-1 bg-white/5 rounded-[4rem] border border-white/10 overflow-hidden group">
                    <div className="bg-[#0A0A0A] rounded-[3.8rem] p-12 md:p-32 text-center space-y-12">
                        <GSAPTransition animation="scale-in">
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic">Ready to <br /> <span className="text-gradient-nebula">Transcend?</span></h2>
                        </GSAPTransition>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="premium" size="lg" className="h-16 px-12 rounded-full text-base font-black">CREATE ACCOUNT</Button>
                            <Button variant="glass" size="lg" className="h-16 px-12 rounded-full text-base font-black">TALK TO SALES</Button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DesignSystemPage;
