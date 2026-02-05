import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { Square } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';

const CampaignsPage = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        setCurrentPage(1);
        fetchCampaigns(1);
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchCampaigns(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchCampaigns = async (page = 1) => {
        setLoading(true);
        try {
            const response = await adminApi.listCampaigns({
                page,
                limit: ITEMS_PER_PAGE
            });
            setCampaigns(response.data.data.campaigns);
            // Handle pagination logic
            const total = response?.data?.data?.total || 0;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async (id: string) => {
        if (!confirm('Are you sure you want to FORCE STOP this campaign? This cannot be undone.')) return;

        try {
            await adminApi.stopCampaign(id, 'Stopped by Super Admin');
            toast.success('Campaign stopped');
            fetchCampaigns(currentPage);
        } catch (error) {
            toast.error('Failed to stop campaign');
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <GSAPTransition animation="fade-in-up">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Campaign Oversight</h1>
                    <p className="text-[#8E8E93] text-lg font-medium">Monitor and manage running campaigns</p>
                </div>
            </GSAPTransition>

            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Campaign</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Assets</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[#8E8E93]">Loading campaigns...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-[#8E8E93]">No campaigns found</td></tr>
                            ) : (
                                campaigns.map((camp) => (
                                    <tr key={camp._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-bold text-sm">{camp.name}</div>
                                            <div className="text-[#8E8E93] text-[10px] font-mono">{camp._id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#8E8E93]">
                                            {camp.objective}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-black uppercase tracking-widest border border-white/10
                                                ${camp.status === 'generating' ? 'bg-purple-500/20 text-purple-400' :
                                                    camp.status === 'completed' ? 'bg-[#00FF88]/10 text-[#00FF88]' :
                                                        'bg-white/5 text-[#8E8E93]'}`}>
                                                {camp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-white">
                                            {camp.assets?.length || 0} Assets
                                        </td>
                                        <td className="px-6 py-4">
                                            {camp.status === 'generating' && (
                                                <button
                                                    onClick={() => handleStop(camp._id)}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                                                    title="Force Stop"
                                                >
                                                    <Square className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && campaigns.length > 0 && (
                    <div className="mt-4 border-t border-white/5 pt-4 p-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <div className="text-center mt-4 text-xs text-[#8E8E93]">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} campaigns
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignsPage;
