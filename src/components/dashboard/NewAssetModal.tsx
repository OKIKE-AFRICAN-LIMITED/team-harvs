import React, { useState, useRef } from 'react';
import { X, UploadCloud, Tag, FileText, Link2, Check, Loader2 } from 'lucide-react';
import { workspaceStore, CreativeAsset } from '@/lib/workspaceStore';
import { uploadLocalFile } from '@/lib/fileUpload';

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

  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadLocalFile(file, 'assets');
      setUploadedFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        downloadUrl: res.url,
        fileSize: res.size,
        fileType: res.type.toUpperCase() || 'FILE',
      }));
    } catch (err: any) {
      console.error('Asset upload failed:', err);
      window.alert(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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

        {/* Upload Mode Selector */}
        <div className="flex items-center justify-center p-1 rounded-xl bg-black/40 border border-[#EFCEA5]/15 mb-5 text-xs">
          <button
            type="button"
            onClick={() => setUploadMode('device')}
            className={`flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider text-[0.68rem] flex items-center justify-center gap-1.5 transition-colors ${
              uploadMode === 'device' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Device File Upload
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider text-[0.68rem] flex items-center justify-center gap-1.5 transition-colors ${
              uploadMode === 'url' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> External URL / Cloud Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {uploadMode === 'device' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleDeviceUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-xl border-2 border-dashed border-[#EFCEA5]/25 hover:border-[#EFCEA5]/60 bg-black/20 hover:bg-black/40 transition-all text-center cursor-pointer group"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-3">
                    <Loader2 className="w-6 h-6 text-[#EFCEA5] animate-spin" />
                    <span className="text-xs text-[#EFCEA5]">Processing resource upload...</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                    <Check className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-serif text-[#F8F4EF] font-medium">{uploadedFileName}</span>
                    <span className="text-[0.65rem] text-[#EFCEA5]/70">
                      {formData.fileType} &bull; {formData.fileSize} (Click to replace file)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="w-8 h-8 text-[#EFCEA5]/50 group-hover:text-[#EFCEA5] transition-colors" />
                    <div>
                      <span className="text-xs font-serif text-[#F8F4EF] block font-medium">
                        Click to select asset file from your device
                      </span>
                      <span className="text-[0.68rem] text-[#EFCEA5]/60 block mt-0.5">
                        PDF, ZIP, .CUBE LUTs, PSD, AI, or DOCX documents
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" /> Resource Download / Cloud Link
              </label>
              <input
                type="text"
                required
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                placeholder="https://drive.google.com/... or https://dropbox.com/..."
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          )}

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
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags
              </label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                placeholder="e.g. Call Sheet, Autumn"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
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
