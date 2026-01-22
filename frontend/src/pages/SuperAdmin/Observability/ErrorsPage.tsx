import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import GSAPTransition from '@/components/ui/GSAPTransition';

const ErrorsPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getErrorLogs({ limit: 50 });
            setLogs(response.data.data.logs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <GSAPTransition animation="fade-in-up">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Error Monitor</h1>
                    <p className="text-[#8E8E93] text-lg font-medium">Real-time system failure tracking</p>
                </div>
            </GSAPTransition>

            <GSAPTransition animation="fade-in-up" delay={0.2}>
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-[#8E8E93] text-center p-8">Loading errors...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 border border-white/10 rounded-2xl text-center bg-[#141414]">
                            <CheckCircle className="w-12 h-12 text-[#00FF88] mx-auto mb-4" />
                            <p className="text-white font-bold text-lg">No errors detected</p>
                            <p className="text-[#8E8E93]">System is running smoothly</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className="bg-[#141414] border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                                    {log.category}
                                                </span>
                                                <span className="text-[#8E8E93] text-xs font-bold">{new Date(log.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-white font-bold text-lg mt-2">{log.message}</p>
                                            {log.tenantId && (
                                                <div className="mt-2 flex items-center gap-2 text-sm text-[#8E8E93]">
                                                    <span className="text-white">Tenant:</span> {log.tenantId.name} ({log.tenantId._id})
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {log.retryCount > 0 && (
                                        <div className="text-right">
                                            <div className="text-orange-400 font-bold text-sm">{log.retryCount} Retries</div>
                                        </div>
                                    )}
                                </div>
                                {log.stackTrace && (
                                    <div className="mt-4 p-4 bg-black/50 rounded-lg border border-white/5 font-mono text-xs text-red-300 overflow-x-auto">
                                        {log.stackTrace.substring(0, 300)}...
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </GSAPTransition>
        </div>
    );
};



export default ErrorsPage;
