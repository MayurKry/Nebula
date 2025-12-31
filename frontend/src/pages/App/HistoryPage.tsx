import { useState, useEffect } from 'react';
import GSAPTransition from '@/components/ui/GSAPTransition';
import { Video, Image, Search, Calendar, Download, X, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import type { HistoryItem } from '@/services/ai.service';
import { useAuth } from '@/context/AuthContext';
import { TokenStorage } from '@/api/tokenStorage';

const HistoryPage = () => {
    const { isAuthenticated } = useAuth();
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [selectedResultIndex, setSelectedResultIndex] = useState(0);

    useEffect(() => {
        fetchHistory();
    }, [filterType]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);

        // Check if user is authenticated before making the request
        const accessToken = TokenStorage.getAccessToken();
        if (!accessToken || !isAuthenticated) {
            setError('Please log in to view your history');
            setLoading(false);
            return;
        }

        try {
            const response = await aiService.getHistory({
                type: filterType === 'all' ? undefined : filterType,
                limit: 50
            });
            setHistory(response.history);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch history:', err);

            // Handle specific error cases
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view this content.');
            } else if (err.message?.includes('Network')) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError(err.response?.data?.message || 'Failed to load history. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleDownload = async (url: string, prompt: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${prompt.slice(0, 30)}.${url.includes('.mp4') ? 'mp4' : 'png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const openModal = (item: HistoryItem, resultIndex: number = 0) => {
        setSelectedItem(item);
        setSelectedResultIndex(resultIndex);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setSelectedResultIndex(0);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <GSAPTransition animation="fade-in-up">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">History</h1>
                        <p className="text-sm text-gray-400">View and manage your generated assets.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="relative group flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#141414] border border-white/10 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-white/20 transition-all w-full sm:w-64"
                            />
                        </div>

                        <div className="flex bg-[#141414] border border-white/10 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('image')}
                                className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${filterType === 'image' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Image className="w-4 h-4" /> Images
                            </button>
                            <button
                                onClick={() => setFilterType('video')}
                                className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${filterType === 'video' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Video className="w-4 h-4" /> Videos
                            </button>
                        </div>
                    </div>
                </div>
            </GSAPTransition>


            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-red-500/20 rounded-xl bg-red-500/5">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <p className="text-red-400 text-lg font-medium mb-2">{error}</p>
                    <button
                        onClick={fetchHistory}
                        className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredHistory.map((item, index) => {
                            const firstResult = item.results[0];
                            const displayUrl = firstResult?.thumbnailUrl || firstResult?.url || '';
                            const isVideo = item.type === 'video' || item.type === 'video-project';

                            return (
                                <GSAPTransition key={item.id} animation="scale-in" delay={index * 0.05}>
                                    <div
                                        className="group bg-[#141414] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                                        onClick={() => openModal(item, 0)}
                                    >
                                        <div className="relative aspect-video bg-black/50">
                                            {displayUrl ? (
                                                <>
                                                    <img
                                                        src={displayUrl}
                                                        alt={item.prompt}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    {isVideo && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                <Video className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    {item.status === 'processing' ? (
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    ) : (
                                                        <span>No preview</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (displayUrl) handleDownload(displayUrl, item.prompt);
                                                    }}
                                                    className="p-2 bg-black/60 rounded-lg text-white hover:bg-white hover:text-black transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {item.results.length > 1 && (
                                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white">
                                                    +{item.results.length - 1} more
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isVideo ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                    {item.type.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300 line-clamp-2" title={item.prompt}>
                                                {item.prompt}
                                            </p>
                                            {item.settings.style && (
                                                <p className="text-xs text-gray-500 mt-1">Style: {item.settings.style}</p>
                                            )}
                                        </div>
                                    </div>
                                </GSAPTransition>
                            );
                        })}
                    </div>

                    {filteredHistory.length === 0 && (
                        <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
                            <p className="text-gray-500">No results found matching your filters.</p>
                        </div>
                    )}
                </>
            )}

            {/* Modal for viewing full asset */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedItem.prompt}</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Generated on {new Date(selectedItem.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Display current result */}
                            {selectedItem.results[selectedResultIndex] && (
                                <div className="mb-6">
                                    {selectedItem.type === 'video' || selectedItem.type === 'video-project' ? (
                                        selectedItem.results[selectedResultIndex].url ? (
                                            <video
                                                src={selectedItem.results[selectedResultIndex].url}
                                                controls
                                                className="w-full rounded-lg"
                                            />
                                        ) : (
                                            <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                <span className="ml-2 text-gray-400">Processing...</span>
                                            </div>
                                        )
                                    ) : (
                                        <img
                                            src={selectedItem.results[selectedResultIndex].url}
                                            alt={selectedItem.prompt}
                                            className="w-full rounded-lg"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Thumbnail grid if multiple results */}
                            {selectedItem.results.length > 1 && (
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    {selectedItem.results.map((result, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedResultIndex(idx)}
                                            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedResultIndex === idx ? 'border-white' : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            <img
                                                src={result.thumbnailUrl || result.url}
                                                alt={`Result ${idx + 1}`}
                                                className="w-full aspect-video object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Settings and metadata */}
                            <div className="grid grid-cols-2 gap-4 bg-black/30 rounded-lg p-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Settings</h3>
                                    <div className="space-y-1 text-sm text-gray-300">
                                        {selectedItem.settings.style && <p>Style: {selectedItem.settings.style}</p>}
                                        {selectedItem.settings.width && selectedItem.settings.height && (
                                            <p>Size: {selectedItem.settings.width}x{selectedItem.settings.height}</p>
                                        )}
                                        {selectedItem.settings.aspectRatio && <p>Aspect Ratio: {selectedItem.settings.aspectRatio}</p>}
                                        {selectedItem.settings.duration && <p>Duration: {selectedItem.settings.duration}s</p>}
                                        {selectedItem.provider && <p>Provider: {selectedItem.provider}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Actions</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const result = selectedItem.results[selectedResultIndex];
                                                if (result?.url) handleDownload(result.url, selectedItem.prompt);
                                            }}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </button>
                                        {selectedItem.results[selectedResultIndex]?.url && (
                                            <a
                                                href={selectedItem.results[selectedResultIndex].url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Open
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
