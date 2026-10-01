import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Archive, Trash2, ExternalLink, Phone, Mail, Camera, UserCheck } from 'lucide-react';
import { workspaceStore, Application } from '@/lib/workspaceStore';

interface ApplicantDossierModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicantDossierModal: React.FC<ApplicantDossierModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !application) return null;

  const [notes, setNotes] = useState(application.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  const handleStatusChange = (newStatus: Application['status']) => {
    workspaceStore.updateApplicationStatus(application.id, newStatus, notes);
    onClose();
  };

  const handleSaveNotes = () => {
    workspaceStore.updateApplicationStatus(application.id, application.status, notes);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${application.fullName}'s application?`)) {
      workspaceStore.deleteApplication(application.id);
      onClose();
    }
  };

  // Extract phone number for WhatsApp link if possible
  const rawPhone = application.contact.replace(/[^\d]/g, '');
  const waUrl = rawPhone.length >= 10 ? `https://wa.me/${rawPhone}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8F4EF]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EFCEA5]/15 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[0.68rem] tracking-[0.24em] text-[#EFCEA5] uppercase font-semibold">
                Talent Dossier // {application.discipline}
              </span>
              <span className={`text-[0.65rem] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                application.status === 'On Roster'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : application.status === 'Under Review'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                  : application.status === 'Pending'
                  ? 'bg-[#8C1625]/40 text-[#EFCEA5] border border-[#8C1625]'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {application.status}
              </span>
            </div>
            <h2 className="text-2xl font-serif text-[#F8F4EF]">{application.fullName}</h2>
            <span className="text-xs text-[#EFCEA5]/60">Applied {application.date}</span>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-[#EFCEA5]/70 hover:text-[#EFCEA5] rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact & Links */}
        <div className="bg-[#2A050A] rounded-xl p-4 border border-[#EFCEA5]/15 space-y-3 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-[#EFCEA5]/70 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Contact Details
            </span>
            <span className="font-mono text-[#F8F4EF]">{application.contact}</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-[#EFCEA5]/70 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Portfolio / Handle
            </span>
            <a 
              href={application.portfolio.startsWith('http') ? application.portfolio : `https://instagram.com/${application.portfolio.replace('@', '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[#EFCEA5] underline flex items-center gap-1 hover:text-white"
            >
              {application.portfolio} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {waUrl && (
            <div className="pt-2 border-t border-[#EFCEA5]/10 flex justify-end">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Phone className="w-3 h-3" /> Connect on WhatsApp &rarr;
              </a>
            </div>
          )}
        </div>

        {/* Experience & Notes */}
        {application.experience && (
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
              Creative Background &amp; Experience
            </label>
            <div className="bg-[#2A050A]/70 border border-[#EFCEA5]/10 rounded-lg p-3 text-xs leading-relaxed text-[#F8F4EF]/90">
              {application.experience}
            </div>
          </div>
        )}

        {/* Admin Evaluation Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80">
              Internal Director Notes
            </label>
            {isSavedNotes && (
              <span className="text-[0.68rem] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved to dossier
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal feedback, look suitability, casting measurements, test shoot requirements..."
            className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="text-[0.7rem] uppercase tracking-wider px-3 py-1 rounded bg-[#EFCEA5]/15 hover:bg-[#EFCEA5]/25 text-[#EFCEA5] border border-[#EFCEA5]/20 transition-colors"
            >
              Update Notes
            </button>
          </div>
        </div>

        {/* Pipeline Decision Actions */}
        <div className="pt-4 border-t border-[#EFCEA5]/15 space-y-3">
          <span className="block text-[0.7rem] uppercase tracking-widest text-[#EFCEA5]/70">
            Pipeline Decision
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleStatusChange('On Roster')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-emerald-700/80 hover:bg-emerald-600 text-white transition-all shadow-md"
            >
              <UserCheck className="w-3.5 h-3.5" /> Accept to Roster
            </button>
            <button
              onClick={() => handleStatusChange('Under Review')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-amber-700/80 hover:bg-amber-600 text-white transition-all shadow-md"
            >
              <Clock className="w-3.5 h-3.5" /> Under Review
            </button>
            <button
              onClick={() => handleStatusChange('Archived')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700"
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 text-[0.72rem] text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Application
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-[#EFCEA5]/80 hover:text-[#EFCEA5]"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
