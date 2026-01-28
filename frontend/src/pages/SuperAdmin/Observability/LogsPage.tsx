import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const LogsPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [tenantId] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page, statusFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getGenerationLogs({
                page,
                limit: 50,
                status: statusFilter || undefined,
                tenantId: tenantId || undefined
            });
            setLogs(response.data.data.logs);
            setTotal(response.data.data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-[#00FF88]';
            case 'FAILED': return 'text-red-400';
            case 'BLOCKED': return 'text-yellow-400';
            default: return 'text-[#8E8E93]';
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <GSAPTransition animation="fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Generation Logs</h1>
                        <p className="text-[#8E8E93] text-lg font-medium">Immutable record of all AI generations</p>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#141414] border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#00FF88]"
                        >
                            <option value="">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                            <option value="BLOCKED">Blocked</option>
                        </select>
                    </div>
                </div>
            </GSAPTransition>

            <GSAPTransition animation="fade-in-up" delay={0.2}>
                <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Tenant</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Feature</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-[#8E8E93]">Loading logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-[#8E8E93]">No logs found</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-white whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white font-bold text-sm">{log.tenantId?.name || 'Unknown'}</div>
                                                <div className="text-[#8E8E93] text-[10px] font-mono">{log.tenantId?._id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-white/5 rounded text-xs font-bold text-[#8E8E93] border border-white/5">
                                                    {log.feature}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-black uppercase tracking-wider ${getStatusColor(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-[#8E8E93]">
                                                {log.latencyMs}ms • {log.provider?.toLowerCase() === 'runway' ? 'Nebula' : log.provider}
                                                {log.creditsConsumed > 0 && <span className="ml-2 text-[#00FF88]">{log.creditsConsumed} CP</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[#8E8E93] text-xs font-bold uppercase tracking-widest">
                            Page {page} of {Math.ceil(total / 50)}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 rounded bg-white/5 disabled:opacity-50 hover:bg-white/10 text-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={page >= Math.ceil(total / 50)}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 rounded bg-white/5 disabled:opacity-50 hover:bg-white/10 text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </GSAPTransition>
        </div>
    );
};

export default LogsPage;
