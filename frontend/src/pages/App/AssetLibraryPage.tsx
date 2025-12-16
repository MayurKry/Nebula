import { useState } from 'react';
import {
    Search, Grid, List, Folder, FolderPlus, Upload,
    Video, Image, Layers, Music, Filter, SortDesc, X, Play,
    Download, Trash2, MoreHorizontal, Clock, Info
} from 'lucide-react';

// Sample assets data
const sampleAssets = [
    { id: '1', name: 'Product Launch Intro', type: 'video', url: 'https://picsum.photos/seed/asset1/640/360', duration: 15, updatedAt: '2 hours ago' },
    { id: '2', name: 'Hero Background', type: 'image', url: 'https://picsum.photos/seed/asset2/640/360', width: 1920, height: 1080, updatedAt: '5 hours ago' },
    { id: '3', name: 'Campaign Storyboard', type: 'storyboard', url: 'https://picsum.photos/seed/asset3/640/360', scenes: 6, updatedAt: '1 day ago' },
    { id: '4', name: 'Explainer Video', type: 'video', url: 'https://picsum.photos/seed/asset4/640/360', duration: 45, updatedAt: '2 days ago' },
    { id: '5', name: 'Brand Logo Animation', type: 'video', url: 'https://picsum.photos/seed/asset5/640/360', duration: 5, updatedAt: '3 days ago' },
    { id: '6', name: 'Product Shot 1', type: 'image', url: 'https://picsum.photos/seed/asset6/640/360', width: 2048, height: 2048, updatedAt: '3 days ago' },
    { id: '7', name: 'Background Music', type: 'audio', url: '', duration: 180, updatedAt: '4 days ago' },
    { id: '8', name: 'Marketing Banner', type: 'image', url: 'https://picsum.photos/seed/asset8/640/360', width: 1200, height: 628, updatedAt: '5 days ago' },
    { id: '9', name: 'Social Media Teaser', type: 'video', url: 'https://picsum.photos/seed/asset9/640/360', duration: 30, updatedAt: '1 week ago' },
];

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
};

const typeColors = {
    video: 'text-purple-400 bg-purple-400/10',
    image: 'text-blue-400 bg-blue-400/10',
    storyboard: 'text-orange-400 bg-orange-400/10',
    audio: 'text-green-400 bg-green-400/10',
};

const AssetLibraryPage = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<typeof sampleAssets[0] | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    const filteredAssets = sampleAssets.filter((asset) => {
        if (filterType && asset.type !== filterType) return false;
        if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

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

    const handleDownload = (asset: typeof sampleAssets[0]) => {
        alert(`Downloading ${asset.name}...\n\nIn a real app, this would download the file.`);
    };

    const handleDelete = (asset: typeof sampleAssets[0]) => {
        if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
            alert(`${asset.name} deleted successfully!`);
            setSelectedAsset(null);
        }
    };

    const handleFolderClick = (folderId: string | null, folderName: string) => {
        setSelectedFolder(folderId);
        if (folderId) {
            alert(`Opening folder: ${folderName}`);
        }
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
                                onClick={() => handleFolderClick(null, 'All Assets')}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!selectedFolder ? 'text-white bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Folder className={`w-4 h-4 ${!selectedFolder ? 'text-[#00FF88]' : ''}`} />
                                All Assets
                                <span className="ml-auto text-xs text-gray-500">{sampleAssets.length}</span>
                            </button>
                        </li>
                        {folders.map((folder) => (
                            <li key={folder.id}>
                                <button
                                    onClick={() => handleFolderClick(folder.id, folder.name)}
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
            <main className="flex-1">
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

                        {/* Filter chips */}
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
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredAssets.map((asset) => {
                                const TypeIcon = getTypeIcon(asset.type);
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="group bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-[#00FF88]/30 transition-all cursor-pointer"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-[#1A1A1A]">
                                            {asset.type !== 'audio' ? (
                                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music className="w-12 h-12 text-gray-600" />
                                                </div>
                                            )}
                                            {asset.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-10 h-10 text-white" />
                                                </div>
                                            )}
                                            <div className={`absolute top-2 left-2 p-1.5 rounded ${typeColors[asset.type as keyof typeof typeColors]}`}>
                                                <TypeIcon className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm text-white truncate">{asset.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{asset.updatedAt}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredAssets.map((asset) => {
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="flex items-center gap-4 p-3 bg-[#141414] border border-white/10 rounded-lg hover:border-[#00FF88]/30 transition-all cursor-pointer"
                                    >
                                        <div className="w-16 h-12 rounded overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                                            {asset.type !== 'audio' ? (
                                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
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
                                                <span className="text-xs text-gray-500">{asset.updatedAt}</span>
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
                        <div className="aspect-video bg-black flex items-center justify-center relative">
                            {selectedAsset.type !== 'audio' ? (
                                <img src={selectedAsset.url} alt={selectedAsset.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <Music className="w-20 h-20 text-gray-600" />
                                    <p className="text-gray-400">Audio file preview</p>
                                </div>
                            )}
                            {selectedAsset.type === 'video' && (
                                <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                    <div className="w-16 h-16 rounded-full bg-[#00FF88] flex items-center justify-center hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 text-[#0A0A0A] ml-1" />
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Metadata & Actions */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        {selectedAsset.type === 'video' && `${selectedAsset.duration}s`}
                                        {selectedAsset.type === 'image' && `${selectedAsset.width}x${selectedAsset.height}`}
                                        {selectedAsset.type === 'storyboard' && `${selectedAsset.scenes} scenes`}
                                        {selectedAsset.type === 'audio' && `${Math.floor(selectedAsset.duration! / 60)}:${(selectedAsset.duration! % 60).toString().padStart(2, '0')}`}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {selectedAsset.updatedAt}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(selectedAsset)}
                                        className="px-4 py-2 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedAsset)}
                                        className="px-4 py-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
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
