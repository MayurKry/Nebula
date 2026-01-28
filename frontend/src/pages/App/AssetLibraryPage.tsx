import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Search, Grid, List, Folder, FolderPlus, Upload,
    Video, Image, Layers, Music, Filter, SortDesc, X, Play,
    Download, Trash2, MoreHorizontal, Clock, Info, Loader2, Box
} from 'lucide-react';
import { assetService } from '@/services/asset.service';

// (keep folders if needed for fallback or type ref, but mostly unused now)

const folders = [
    { id: 'f1', name: 'Marketing', count: 12 },
    { id: 'f2', name: 'Products', count: 8 },
    { id: 'f3', name: 'Social Media', count: 24 },
    { id: 'f4', name: 'Archive', count: 45 },
];

const typeIcons = {
    video: Video,
    image: Image,
    storyboard: Layers,
    audio: Music,
    document: Box
};

const typeColors = {
    video: 'text-purple-400 bg-purple-400/10',
    image: 'text-blue-400 bg-blue-400/10',
    storyboard: 'text-orange-400 bg-orange-400/10',
    audio: 'text-green-400 bg-green-400/10',
    document: 'text-gray-400 bg-gray-400/10'
};

const AssetLibraryPage = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAssets();
    }, [filterType, searchQuery, selectedFolder]);

    const fetchAssets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {};
            if (filterType) params.type = filterType;
            if (searchQuery) params.search = searchQuery;
            if (selectedFolder) params.folderId = selectedFolder;

            const result = await assetService.getAssets(params);

            if (result && (Array.isArray(result) || Array.isArray(result.assets))) {
                setAssets(Array.isArray(result) ? result : result.assets);
            } else {
                console.warn("Unexpected asset response format:", result);
                setAssets([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch assets:", error);
            setError(error.message || "Failed to load assets. Please try again.");
            setAssets([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        return typeIcons[type as keyof typeof typeIcons] || Image;
    };

    const handleCreateFolder = () => {
        const name = prompt('Enter folder name:');
        if (name) {
            alert(`Folder "${name}" created successfully!`);
        }
    };

    const handleUpload = () => {
        alert('File upload dialog would open here. Select files to upload to your library.');
    };

    const handleDownload = async (asset: any) => {
        try {
            toast.info(`Preparing ${asset.name} for download...`);
            const response = await fetch(asset.url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = asset.name || 'nebula-asset';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success(`Downloaded ${asset.name} successfully`);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to direct link if fetch fails
            window.open(asset.url, '_blank');
            toast.error('Direct download failed, opening in new tab');
        }
    };

    const handleDelete = async (asset: any) => {
        if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
            try {
                await assetService.deleteAsset(asset._id);
                fetchAssets(); // Refresh
            } catch (e) {
                console.error("Delete failed", e);
            }
            setSelectedAsset(null);
        }
    };

    const handleFolderClick = (folderId: string | null) => {
        setSelectedFolder(folderId);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex">
            {/* Sidebar - Folders */}
            <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] hidden lg:block">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-6 px-2">Library</h2>
                    <button
                        onClick={handleCreateFolder}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-[#00FF88]/10 text-[#00FF88] rounded-lg text-sm font-medium hover:bg-[#00FF88]/20 transition-colors"
                    >
                        <FolderPlus className="w-4 h-4" />
                        New Folder
                    </button>
                </div>
                <nav className="p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Folders</h3>
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={() => handleFolderClick(null)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!selectedFolder ? 'text-white bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Folder className={`w-4 h-4 ${!selectedFolder ? 'text-[#00FF88]' : ''}`} />
                                All Assets
                                <span className="ml-auto text-xs text-gray-500">{assets.length}</span>
                            </button>
                        </li>
                        {folders.map((folder) => (
                            <li key={folder.id}>
                                <button
                                    onClick={() => handleFolderClick(folder.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedFolder === folder.id ? 'text-white bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Folder className={`w-4 h-4 ${selectedFolder === folder.id ? 'text-[#00FF88]' : ''}`} />
                                    {folder.name}
                                    <span className="ml-auto text-xs text-gray-500">{folder.count}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto max-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-white">Asset Library</h1>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleUpload}
                                    className="flex items-center gap-2 px-3 py-2 bg-[#00FF88] text-[#0A0A0A] text-sm font-medium rounded-lg hover:bg-[#00FF88]/90 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </button>
                            </div>
                        </div>

                        {/* Search and filters */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00FF88]/50"
                                />
                            </div>

                            {/* Filter buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'border-[#00FF88] text-[#00FF88]' : 'border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white transition-colors">
                                    <SortDesc className="w-4 h-4" />
                                    Sort
                                </button>
                            </div>

                            {/* View toggle */}
                            <div className="flex items-center bg-[#1A1A1A] rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Filter chips - (Kept same as original) */}
                        {showFilters && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                <span className="text-sm text-gray-500">Type:</span>
                                {['video', 'image', 'storyboard', 'audio'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(filterType === type ? null : type)}
                                        className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${filterType === type
                                            ? 'bg-[#00FF88] text-[#0A0A0A]'
                                            : 'bg-white/5 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                                {filterType && (
                                    <button
                                        onClick={() => setFilterType(null)}
                                        className="ml-2 text-sm text-gray-500 hover:text-white"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Assets Grid/List */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Loader2 className="w-10 h-10 text-[#00FF88] animate-spin" />
                            <p className="text-gray-500">Loading Library...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Info className="w-6 h-6 text-red-500" />
                            </div>
                            <p className="text-red-400 font-medium">{error}</p>
                            <button onClick={() => fetchAssets()} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">Try Again</button>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-24 text-gray-500">
                            <Folder className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No assets found</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {assets.map((asset) => {
                                const TypeIcon = getTypeIcon(asset.type);
                                return (
                                    <div
                                        key={asset._id || asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="group bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-[#00FF88]/30 transition-all cursor-pointer"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-[#1A1A1A]">
                                            {asset.type === 'image' ? (
                                                <img src={asset.thumbnailUrl || asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                            ) : asset.type === 'video' ? (
                                                <div className="w-full h-full relative cursor-pointer">
                                                    <video
                                                        src={asset.url}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        onMouseOver={(e) => e.currentTarget.play().catch(() => { })}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.pause();
                                                            e.currentTarget.currentTime = 0;
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                                        <Play className="w-8 h-8 text-white drop-shadow-lg" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {asset.type === 'audio' ? <Music className="w-12 h-12 text-gray-600" /> : <Layers className="w-12 h-12 text-gray-600" />}
                                                </div>
                                            )}
                                            <div className={`absolute top-2 left-2 p-1.5 rounded ${typeColors[asset.type as keyof typeof typeColors]}`}>
                                                <TypeIcon className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm text-white truncate">{asset.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(asset.updatedAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {assets.map((asset) => {
                                return (
                                    <div
                                        key={asset._id || asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="flex items-center gap-4 p-3 bg-[#141414] border border-white/10 rounded-lg hover:border-[#00FF88]/30 transition-all cursor-pointer"
                                    >
                                        <div className="w-16 h-12 rounded overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                                            {asset.type !== 'audio' ? (
                                                <img src={asset.url || asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music className="w-6 h-6 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{asset.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${typeColors[asset.type as keyof typeof typeColors]}`}>
                                                    {asset.type}
                                                </span>
                                                <span className="text-xs text-gray-500">{new Date(asset.updatedAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Preview Modal */}
            {selectedAsset && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedAsset(null)}
                >
                    <div
                        className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white">{selectedAsset.name}</h3>
                            <button
                                onClick={() => setSelectedAsset(null)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                            {selectedAsset.type === 'image' || selectedAsset.type === 'storyboard' ? (
                                <img src={selectedAsset.url} alt={selectedAsset.name} className="max-w-full max-h-full object-contain" />
                            ) : selectedAsset.type === 'video' ? (
                                <video
                                    src={selectedAsset.url}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                            ) : selectedAsset.type === 'audio' ? (
                                <div className="flex flex-col items-center gap-6 w-full px-12">
                                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                                        <Music className="w-10 h-10 text-[#00FF88]" />
                                    </div>
                                    <audio src={selectedAsset.url} controls className="w-full" />
                                    <p className="text-gray-400 text-sm">Audio Track Preview</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <Box className="w-20 h-20 text-gray-600" />
                                    <p className="text-gray-400">Preview not available for this type</p>
                                </div>
                            )}
                        </div>

                        {/* Metadata & Actions */}
                        <div className="p-6 border-t border-white/10 bg-black/40">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <Info className="w-4 h-4 text-[#00FF88]" />
                                            {selectedAsset.type === 'video' && `${selectedAsset.duration || 0}s`}
                                            {selectedAsset.type === 'image' && selectedAsset.dimensions && `${selectedAsset.dimensions.width}x${selectedAsset.dimensions.height}`}
                                            {!['video', 'image'].includes(selectedAsset.type) && selectedAsset.type.toUpperCase()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {new Date(selectedAsset.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono truncate max-w-md">{selectedAsset.url}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {selectedAsset.type === 'video' && (
                                        <button
                                            onClick={() => navigate('/app/create/frame-to-video', { state: { sourceImage: selectedAsset.thumbnailUrl || selectedAsset.url } })}
                                            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-bold flex items-center gap-2"
                                        >
                                            <Play className="w-3.5 h-3.5" /> Continue
                                        </button>
                                    )}
                                    {['video', 'image'].includes(selectedAsset.type) && (
                                        <button
                                            onClick={() => navigate('/app/studio/editor')}
                                            className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-all text-xs font-bold flex items-center gap-2"
                                        >
                                            <Layers className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedAsset.url);
                                            toast.success('Link copied to clipboard!');
                                        }}
                                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                                        title="Copy Link"
                                    >
                                        <Layers className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(selectedAsset)}
                                        className="px-6 py-2.5 flex items-center gap-2 bg-[#00FF88] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#00FF88]/90 transition-all text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedAsset)}
                                        className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all"
                                        title="Delete Asset"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetLibraryPage;
