import { Shield, Lock, FileCheck, Database, CheckCircle2, Server } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const ComplianceSection = () => {
    return (
        <section className="py-32 bg-[#0A0A0A] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <GSAPTransition animation="fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-400 mb-4">
                            <Shield className="w-4 h-4 text-green-400" />
                            Enterprise-Grade Security
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Security you can <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">trust</span>
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            We adhere to the strictest industry standards to ensure your creative assets and proprietary information remain protected at every step.
                        </p>
                    </GSAPTransition>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Certifications Grid */}
                    <GSAPTransition animation="scale-in" className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-4">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-white font-bold mb-1">GDPR</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Ready</p>
                        </div>

                        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform mb-4">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-white font-bold mb-1">SOC 2</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Type II Certified</p>
                        </div>

                        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-4">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-white font-bold mb-1">HIPAA</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Compliant</p>
                        </div>

                        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-4">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-white font-bold mb-1">ISO 27001</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Certified</p>
                        </div>
                    </GSAPTransition>

                    {/* Right: Detailed Features */}
                    <GSAPTransition animation="fade-in-up" delay={0.2} className="space-y-6">
                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Database className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg mb-1">Data Residency Control</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Keep your data where you need it. Choose between US or EU data centers to meet your local compliance requirements.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg mb-1">End-to-End Encryption</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Your assets are encrypted in transit (TLS 1.3) and at rest (AES-256), ensuring they remain accessible only to you.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Server className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-lg mb-1">99.9% Uptime SLA</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Reliability you can count on. Our redundant infrastructure ensures your production pipeline never stops.
                                </p>
                            </div>
                        </div>
                    </GSAPTransition>
                </div>
            </div>
        </section>
    );
};

export default ComplianceSection;
