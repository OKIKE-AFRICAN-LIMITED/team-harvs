import React, { useState } from 'react';
import { X, Send, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { workspaceStore, ProjectBrief } from '@/lib/workspaceStore';

interface SubmitDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefs: ProjectBrief[];
}

export const SubmitDeliverableModal: React.FC<SubmitDeliverableModalProps> = ({
  isOpen,
  onClose,
  briefs,
}) => {
  const [briefId, setBriefId] = useState(briefs[0]?.id || '');
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState('Stylist');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBrief = briefs.find((b) => b.id === briefId) || briefs[0];
    workspaceStore.addSubmission({
      briefId: targetBrief?.id || 'brief-gen',
      briefTitle: targetBrief?.title || 'Production Submission',
      memberName,
      role,
      link,
      notes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8F4EF]">
        
        <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15 mb-6">
          <div>
            <span className="text-[0.68rem] tracking-[0.22em] text-[#EFCEA5] uppercase font-semibold">
              Member Workspace
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">Submit Deliverable / Work</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#EFCEA5]/70 hover:text-[#EFCEA5] rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-10 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-serif text-[#F8F4EF]">Deliverable Transmitted</h3>
            <p className="text-xs text-[#EFCEA5]/70">The Creative Director and production lead will review your submission.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Target Production Brief
              </label>
              <select
                value={briefId}
                onChange={(e) => setBriefId(e.target.value)}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                {briefs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.discipline})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. David Okon"
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                  Your Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                >
                  <option value="Model">Model</option>
                  <option value="Stylist">Stylist</option>
                  <option value="MUA">MUA</option>
                  <option value="Videographer">Videographer / BTS</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Assistant">Creative Assistant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5" /> Deliverable Link (Google Drive / Vimeo / Dropbox / Figma)
              </label>
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Notes / Submission Comments
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details about color grades, look revisions, timestamps, export formats..."
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
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
                <Send className="w-3.5 h-3.5" /> Submit Work
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
