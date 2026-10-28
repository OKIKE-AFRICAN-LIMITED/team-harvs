import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  Download, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Briefcase, 
  MessageSquare,
  Eye,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { MemberSubmission, ProjectBrief, workspaceStore } from '@/lib/workspaceStore';
import { downloadFile } from '@/lib/downloadHelper';

interface DeliverableReviewModalProps {
  submission: MemberSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  briefs?: ProjectBrief[];
}

export const DeliverableReviewModal: React.FC<DeliverableReviewModalProps> = ({
  submission,
  isOpen,
  onClose,
  briefs = [],
}) => {
  if (!isOpen || !submission) return null;

  const [feedback, setFeedback] = useState(submission.adminFeedback || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'preview' | 'details'>('preview');
  const [hasCopiedText, setHasCopiedText] = useState(false);

  // Sync initial feedback state when active submission changes
  useEffect(() => {
    setFeedback(submission.adminFeedback || '');
    setHasCopiedText(false);
  }, [submission]);

  const isPdf = Boolean(
    submission.pdfUrl || 
    submission.link?.toLowerCase().endsWith('.pdf') || 
    submission.link?.includes('.pdf') || 
    submission.link?.startsWith('data:application/pdf')
  );
  const isTextSubmission = Boolean(
    submission.submissionType === 'text' ||
    submission.textContent ||
    submission.link === 'text://submission'
  );

  // Find connected project brief if available
  const matchingBrief = useMemo(() => {
    return briefs.find((b) => b.id === submission.briefId || b.title === submission.briefTitle);
  }, [briefs, submission]);

  // Convert data: URL to safe Object URL for iframe preview & downloads (bypassing browser top-frame block)
  const safePdfBlobUrl = useMemo(() => {
    if (!submission.pdfUrl) return null;
    if (submission.pdfUrl.startsWith('data:')) {
      try {
        const [header, base64] = submission.pdfUrl.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf';
        const binary = atob(base64);
        const len = binary.length;
        const buffer = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          buffer[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([buffer], { type: mime });
        return URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Could not parse base64 PDF:', err);
        return null;
      }
    }
    return submission.pdfUrl;
  }, [submission.pdfUrl]);

  useEffect(() => {
    return () => {
      if (safePdfBlobUrl && safePdfBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(safePdfBlobUrl);
      }
    };
  }, [safePdfBlobUrl]);

  const handleDownload = () => {
    const url = safePdfBlobUrl || submission.pdfUrl || submission.link;
    if (!url) return;

    const safeName = `${submission.memberName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${submission.briefTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_deliverable.pdf`;
    downloadFile(url, safeName);
  };

  const handleCopySubmittedText = () => {
    const text = submission.textContent || submission.notes;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setHasCopiedText(true);
    setTimeout(() => setHasCopiedText(false), 2000);
  };

  const handleDownloadTextAsFile = () => {
    const text = submission.textContent || submission.notes;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const safeName = `${submission.memberName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${submission.briefTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_assignment.txt`;
    downloadFile(blobUrl, safeName);
  };

  const handleOpenExternal = () => {
    const url = safePdfBlobUrl || submission.pdfUrl || submission.link;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleApprove = () => {
    setIsUpdating(true);
    workspaceStore.updateSubmissionStatus(submission.id, 'Approved', feedback.trim() || undefined);
    setIsUpdating(false);
    onClose();
  };

  const handleRequestRevision = () => {
    if (!feedback.trim()) {
      alert('Please add a short note explaining what changes or revisions the student should make.');
      return;
    }
    setIsUpdating(true);
    workspaceStore.updateSubmissionStatus(submission.id, 'Revision Requested', feedback.trim());
    setIsUpdating(false);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove this deliverable from ${submission.memberName}?`)) {
      workspaceStore.deleteSubmission(submission.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#170204] border border-[#EFCEA5]/25 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#F8F4EF]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-6 sm:p-7 border-b border-[#EFCEA5]/15 flex items-start justify-between gap-4 bg-gradient-to-r from-[#240306] to-[#170204]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold font-mono">
                Deliverable QA Inspection
              </span>
              <span className={`text-[0.65rem] px-3 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                submission.status === 'Approved'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : submission.status === 'Revision Requested'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
              }`}>
                {submission.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F4EF]">
              {submission.briefTitle}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#EFCEA5]/70 flex-wrap">
              <span className="flex items-center gap-1.5 text-[#F8F4EF]">
                <User className="w-3.5 h-3.5 text-[#EFCEA5]" /> 
                {submission.memberName}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#EFCEA5]" />
                {submission.role || 'Talent Member'}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#EFCEA5]" />
                {submission.date}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#EFCEA5]/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">

          {/* Quick Info Grid: Production Brief Context */}
          {matchingBrief && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-[#EFCEA5]/15 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#EFCEA5]/10 pb-2">
                <span className="text-[0.65rem] uppercase tracking-widest text-[#EFCEA5]/70 font-semibold">
                  Associated Shoot Brief
                </span>
                <span className="text-xs text-[#EFCEA5]">
                  Status: <strong className="text-[#F8F4EF]">{matchingBrief.status}</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {matchingBrief.location && (
                  <div className="flex items-center gap-2 text-[#EFCEA5]/80">
                    <MapPin className="w-3.5 h-3.5 text-[#EFCEA5] shrink-0" />
                    <span className="truncate">{matchingBrief.location}</span>
                  </div>
                )}
                {matchingBrief.date && (
                  <div className="flex items-center gap-2 text-[#EFCEA5]/80">
                    <Calendar className="w-3.5 h-3.5 text-[#EFCEA5] shrink-0" />
                    <span>Shoot: {matchingBrief.date}</span>
                  </div>
                )}
                {matchingBrief.callTime && (
                  <div className="flex items-center gap-2 text-[#EFCEA5]/80">
                    <Clock className="w-3.5 h-3.5 text-[#EFCEA5] shrink-0" />
                    <span>Call: {matchingBrief.callTime}</span>
                  </div>
                )}
              </div>
              {matchingBrief.deliverables && matchingBrief.deliverables.length > 0 && (
                <div className="pt-2">
                  <span className="text-[0.62rem] text-[#EFCEA5]/60 uppercase tracking-wider block mb-1.5">
                    Expected Deliverables for this Brief:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {matchingBrief.deliverables.map((d, idx) => (
                      <span key={idx} className="text-[0.68rem] px-2.5 py-0.5 rounded-lg bg-white/5 border border-[#EFCEA5]/15 text-[#EFCEA5]">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student / Talent Submission Notes */}
          <div className="p-5 rounded-2xl bg-[#230407] border border-[#EFCEA5]/20 space-y-2">
            <span className="text-[0.65rem] uppercase tracking-wider text-[#EFCEA5] font-semibold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Talent Submission Notes &amp; Reflection
            </span>
            {submission.notes ? (
              <p className="text-sm text-[#F8F4EF] leading-relaxed italic bg-black/25 p-3.5 rounded-xl border border-[#EFCEA5]/10">
                &ldquo;{submission.notes}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-[#EFCEA5]/50 italic">No notes were provided with this submission.</p>
            )}
          </div>

          {/* Deliverable File / Asset Access Bar */}
          <div className="p-5 rounded-2xl bg-black/40 border border-[#EFCEA5]/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFCEA5]/10">
              <span className="text-xs uppercase tracking-wider text-[#EFCEA5] font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Submitted Deliverable Asset
              </span>
              
              <div className="flex items-center gap-2 flex-wrap">
                {(safePdfBlobUrl || submission.pdfUrl) && (
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EFCEA5] text-[#1F0205] text-xs font-semibold flex items-center gap-1.5 hover:bg-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                )}

                {(safePdfBlobUrl || submission.pdfUrl || submission.link) && (
                  <button
                    onClick={handleOpenExternal}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-white/20 transition-colors border border-[#EFCEA5]/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                  </button>
                )}
              </div>
            </div>

            {/* Embedded PDF Viewer if PDF is present */}
            {isPdf && safePdfBlobUrl ? (
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden border border-[#EFCEA5]/20 bg-[#0A0102]">
                  <iframe
                    src={safePdfBlobUrl}
                    title="Deliverable PDF Document"
                    className="w-full h-[360px] sm:h-[460px] bg-white rounded-xl"
                  />
                </div>
                <p className="text-[0.68rem] text-[#EFCEA5]/60 text-right">
                  Preview rendered inside studio sandbox. Use "Download PDF" or "Open in New Tab" for high-resolution inspection.
                </p>
              </div>
            ) : isTextSubmission ? (
              <div className="p-5 rounded-xl bg-[#1C0306] border border-[#EFCEA5]/20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EFCEA5]/10">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Written Assignment Submission
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySubmittedText}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#EFCEA5] flex items-center gap-1 transition-colors"
                    >
                      {hasCopiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadTextAsFile}
                      className="px-3 py-1.5 rounded-lg bg-[#EFCEA5] text-[#1F0205] text-xs font-semibold flex items-center gap-1 hover:bg-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Save .txt
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-[#EFCEA5]/10 text-sm text-[#F8F4EF] leading-relaxed whitespace-pre-wrap font-sans select-text">
                  {submission.textContent || submission.notes}
                </div>
              </div>
            ) : submission.link && submission.link !== '#' && submission.link !== 'text://submission' ? (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-[#EFCEA5]/10 flex items-center justify-between gap-3">
                <div className="space-y-0.5 truncate">
                  <span className="text-[0.65rem] uppercase tracking-wider text-[#EFCEA5]/60 block">Asset URL</span>
                  <a 
                    href={submission.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-[#EFCEA5] hover:underline truncate block font-mono"
                  >
                    {submission.link}
                  </a>
                </div>
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#EFCEA5] text-[#1F0205] text-xs font-semibold flex items-center gap-1.5 shrink-0 hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Cloud Drive
                </a>
              </div>
            ) : (
              <p className="text-xs text-[#EFCEA5]/50 italic">No direct file or cloud URL was attached.</p>
            )}
          </div>

          {/* QA Review & Feedback Section */}
          <div className="p-5 rounded-2xl bg-[#1C0306] border border-[#EFCEA5]/20 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#EFCEA5] block">
              Director QA Feedback &amp; Revision Instructions
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Excellent framing on the first 3 looks. Please color grade the exterior shots to match the 35mm warmth before final sign-off."
              className="w-full bg-black/40 border border-[#EFCEA5]/20 rounded-xl p-3.5 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/30 focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-5 sm:p-6 border-t border-[#EFCEA5]/15 bg-[#120103] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Submission
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRequestRevision}
              disabled={isUpdating}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Request Revision
            </button>

            <button
              onClick={handleApprove}
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-950 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Approve Deliverable
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
