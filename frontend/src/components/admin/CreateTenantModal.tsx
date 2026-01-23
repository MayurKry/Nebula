import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Building, Mail, User, ShieldCheck,
    ChevronRight, ChevronLeft, Sparkles,
    CreditCard, CheckCircle2
} from 'lucide-react';
import { adminApi, type Tenant } from '@/api/admin.api';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CreateTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (tenant: Tenant) => void;
}

const CreateTenantModal = ({ isOpen, onClose, onSuccess }: CreateTenantModalProps) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [type, setType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('ORGANIZATION');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [credits, setCredits] = useState('100');
    const [isLoading, setIsLoading] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Initial entrance animation
    useGSAP(() => {
        if (isOpen) {
            gsap.fromTo(modalRef.current,
                { y: 40, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power4.out' }
            );
        }
    }, [isOpen]);

    // Handle scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const nextStep = () => {
        gsap.to('.step-content', {
            x: -20,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                setStep(2);
                gsap.fromTo('.step-content',
                    { x: 20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.3 }
                );
            }
        });
    };

    const prevStep = () => {
        gsap.to('.step-content', {
            x: 20,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                setStep(1);
                gsap.fromTo('.step-content',
                    { x: -20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.3 }
                );
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await adminApi.createTenant({
                name,
                type,
                ownerEmail,
                firstName,
                lastName,
                initialCredits: parseInt(credits)
            });

            toast.success('Tenant authorized and initialized');

            // Success animation
            gsap.to(modalRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    onSuccess({} as Tenant);
                    onClose();
                    // Reset
                    setStep(1);
                    setName('');
                    setOwnerEmail('');
                    setFirstName('');
                    setLastName('');
                }
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Authorization failed');
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div
                ref={modalRef}
                className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-w-xl w-full overflow-hidden"
            >
                {/* Visual Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-50" />
                <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-[#00FF88]/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="p-8 sm:p-12 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center">
                                <Building className="w-6 h-6 text-[#00FF88]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-widest uppercase">New Tenant</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">Entity Authorization Module</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-3 mb-12">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-1 flex items-center gap-2">
                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= i ? 'bg-[#00FF88]' : 'bg-white/5'}`} />
                                {i === 1 && <ChevronRight className={`w-3 h-3 ${step > 1 ? 'text-[#00FF88]' : 'text-gray-700'}`} />}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
                        <div className="step-content min-h-[340px]">
                            {step === 1 ? (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-[#00FF88]" />
                                            Entity Identity
                                        </label>
                                        <div className="relative group">
                                            <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00FF88] transition-colors" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-14 pr-6 py-5 bg-[#141414] border border-white/5 rounded-3xl text-white placeholder-gray-700 focus:outline-none focus:border-[#00FF88]/30 focus:ring-1 focus:ring-[#00FF88]/30 transition-all text-sm font-medium"
                                                placeholder="Legal Company Name / Brand"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Scope</label>
                                            <div className="grid grid-cols-2 gap-2 p-1 bg-[#141414] border border-white/5 rounded-2xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setType('ORGANIZATION')}
                                                    className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'ORGANIZATION' ? 'bg-white/5 text-[#00FF88]' : 'text-gray-600 hover:text-white'}`}
                                                >
                                                    ORG
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setType('INDIVIDUAL')}
                                                    className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'INDIVIDUAL' ? 'bg-white/5 text-[#00FF88]' : 'text-gray-600 hover:text-white'}`}
                                                >
                                                    IND
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Fuel (CP)</label>
                                            <div className="relative group">
                                                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00FF88] transition-colors" />
                                                <input
                                                    type="number"
                                                    value={credits}
                                                    onChange={(e) => setCredits(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-[#00FF88]/30 transition-all text-sm font-black tabular-nums"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-3xl space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                <ShieldCheck className="w-5 h-5 text-[#00FF88]" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-white">System Verification</p>
                                                <p className="text-[10px] text-[#00FF88]/60 font-medium leading-relaxed">This tenant will be provisioned with full administrative rights over its private namespace and initial credits.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-[#00FF88]" />
                                            Root Owner Credentials
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00FF88] transition-colors" />
                                            <input
                                                type="email"
                                                value={ownerEmail}
                                                onChange={(e) => setOwnerEmail(e.target.value)}
                                                className="w-full pl-14 pr-6 py-5 bg-[#141414] border border-white/5 rounded-3xl text-white placeholder-gray-700 focus:outline-none focus:border-[#00FF88]/30 transition-all text-sm font-medium"
                                                placeholder="primary-contact@entity.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal First Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00FF88] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-[#00FF88]/30 transition-all text-sm font-medium"
                                                    placeholder="John"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Last Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00FF88] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-[#00FF88]/30 transition-all text-sm font-medium"
                                                    placeholder="Doe"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                        <div className="w-10 h-10 rounded-full bg-[#00FF88]/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-[#00FF88]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-white uppercase tracking-wider">Automated Invitation</p>
                                            <p className="text-[10px] text-gray-500 font-medium">System will trigger an access invitation once provisioned.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            {step === 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-8 py-5 bg-[#141414] hover:bg-[#1A1A1A] border border-white/5 rounded-[1.5rem] text-gray-400 font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!name}
                                        className="flex-[2] px-8 py-5 bg-white text-black hover:bg-white/90 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all inline-flex items-center justify-center gap-3 disabled:opacity-30"
                                    >
                                        Next Configuration
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 px-4 py-5 bg-[#141414] border border-white/5 rounded-[1.5rem] text-gray-400 transition-all flex items-center justify-center"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !ownerEmail || !firstName}
                                        className="flex-[3] relative group overflow-hidden px-8 py-5 bg-[#00FF88] text-[#050505] font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] disabled:opacity-30 disabled:grayscale transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,255,136,0.3)] hover:scale-[1.02]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                                        <div className="relative flex items-center justify-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-[#050505]/40 border-t-[#050505] rounded-full animate-spin" />
                                                    <span>Provisioning...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Finalize & Authorize</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CreateTenantModal;
