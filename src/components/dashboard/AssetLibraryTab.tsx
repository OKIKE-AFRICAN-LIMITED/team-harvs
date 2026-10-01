import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Download, 
  Copy, 
  Trash2, 
  Check, 
  ExternalLink,
  Plus,
  Tag
} from 'lucide-react';
import { CreativeAsset, workspaceStore } from '@/lib/workspaceStore';

interface AssetLibraryTabProps {
  assets: CreativeAsset[];
  onOpenNewAsset: () => void;
}

export const AssetLibraryTab: React.FC<AssetLibraryTabProps> = ({
  assets,
  onOpenNewAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Brand Assets', 'Call Sheets', 'Moodboards', 'Presets', 'Guidelines'];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.fileType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || asset.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleCopyLink = (asset: CreativeAsset) => {
    navigator.clipboard.writeText(asset.downloadUrl || window.location.href);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      workspaceStore.deleteAsset(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
        <div>
          <span className="text-[0.68rem] tracking-[0.24em] text-[#EFCEA5] uppercase font-semibold">
            Resources &amp; Tooling
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F8F4EF] mt-1">
            Creative Asset &amp; File Library
          </h1>
          <p className="text-xs text-[#EFCEA5]/70 mt-1">
            Official call sheets, high-res brand marks, DaVinci LUT packages, and production guidelines.
          </p>
        </div>

        <button
          onClick={onOpenNewAsset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Resource
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C0306]/70 border border-[#EFCEA5]/15 rounded-xl p-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by title, tag, or format..."
            className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-full text-[0.68rem] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-[#EFCEA5] text-[#1F0205]'
                  : 'bg-white/5 hover:bg-white/10 text-[#EFCEA5]/80 border border-[#EFCEA5]/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-16 bg-[#1C0306]/50 rounded-2xl border border-[#EFCEA5]/10">
          <p className="text-sm font-serif text-[#EFCEA5]/70">No assets found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#1C0306] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/35 rounded-xl p-5 transition-all shadow-md flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 uppercase tracking-wider font-semibold">
                    {asset.category}
                  </span>
                  <span className="text-[0.7rem] font-mono text-[#EFCEA5]/60">
                    {asset.fileSize}
                  </span>
                </div>

                <h3 className="text-base font-serif text-[#F8F4EF] font-medium leading-snug">
                  {asset.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-[#EFCEA5]/70 mt-2">
                  <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[0.68rem] text-[#F8F4EF]">
                    {asset.fileType}
                  </span>
                  <span>&bull;</span>
                  <span className="text-[0.7rem]">{asset.date}</span>
                </div>

                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#EFCEA5]/10">
                    {asset.tags.map((t, idx) => (
                      <span key={idx} className="text-[0.65rem] text-[#EFCEA5]/60 flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EFCEA5]/15">
                <button
                  onClick={() => handleCopyLink(asset)}
                  className="flex items-center gap-1 text-[0.72rem] text-[#EFCEA5]/80 hover:text-[#EFCEA5] transition-colors"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={asset.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#EFCEA5]/15 hover:bg-[#EFCEA5] text-[#EFCEA5] hover:text-[#1F0205] transition-all"
                    title="Download or View"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.id, asset.title)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-950/80 text-rose-400 transition-colors"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
