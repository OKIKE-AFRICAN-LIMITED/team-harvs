import React, { useState } from 'react';
import { X, UploadCloud, Tag } from 'lucide-react';
import { workspaceStore, CreativeAsset } from '@/lib/workspaceStore';

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAssetModal: React.FC<NewAssetModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Brand Assets' as CreativeAsset['category'],
    fileType: 'PDF Document',
    fileSize: '3.5 MB',
    downloadUrl: '#',
    tagsInput: 'Brand, Guidelines, Production',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    workspaceStore.addAsset({
      title: formData.title,
      category: formData.category,
      fileType: formData.fileType,
      fileSize: formData.fileSize,
      downloadUrl: formData.downloadUrl || '#',
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8F4EF]">
        
        <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15 mb-6">
          <div>
            <span className="text-[0.68rem] tracking-[0.22em] text-[#EFCEA5] uppercase font-semibold">
              Asset Library
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">Register Studio Resource</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#EFCEA5]/70 hover:text-[#EFCEA5] rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Resource Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lookbook 02 Call Sheet & Wardrobe Map"
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="Call Sheets">Call Sheets</option>
                <option value="Moodboards">Moodboards & Decks</option>
                <option value="Brand Assets">Brand Assets & Logos</option>
                <option value="Presets">Presets & LUTs</option>
                <option value="Guidelines">Guidelines</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                File Type / Format
              </label>
              <input
                type="text"
                required
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                placeholder="PDF / ZIP / .CUBE / Figma"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Estimated File Size
              </label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                placeholder="e.g. 4.2 MB or Cloud Link"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Resource Link / URL
              </label>
              <input
                type="text"
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                placeholder="Cloud Storage / Drive Link"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              placeholder="e.g. Call Sheet, Autumn, Schedule, Models"
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFCEA5]/15 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider border border-[#EFCEA5]/30 text-[#EFCEA5]/80 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-lg hover:scale-105"
            >
              <UploadCloud className="w-4 h-4" /> Save Resource
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
