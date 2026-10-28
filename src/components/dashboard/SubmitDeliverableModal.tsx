import React, { useState, useRef } from 'react';
import { X, Send, Link as LinkIcon, CheckCircle2, FileUp, Loader2, Check, FileText } from 'lucide-react';
import { workspaceStore, ProjectBrief, DISCIPLINES } from '@/lib/workspaceStore';
import { uploadLocalFile } from '@/lib/fileUpload';

import { Profile } from '@/lib/supabase';

interface SubmitDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefs: ProjectBrief[];
  initialBriefId?: string;
  currentUser?: any;
  currentProfile?: Profile | null;
}

export const SubmitDeliverableModal: React.FC<SubmitDeliverableModalProps> = ({
  isOpen,
  onClose,
  briefs,
  initialBriefId,
  currentUser,
  currentProfile,
}) => {
  const [briefId, setBriefId] = useState(initialBriefId || (briefs[0]?.id || 'general'));
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState<string>(DISCIPLINES[0]);
  const [submissionType, setSubmissionType] = useState<'link' | 'pdf' | 'text'>('link');
  const [link, setLink] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialBriefId) {
        setBriefId(initialBriefId);
        const target = briefs.find(b => b.id === initialBriefId);
        if (target?.isAssignment || target?.assignmentText) {
          setSubmissionType('text');
        }
      } else if (!briefId || briefId === '') {
        setBriefId(briefs[0]?.id || 'general');
      }
    }
    if (currentProfile?.full_name) {
      setMemberName(currentProfile.full_name);
    } else if (currentUser?.email && !memberName) {
      setMemberName(currentUser.email.split('@')[0]);
    }
    if (currentProfile?.discipline) {
      setRole(currentProfile.discipline);
    }
  }, [currentProfile, currentUser, isOpen, briefs, initialBriefId]);

  if (!isOpen) return null;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadLocalFile(file, 'deliverables');
      setPdfUrl(res.url);
      setUploadedPdfName(file.name);
      if (!link) {
        setLink(res.url);
      }
    } catch (err: any) {
      console.error('PDF upload failed:', err);
      window.alert(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedBrief = briefs.find((b) => b.id === briefId);
  const assignments = briefs.filter((b) => b.isAssignment || b.assignmentText);
  const shootBriefs = briefs.filter((b) => !b.isAssignment && !b.assignmentText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isGeneral = !briefId || briefId === 'general';
    const finalBriefId = isGeneral ? 'general-assignment' : (selectedBrief?.id || briefs[0]?.id || 'brief-gen');
    const finalBriefTitle = isGeneral
      ? 'General / Open Assignment Submission'
      : `${selectedBrief?.isAssignment ? '[Assignment] ' : ''}${selectedBrief?.title || 'Production Submission'}`;

    const finalLink = submissionType === 'text'
      ? 'text://submission'
      : submissionType === 'pdf'
        ? (pdfUrl || link || '')
        : (link || pdfUrl || '');

    if (submissionType === 'text' && !textContent.trim()) {
      alert('Please enter your written assignment or deliverable text before submitting.');
      return;
    }
    
    workspaceStore.addSubmission({
      briefId: finalBriefId,
      briefTitle: finalBriefTitle,
      memberName: memberName.trim() || currentProfile?.full_name || 'Creative Member',
      role,
      link: finalLink || '#',
      pdfUrl: submissionType === 'pdf' ? (pdfUrl || finalLink) : undefined,
      textContent: submissionType === 'text' ? textContent.trim() : undefined,
      submissionType,
      notes: notes.trim() || (submissionType === 'text' ? textContent.trim() : ''),
    }, currentUser?.id);

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80">
                  Target Assignment or Shoot Brief
                </label>
                {selectedBrief && (
                  <span className={`text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    selectedBrief.isAssignment 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20'
                  }`}>
                    {selectedBrief.isAssignment ? 'Assignment Task' : 'Shoot Brief'}
                  </span>
                )}
              </div>
              <select
                value={briefId}
                onChange={(e) => {
                  const val = e.target.value;
                  setBriefId(val);
                  const b = briefs.find(item => item.id === val);
                  if (b?.isAssignment && submissionType !== 'text') {
                    setSubmissionType('text');
                  }
                }}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="general">✨ General / Open Assignment Submission</option>

                {assignments.length > 0 && (
                  <optgroup label="📋 Active Assignments & Tasks">
                    {assignments.map((b) => (
                      <option key={b.id} value={b.id}>
                        [ASSIGNMENT] {b.title.replace(/^\[Assignment\]\s*/i, '')} ({b.discipline})
                      </option>
                    ))}
                  </optgroup>
                )}

                {shootBriefs.length > 0 && (
                  <optgroup label="🎬 Production Briefs & Sets">
                    {shootBriefs.map((b) => (
                      <option key={b.id} value={b.id}>
                        [SHOOT BRIEF] {b.title} ({b.discipline})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Context helper when a brief or assignment is selected */}
              {selectedBrief && (
                <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-[#EFCEA5]/10 flex items-center justify-between text-xs text-[#EFCEA5]/80">
                  <span className="truncate font-sans">
                    <strong className="text-[#F8F4EF]">{selectedBrief.title.replace(/^\[Assignment\]\s*/i, '')}</strong>
                    {' &bull; '}
                    {selectedBrief.isAssignment ? `Deadline: ${selectedBrief.callTime}` : `Call: ${selectedBrief.callTime}`}
                  </span>
                  <span className="text-[0.68rem] text-[#EFCEA5]/60 shrink-0 ml-2">Lead: {selectedBrief.lead}</span>
                </div>
              )}
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
                  Your Discipline
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submission Format Switcher */}
            <div className="pt-1">
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Deliverable Format
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-[#EFCEA5]/15 mb-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSubmissionType('link')}
                  className={`py-2 px-1 rounded-lg font-semibold uppercase tracking-wider text-[0.65rem] flex items-center justify-center gap-1 transition-colors ${
                    submissionType === 'link' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" /> Cloud Link
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType('pdf')}
                  className={`py-2 px-1 rounded-lg font-semibold uppercase tracking-wider text-[0.65rem] flex items-center justify-center gap-1 transition-colors ${
                    submissionType === 'pdf' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                  }`}
                >
                  <FileUp className="w-3 h-3" /> PDF File
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType('text')}
                  className={`py-2 px-1 rounded-lg font-semibold uppercase tracking-wider text-[0.65rem] flex items-center justify-center gap-1 transition-colors ${
                    submissionType === 'text' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                  }`}
                >
                  <FileText className="w-3 h-3" /> Text / Write
                </button>
              </div>

              {submissionType === 'text' ? (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between text-[0.68rem] text-[#EFCEA5]/70">
                    <span>Drop your written assignment response, concept or treatment:</span>
                    <span className="font-mono text-[#EFCEA5]">{textContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type or paste your assignment text here... (e.g. creative treatment, styling notes, copywriting, shot list breakdown, feedback)"
                    className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg p-3 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5] font-sans leading-relaxed"
                  />
                </div>
              ) : submissionType === 'pdf' ? (
                <div className="animate-fade-in">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="p-5 rounded-xl border-2 border-dashed border-[#EFCEA5]/25 hover:border-[#EFCEA5]/60 bg-black/20 hover:bg-black/40 transition-all text-center cursor-pointer group"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <Loader2 className="w-6 h-6 text-[#EFCEA5] animate-spin" />
                        <span className="text-xs text-[#EFCEA5]">Processing PDF upload...</span>
                      </div>
                    ) : uploadedPdfName ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Check className="w-6 h-6 text-emerald-400" />
                        <span className="text-xs font-serif text-[#F8F4EF] font-medium">{uploadedPdfName}</span>
                        <span className="text-[0.65rem] text-[#EFCEA5]/60">PDF attached &bull; Click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <FileUp className="w-7 h-7 text-[#EFCEA5]/50 group-hover:text-[#EFCEA5] transition-colors" />
                        <span className="text-xs font-serif text-[#F8F4EF]">Choose PDF from your device</span>
                        <span className="text-[0.65rem] text-[#EFCEA5]/60">Assignment dossier, lookbook tear sheet, or contact sheet</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <input
                    type="url"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://drive.google.com/... or https://vimeo.com/..."
                    className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                  />
                </div>
              )}
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
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-lg hover:scale-105 disabled:opacity-50"
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
