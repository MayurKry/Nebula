import { Shield, Lock, Eye, Users, AlertTriangle } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const EthicalPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8 md:p-16">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <GSAPTransition animation="fade-in-up">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
                            <Shield className="w-4 h-4" />
                            Ethical AI Charter
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold">Responsible AI Development</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            We are committed to building AI tools that empower creativity while prioritizing safety, privacy, and ethical standards.
                        </p>
                    </div>
                </GSAPTransition>

                {/* Core Principles Grid */}
                <GSAPTransition animation="fade-in-up" delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Data Privacy & Security</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your creative inputs and generated content are yours. We employ enterprise-grade encryption and strictly limit data retention. We do not use your private projects to train our public models without explicit consent.
                        </p>
                    </div>

                    <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl hover:border-pink-500/30 transition-colors">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Content Safety</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Our models are equipped with robust safety filters to prevent the generation of NSFW, hateful, violent, or harmful content. We maintain a zero-tolerance policy for the misuse of our technology.
                        </p>
                    </div>

                    <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl hover:border-green-500/30 transition-colors">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 text-green-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Bias Mitigation</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            We actively work to reduce bias in our training data and outputs. We strive for diverse representation across gender, race, and culture in all AI-generated imagery and characters.
                        </p>
                    </div>

                    <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl hover:border-yellow-500/30 transition-colors">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4 text-yellow-400">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Transparency & Disclosure</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            We believe in clear disclosure of AI-generated content. All videos generated on our platform include metadata indicating their AI origin to combat misinformation and deepfakes.
                        </p>
                    </div>
                </GSAPTransition>

                {/* Compliance Badge Section */}
                <GSAPTransition animation="fade-in-up" delay={0.4} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                        "Technology should serve humanity, not mislead or harm it. Nebula is built on the foundation of trust, ensuring that your creativity is amplified safely and ethically."
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="px-4 py-2 bg-white/5 rounded-lg text-xs font-mono text-gray-400 border border-white/5">
                            ISO/IEC 42001 (Aligned)
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-lg text-xs font-mono text-gray-400 border border-white/5">
                            C2PA Watermarking
                        </div>
                    </div>
                </GSAPTransition>

            </div>
        </div>
    );
};

export default EthicalPolicyPage;
