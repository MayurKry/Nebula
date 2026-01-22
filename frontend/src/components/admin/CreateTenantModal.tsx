
import { useState } from 'react';
import { X, Building } from 'lucide-react';
import { adminApi, type Tenant } from '@/api/admin.api';
import { toast } from 'sonner';

interface CreateTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (tenant: Tenant) => void;
}

const CreateTenantModal = ({ isOpen, onClose, onSuccess }: CreateTenantModalProps) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('ORGANIZATION');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [credits, setCredits] = useState('100');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // NOTE: In a real flow we probably look up the user by email to get ID
            // or create a new user. For this MVP admin panel, we might assume user ID 
            // is provided or we search for them.
            // As per backend `createTenant` it expects `ownerUserId`.
            // FOR NOW, to be robust, we should probably search for the user by email first?
            // But the backend `utils` aren't exposed.
            // Let's assume the admin enters an existing User ID for now, 
            // OR we'll trust the User Journey requirement "Create tenant > attach plan..."
            // actually usually an admin creates a tenant AND invites a user.
            // Given the limitation, I will modify the backend lightly to accept email if needed, 
            // OR I will ask the admin to paste the User ID. 
            // Pasting User ID is safer for this scope.

            // Wait, searching by email is better UX. 
            // But looking at `adminApi.createTenant`, it takes `ownerUserId`.
            // I'll stick to `ownerUserId` for MVP correctness.

            await adminApi.createTenant({
                name,
                type,
                ownerEmail,
                firstName,
                lastName,
                initialCredits: parseInt(credits)
            });

            toast.success('Tenant created successfully');
            onSuccess({} as Tenant); // Trigger refresh
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create tenant');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tight">Create Tenant</h2>
                    <button onClick={onClose} className="text-[#8E8E93] hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Tenant Name</label>
                        <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                placeholder="Acme Inc."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                        >
                            <option value="ORGANIZATION">Organization</option>
                            <option value="INDIVIDUAL">Individual</option>
                        </select>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                        <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest">Owner Details</p>
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Email</label>
                            <input
                                type="email"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                placeholder="owner@example.com"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Initial Credits</label>
                        <input
                            type="number"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                            className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FF88]"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-[#1F1F1F] rounded-xl text-white font-bold">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-[#00FF88] text-black rounded-xl font-bold hover:bg-[#00CC6A]">
                            {isLoading ? 'Creating...' : 'Create Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTenantModal;
