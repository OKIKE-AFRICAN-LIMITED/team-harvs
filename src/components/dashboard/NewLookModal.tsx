import React, { useState, useRef } from 'react';
import { X, Sparkles, Image as ImageIcon, UploadCloud, Check, Loader2, Link2, Video, Film } from 'lucide-react';
import { workspaceStore, LookbookWork, DISCIPLINES, isVideoMedia } from '@/lib/workspaceStore';
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
    tag: '',
    image: editWork?.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    videoUrl: editWork?.videoUrl || (isVideoMedia(editWork?.image) ? editWork?.image : '') || '',
    mediaType: (editWork?.mediaType || (editWork?.videoUrl || isVideoMedia(editWork?.image) ? 'video' : 'image')) as 'image' | 'video',
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

  React.useEffect(() => {
    if (editWork) {
      const isVid = Boolean(editWork.videoUrl) || editWork.mediaType === 'video' || isVideoMedia(editWork.image);
      setFormData({
        title: editWork.title || '',
        category: editWork.category || 'Fashion & Tailoring',
        tag: '',
        image: editWork.image || '/assets/images/editorial_hero.jpg',
        videoUrl: editWork.videoUrl || (isVid ? editWork.image : '') || '',
        mediaType: isVid ? 'video' : 'image',
        discipline: editWork.discipline || 'Models',
        featured: editWork.featured ?? true,
        photographer: editWork.photographer || 'Studio Harvs Camera',
        stylist: editWork.stylist || 'Aniekeme Bassey',
        model: editWork.model || '',
        description: editWork.description || '',
      });
      setUploadSuccessName(null);
    } else {
      setFormData({
        title: '',
        category: 'Fashion & Tailoring',
        tag: '',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        videoUrl: '',
        mediaType: 'image',
        discipline: 'Models',
        featured: true,
        photographer: 'Studio Harvs Camera',
        stylist: 'Aniekeme Bassey',
        model: '',
        description: '',
      });
      setUploadSuccessName(null);
    }
  }, [editWork, isOpen]);

  if (!isOpen) return null;

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadLocalFile(file, 'lookbook');
      const isVideoFile = file.type.startsWith('video/') || isVideoMedia(file.name);
      
      if (isVideoFile || formData.mediaType === 'video') {
        setFormData((prev) => ({ 
          ...prev, 
          image: res.url,
          videoUrl: res.url,
          mediaType: 'video'
        }));
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          image: res.url,
          mediaType: 'image'
        }));
      }
      setUploadSuccessName(file.name);
    } catch (err: any) {
      console.error('Look media upload failed:', err);
      window.alert(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPayload = {
      ...formData,
      image: formData.mediaType === 'video' ? (formData.videoUrl || formData.image) : formData.image,
      videoUrl: formData.mediaType === 'video' ? (formData.videoUrl || formData.image) : undefined,
    };
    if (editWork) {
      workspaceStore.updateLookbookWork(editWork.id, finalPayload);
    } else {
      workspaceStore.addLookbookWork(finalPayload);
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

  const sampleVideos = [
    { label: 'Cinema Motion Reel', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { label: 'BTS Production Clip', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    { label: 'High-Fashion Dynamic', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
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

          {/* Media Format Selector: Photography Image vs Cinematography Video */}
          <div className="pt-2">
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Production Media Format
            </label>
            <div className="flex items-center justify-between mb-3 p-1 rounded-xl bg-black/40 border border-[#EFCEA5]/20">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  formData.mediaType === 'image'
                    ? 'bg-[#EFCEA5] text-[#1F0205] shadow'
                    : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Photography (Still Image)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  formData.mediaType === 'video'
                    ? 'bg-[#EFCEA5] text-[#1F0205] shadow'
                    : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Motion / BTS (Video)
              </button>
            </div>

            {/* Input Source Toggle: Device Upload vs URL */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.72rem] uppercase tracking-wider text-[#EFCEA5]/70 font-medium">
                {formData.mediaType === 'video' ? 'Video Media Source' : 'Editorial Image Source'}
              </span>
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
                  <Link2 className="w-3 h-3" /> Direct URL
                </button>
              </div>
            </div>

            {imageSourceMode === 'upload' ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={formData.mediaType === 'video' ? "video/mp4,video/webm,video/quicktime,video/ogg,video/*" : "image/*"}
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
                      <span className="text-xs text-[#EFCEA5]">
                        Uploading {formData.mediaType === 'video' ? 'editorial video clip...' : 'editorial image...'}
                      </span>
                    </div>
                  ) : uploadSuccessName ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                      <Check className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-serif text-[#F8F4EF]">{uploadSuccessName}</span>
                      <span className="text-[0.65rem] text-[#EFCEA5]/60">Click to replace file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      {formData.mediaType === 'video' ? (
                        <Film className="w-8 h-8 text-[#EFCEA5]/60 group-hover:text-[#EFCEA5] transition-colors" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-[#EFCEA5]/50 group-hover:text-[#EFCEA5] transition-colors" />
                      )}
                      <div>
                        <span className="text-xs font-serif text-[#F8F4EF] block font-medium">
                          {formData.mediaType === 'video' ? 'Choose a video from your device' : 'Choose an image from your device'}
                        </span>
                        <span className="text-[0.68rem] text-[#EFCEA5]/60 block mt-0.5">
                          {formData.mediaType === 'video'
                            ? 'MP4, WebM, MOV cinema motion reels, fashion cuts & BTS videos'
                            : 'PNG, JPG, WEBP high-resolution editorial portrait or landscape'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Player / Thumbnail */}
                {(formData.videoUrl || formData.image) && (
                  <div className="p-3 rounded-xl bg-black/40 border border-[#EFCEA5]/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.68rem] text-emerald-400 font-semibold uppercase flex items-center gap-1">
                        <Check className="w-3 h-3" /> {formData.mediaType === 'video' ? 'Video Loaded' : 'Image Loaded'}
                      </span>
                    </div>
                    {formData.mediaType === 'video' ? (
                      <video
                        src={formData.videoUrl || formData.image}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full max-h-48 rounded-lg bg-black object-contain border border-[#EFCEA5]/10"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover bg-black" />
                        <span className="text-xs text-[#EFCEA5]/70 truncate">{formData.image.slice(0, 55)}...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={formData.mediaType === 'video' ? (formData.videoUrl || formData.image) : formData.image}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (formData.mediaType === 'video') {
                      setFormData({ ...formData, videoUrl: val, image: val });
                    } else {
                      setFormData({ ...formData, image: val });
                    }
                  }}
                  placeholder={formData.mediaType === 'video' ? "https://.../video.mp4" : "https://... or /assets/images/..."}
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                />

                {/* Video / Image Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[0.68rem] text-[#EFCEA5]/70 py-1 mr-1">Sample Presets:</span>
                  {(formData.mediaType === 'video' ? sampleVideos : sampleImages).map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      onClick={() => {
                        if (formData.mediaType === 'video') {
                          setFormData({ ...formData, videoUrl: s.url, image: s.url });
                        } else {
                          setFormData({ ...formData, image: s.url });
                        }
                      }}
                      className="text-[0.65rem] px-2 py-0.5 rounded bg-white/5 hover:bg-[#EFCEA5]/20 text-[#EFCEA5]/90 border border-[#EFCEA5]/20 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* URL Preview */}
                {(formData.videoUrl || formData.image) && formData.mediaType === 'video' && (
                  <div className="pt-2">
                    <video
                      src={formData.videoUrl || formData.image}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full max-h-48 rounded-lg bg-black object-contain border border-[#EFCEA5]/10"
                    />
                  </div>
                )}
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
