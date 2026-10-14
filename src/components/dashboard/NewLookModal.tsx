import React, { useState, useRef } from 'react';
import { X, Sparkles, Image as ImageIcon, UploadCloud, Check, Loader2, Link2 } from 'lucide-react';
import { workspaceStore, LookbookWork, DISCIPLINES } from '@/lib/workspaceStore';
import { uploadLocalFile } from '@/lib/fileUpload';

interface NewLookModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWork?: LookbookWork | null;
}

export const NewLookModal: React.FC<NewLookModalProps> = ({ isOpen, onClose, editWork }) => {
  const [formData, setFormData] = useState({
    title: editWork?.title || '',
    category: editWork?.category || 'Fashion & Tailoring',
    tag: editWork?.tag || 'Look // Autumn',
    image: editWork?.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    discipline: editWork?.discipline || 'Models',
    featured: editWork?.featured ?? true,
    photographer: editWork?.photographer || 'Studio Harvs Camera',
    stylist: editWork?.stylist || 'Aniekeme Bassey',
    model: editWork?.model || '',
    description: editWork?.description || '',
  });

  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadLocalFile(file, 'lookbook');
      setFormData((prev) => ({ ...prev, image: res.url }));
      setUploadSuccessName(file.name);
    } catch (err) {
      console.error('Look image upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editWork) {
      workspaceStore.updateLookbookWork(editWork.id, formData);
    } else {
      workspaceStore.addLookbookWork(formData);
    }
    onClose();
  };

  const sampleImages = [
    { label: 'Crimson Tailoring', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Brutalist Trench', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Editorial Model', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Studio Minimal', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Local Asset: Hero', url: '/assets/images/editorial_hero.jpg' },
    { label: 'Local Asset: Avant Garde', url: '/assets/images/avant_garde_fashion.jpg' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8F4EF]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15 mb-6">
          <div>
            <span className="text-[0.68rem] tracking-[0.22em] text-[#EFCEA5] uppercase font-semibold">
              Editorial CMS Manager
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">
              {editWork ? 'Edit Lookbook Work' : 'Publish New Editorial Look'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#EFCEA5]/70 hover:text-[#EFCEA5] rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Look Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Solitude in Crimson"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Discipline
              </label>
              <select
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                {DISCIPLINES.map((disc) => (
                  <option key={disc} value={disc}>{disc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Category Subtitle
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. High-Fashion Outerwear"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Look Tag Badge
              </label>
              <input
                type="text"
                required
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g. Look 07 // Direction"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          {/* Dual Image Input: Local Device Upload or Direct URL */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80">
                Editorial Imagery
              </label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-[#EFCEA5]/15 text-[0.68rem]">
                <button
                  type="button"
                  onClick={() => setImageSourceMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    imageSourceMode === 'upload' ? 'bg-[#EFCEA5] text-[#1F0205] font-semibold' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                  }`}
                >
                  <UploadCloud className="w-3 h-3" /> Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    imageSourceMode === 'url' ? 'bg-[#EFCEA5] text-[#1F0205] font-semibold' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                  }`}
                >
                  <Link2 className="w-3 h-3" /> External URL
                </button>
              </div>
            </div>

            {imageSourceMode === 'upload' ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
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
                      <span className="text-xs text-[#EFCEA5]">Uploading editorial image...</span>
                    </div>
                  ) : uploadSuccessName ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                      <Check className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-serif text-[#F8F4EF]">{uploadSuccessName}</span>
                      <span className="text-[0.65rem] text-[#EFCEA5]/60">Click to change file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UploadCloud className="w-8 h-8 text-[#EFCEA5]/50 group-hover:text-[#EFCEA5] transition-colors" />
                      <div>
                        <span className="text-xs font-serif text-[#F8F4EF] block font-medium">
                          Choose an image from your device
                        </span>
                        <span className="text-[0.68rem] text-[#EFCEA5]/60 block mt-0.5">
                          PNG, JPG, WEBP high-resolution editorial portrait or landscape
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Thumbnail */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-black/30 border border-[#EFCEA5]/15">
                    <img src={formData.image} alt="Preview" className="w-14 h-14 rounded-lg object-cover bg-black" />
                    <div className="overflow-hidden">
                      <span className="text-[0.68rem] text-emerald-400 font-semibold uppercase block">Image Loaded</span>
                      <span className="text-xs text-[#EFCEA5]/70 truncate block">{formData.image.slice(0, 50)}...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or /assets/images/..."
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                />
                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[0.68rem] text-[#EFCEA5]/70 py-1 mr-1">Presets:</span>
                  {sampleImages.map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      onClick={() => setFormData({ ...formData, image: s.url })}
                      className="text-[0.65rem] px-2 py-0.5 rounded bg-white/5 hover:bg-[#EFCEA5]/20 text-[#EFCEA5]/90 border border-[#EFCEA5]/20 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                Lead Stylist
              </label>
              <input
                type="text"
                value={formData.stylist}
                onChange={(e) => setFormData({ ...formData, stylist: e.target.value })}
                placeholder="e.g. Aniekeme Bassey"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                Camera / Photographer
              </label>
              <input
                type="text"
                value={formData.photographer}
                onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                placeholder="e.g. Harvs Studio Camera"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                Talent / Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Imo Ekong"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Production Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Editorial notes, garment silhouette details, lighting approach..."
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#320409] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#EFCEA5] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8C1625]"></div>
              <span className="ml-3 text-xs uppercase tracking-wider text-[#F8F4EF] font-medium">
                Feature on Public Portfolio &amp; Hero Marquee
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
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
              <Sparkles className="w-3.5 h-3.5" />
              {editWork ? 'Save Changes' : 'Publish Look'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
