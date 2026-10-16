import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  Users, 
  FolderKanban, 
  FileText, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Trash2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Eye, 
  Download, 
  AlertCircle, 
  Inbox, 
  Filter,
  ArrowUpRight,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  UploadCloud,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Link2,
  Calendar,
  Mail,
  Phone,
  Save,
  Edit3,
  Video,
  RefreshCw
} from 'lucide-react';
import { 
  Application, 
  LookbookWork, 
  ProjectBrief, 
  CreativeAsset, 
  MemberSubmission,
  HeroStreamItem,
  BriefInteraction,
  DISCIPLINES,
  workspaceStore,
  isVideoMedia
} from '@/lib/workspaceStore';
import type { Profile } from '@/lib/supabase';
import { uploadLocalFile } from '@/lib/fileUpload';
import { repairEmbeddedMedia, type RepairProgress } from '@/lib/mediaRepair';

export interface AdminDashboardProps {
  users?: Profile[];
  heroStream?: HeroStreamItem[];
  applications: Application[];
  lookbook: LookbookWork[];
  briefs: ProjectBrief[];
  assets: CreativeAsset[];
  submissions: MemberSubmission[];
  activeTab?: 'overview' | 'users' | 'hero' | 'lookbook' | 'roster' | 'briefs' | 'submissions' | 'assets';
  onNavigateTab?: (tab: any) => void;
  onOpenNewLook: () => void;
  onOpenNewBrief: () => void;
  onOpenNewAsset: () => void;
  onSelectApplicant: (app: Application) => void;
  onPreviewLook: (work: LookbookWork) => void;
  onEditLook?: (work: LookbookWork) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users = [],
  heroStream = [],
  applications,
  lookbook,
  briefs,
  assets,
  submissions,
  activeTab = 'overview',
  onNavigateTab,
  onOpenNewLook,
  onOpenNewBrief,
  onOpenNewAsset,
  onSelectApplicant,
  onPreviewLook,
  onEditLook,
}) => {
  // Existing state
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'Pending' | 'Under Review' | 'On Roster' | 'Archived'>('all');
  const [lookbookSearch, setLookbookSearch] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');

  // USER MANAGEMENT STATE
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userDisciplineFilter, setUserDisciplineFilter] = useState<string>('all');

  // HERO STREAM CMS STATE
  const [activeHeroRow, setActiveHeroRow] = useState<1 | 2>(1);
  const [uploadingHeroItemId, setUploadingHeroItemId] = useState<string | null>(null);
  const [savingHeroItemId, setSavingHeroItemId] = useState<string | null>(null);
  const [savedHeroItemId, setSavedHeroItemId] = useState<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [targetHeroItemForUpload, setTargetHeroItemForUpload] = useState<string | null>(null);
  const [heroTitles, setHeroTitles] = useState<Record<string, string>>({});
  const [heroError, setHeroError] = useState<string | null>(null);
  const [repairState, setRepairState] = useState<RepairProgress | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);

  const heroNeedsRepair =
    workspaceStore.getSyncState().failedSections.includes('hero stream') ||
    heroStream.some((i) => (i.image || '').startsWith('data:'));

  const handleRepairMedia = async () => {
    setIsRepairing(true);
    setHeroError(null);
    try {
      const result = await repairEmbeddedMedia((p) => setRepairState(p));
      setRepairState(result);
      await workspaceStore.syncFromSupabase();
    } catch (err: any) {
      setHeroError(err?.message || 'Repair failed.');
    } finally {
      setIsRepairing(false);
    }
  };

  // PRODUCTION BRIEF ENGAGEMENT AUDIT STATE
  const [expandedBriefAuditId, setExpandedBriefAuditId] = useState<string | null>(null);

  // DELIVERABLES QA REVIEW STATE
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'all' | 'Submitted' | 'Approved' | 'Revision Requested'>('all');

  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const rosterMembers = applications.filter((a) => a.status === 'On Roster');
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  // Filtered Submissions List
  const filteredSubmissions = submissions.filter((s) => {
    const matchesStatus = submissionStatusFilter === 'all' ? true : s.status === submissionStatusFilter;
    const matchesSearch = !submissionSearch ? true : (
      (s.memberName || '').toLowerCase().includes(submissionSearch.toLowerCase()) ||
      (s.briefTitle || '').toLowerCase().includes(submissionSearch.toLowerCase()) ||
      (s.role || '').toLowerCase().includes(submissionSearch.toLowerCase()) ||
      (s.notes || '').toLowerCase().includes(submissionSearch.toLowerCase())
    );
    return matchesStatus && matchesSearch;
  });

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch = !userSearch ? true : (
      (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.discipline || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(userSearch.toLowerCase())
    );
    const matchesRole = userRoleFilter === 'all' ? true : u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' ? true : u.status === userStatusFilter;
    const matchesDiscipline = userDisciplineFilter === 'all' ? true : u.discipline === userDisciplineFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesDiscipline;
  });

  // Filtered Applicants List
  const filteredApplicants = applications.filter((a) => {
    const matchesFilter = applicantFilter === 'all' ? true : a.status === applicantFilter;
    const matchesSearch = rosterSearch === '' ? true : (
      a.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      a.discipline.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      a.contact.toLowerCase().includes(rosterSearch.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  // Filtered Lookbook List
  const filteredLookbook = lookbook.filter((w) => {
    if (!lookbookSearch) return true;
    const query = lookbookSearch.toLowerCase();
    return (
      w.title.toLowerCase().includes(query) ||
      w.category.toLowerCase().includes(query) ||
      w.discipline.toLowerCase().includes(query) ||
      w.tag.toLowerCase().includes(query)
    );
  });

  // Handle User Role Toggle
  const handleToggleUserRole = (user: Profile) => {
    const nextRole = user.role === 'admin' ? 'member' : 'admin';
    const confirmMsg = nextRole === 'admin'
      ? `Promote ${user.full_name || user.email} to Studio Director (Admin)? They will gain full administrative access.`
      : `Demote ${user.full_name || user.email} to Creative Member? They will lose administrative CMS privileges.`;
    
    if (window.confirm(confirmMsg)) {
      workspaceStore.updateUserRole(user.id, nextRole);
    }
  };

  // Handle User Status Toggle
  const handleToggleUserStatus = (user: Profile) => {
    const nextStatus = user.status === 'inactive' ? 'active' : 'inactive';
    const confirmMsg = nextStatus === 'inactive'
      ? `Deactivate ${user.full_name || user.email}'s account?`
      : `Reactivate ${user.full_name || user.email}'s account?`;
    
    if (window.confirm(confirmMsg)) {
      workspaceStore.updateUserStatus(user.id, nextStatus);
    }
  };

  const flashSaved = (id: string) => {
    setSavedHeroItemId(id);
    setTimeout(() => setSavedHeroItemId(null), 3500);
  };

  // Hero Item Device Upload Handler
  const handleHeroItemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = targetHeroItemForUpload;
    if (!file || !targetId) return;

    setHeroError(null);
    try {
      setUploadingHeroItemId(targetId);
      const res = await uploadLocalFile(file, 'lookbook');
      const result = await workspaceStore.updateHeroStreamItem(targetId, { image: res.url });
      if (!result.ok) throw new Error(result.error);
      flashSaved(targetId);
    } catch (err: any) {
      console.error('Hero item upload failed:', err);
      setHeroError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingHeroItemId(null);
      setTargetHeroItemForUpload(null);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  // Explicit Save Handler for Hero Card
  const handleSaveHeroItem = async (item: HeroStreamItem) => {
    setHeroError(null);
    setSavingHeroItemId(item.id);
    const updatedTitle = heroTitles[item.id] !== undefined ? heroTitles[item.id] : item.title;
    const result = await workspaceStore.updateHeroStreamItem(item.id, { title: updatedTitle });
    setSavingHeroItemId(null);
    if (result.ok) {
      flashSaved(item.id);
    } else {
      setHeroError(result.error || 'Could not save this look.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* ==============================================================
          TAB 1: STUDIO OVERVIEW
          ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Studio Welcome & Live Metrics Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170204] via-[#240306] to-[#120103] border border-[#EFCEA5]/15 p-6 sm:p-10">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="text-[0.65rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-mono font-semibold block">
                Studio Command Center // Executive Suite
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif text-[#F8F4EF] tracking-tight">
                Curate, Direct &amp; Oversee Productions
              </h1>
              <p className="text-xs sm:text-sm text-[#EFCEA5]/70 leading-relaxed font-sans max-w-xl">
                Welcome to the unified Team Harvs administration console. Oversee candidate evaluations, schedule upcoming call sheets, review QA deliverables, and manage the live lookbook archive.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenNewLook}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish Editorial Look
                </button>
                <button
                  onClick={onOpenNewBrief}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-[#EFCEA5] border border-[#EFCEA5]/20 transition-all"
                >
                  <FolderKanban className="w-3.5 h-3.5" /> Draft Call Sheet
                </button>
              </div>
            </div>

            {/* Ambient Watermark Monogram */}
            <div className="absolute right-0 bottom-0 pointer-events-none translate-x-10 translate-y-10 opacity-10">
              <img src="/assets/th-monogram-cream.png" alt="" className="w-72 h-72 object-contain" />
            </div>
          </div>

          {/* Key Metric Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div 
              onClick={() => onNavigateTab && onNavigateTab('lookbook')}
              className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 transition-all hover:border-[#EFCEA5]/40 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#EFCEA5]/60 mb-2">
                <span className="text-[0.68rem] tracking-[0.2em] uppercase font-mono font-semibold">
                  Published Works
                </span>
                <Layers className="w-4 h-4 text-[#EFCEA5]/50 group-hover:text-[#EFCEA5] transition-colors" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-serif text-[#F8F4EF]">{lookbook.length}</span>
                <span className="text-xs text-[#EFCEA5]/70 flex items-center gap-1">
                  Live Archive <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab && onNavigateTab('briefs')}
              className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 transition-all hover:border-[#EFCEA5]/40 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#EFCEA5]/60 mb-2">
                <span className="text-[0.68rem] tracking-[0.2em] uppercase font-mono font-semibold">
                  Active Shoots
                </span>
                <FolderKanban className="w-4 h-4 text-[#EFCEA5]/50 group-hover:text-amber-300 transition-colors" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-serif text-[#F8F4EF]">{activeBriefs.length}</span>
                <span className="text-xs text-amber-300 flex items-center gap-1">
                  In Production <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab && onNavigateTab('roster')}
              className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 transition-all hover:border-[#EFCEA5]/40 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#EFCEA5]/60 mb-2">
                <span className="text-[0.68rem] tracking-[0.2em] uppercase font-mono font-semibold">
                  Open Call Queue
                </span>
                <Users className="w-4 h-4 text-[#EFCEA5]/50 group-hover:text-[#EFCEA5] transition-colors" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-serif text-[#F8F4EF]">{pendingApps.length}</span>
                <span className="text-xs text-[#EFCEA5]/70 flex items-center gap-1">
                  Candidates <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab && onNavigateTab('submissions')}
              className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 transition-all hover:border-[#EFCEA5]/40 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#EFCEA5]/60 mb-2">
                <span className="text-[0.68rem] tracking-[0.2em] uppercase font-mono font-semibold">
                  QA Deliverables
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#EFCEA5]/50 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-serif text-[#F8F4EF]">{submissions.length}</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  To Review <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Production Status & Candidate Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Production Shoots Highlight */}
            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFCEA5]/10">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#EFCEA5]" />
                  <h3 className="text-base font-serif text-[#F8F4EF]">Active Production Shoots</h3>
                </div>
                {onNavigateTab && (
                  <button 
                    onClick={() => onNavigateTab('briefs')}
                    className="text-xs text-[#EFCEA5] hover:underline"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>

              {activeBriefs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#EFCEA5]/60 space-y-2">
                  <p>No active productions in progress.</p>
                  <button
                    onClick={onOpenNewBrief}
                    className="text-xs text-[#EFCEA5] font-semibold underline"
                  >
                    + Draft First Brief
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBriefs.slice(0, 3).map((brief) => (
                    <div 
                      key={brief.id}
                      className="p-4 rounded-xl bg-black/40 border border-[#EFCEA5]/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif text-[#F8F4EF] font-medium">{brief.title}</span>
                        <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-semibold uppercase">
                          {brief.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[0.7rem] text-[#EFCEA5]/70">
                        <span>Loc: {brief.location}</span>
                        <span>Call: {brief.callTime}</span>
                        <span>Lead: {brief.lead}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Open Call Queue Highlight */}
            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFCEA5]/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#EFCEA5]" />
                  <h3 className="text-base font-serif text-[#F8F4EF]">Pending Candidate Dossiers</h3>
                </div>
                {onNavigateTab && (
                  <button 
                    onClick={() => onNavigateTab('roster')}
                    className="text-xs text-[#EFCEA5] hover:underline"
                  >
                    Manage Roster &rarr;
                  </button>
                )}
              </div>

              {pendingApps.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#EFCEA5]/60 space-y-1">
                  <p>Open call queue is clear. No pending talent applications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApps.slice(0, 3).map((app) => (
                    <div 
                      key={app.id}
                      className="p-4 rounded-xl bg-black/40 border border-[#EFCEA5]/10 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif text-[#F8F4EF] font-medium">{app.fullName}</span>
                          <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] uppercase font-semibold">
                            {app.discipline}
                          </span>
                        </div>
                        <span className="text-[0.68rem] text-[#EFCEA5]/70 block mt-0.5">{app.contact}</span>
                      </div>

                      <button
                        onClick={() => onSelectApplicant(app)}
                        className="px-3 py-1.5 rounded-lg bg-[#EFCEA5] text-[#1F0205] text-[0.65rem] font-bold uppercase tracking-wider hover:bg-white transition-all shrink-0"
                      >
                        Evaluate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Recent Member Deliverables QA Feed on Overview */}
          <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFCEA5]/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-serif text-[#F8F4EF]">Incoming Member Deliverables &amp; Work</h3>
              </div>
              {onNavigateTab && (
                <button 
                  onClick={() => onNavigateTab('submissions')}
                  className="text-xs text-[#EFCEA5] hover:underline flex items-center gap-1"
                >
                  Open Deliverables QA ({submissions.length}) &rarr;
                </button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#EFCEA5]/60 space-y-1">
                <p>No deliverables submitted by talent members yet.</p>
                <p className="text-[0.68rem] text-[#EFCEA5]/40">When talent members upload PDFs or link Drive folders against production call sheets, they will stream here live.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submissions.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-black/40 border border-[#EFCEA5]/10 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-serif text-[#F8F4EF] font-medium block">{sub.briefTitle}</span>
                        <span className="text-[0.68rem] text-[#EFCEA5]/70 block mt-0.5">
                          Submitted by <strong className="text-[#EFCEA5]">{sub.memberName}</strong> ({sub.role})
                        </span>
                      </div>
                      <span className={`text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0 ${
                        sub.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' :
                        sub.status === 'Revision Requested' ? 'bg-rose-950 text-rose-300 border border-rose-500/20' :
                        'bg-amber-950 text-amber-300 border border-amber-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    {sub.notes && (
                      <p className="text-xs text-[#F8F4EF]/80 italic bg-[#1C0306]/50 p-2.5 rounded-lg border border-[#EFCEA5]/5">
                        &ldquo;{sub.notes}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#EFCEA5]/10 text-xs">
                      <span className="text-[0.65rem] text-[#EFCEA5]/50">{sub.date}</span>
                      <div className="flex items-center gap-2">
                        {sub.pdfUrl && (
                          <a
                            href={sub.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded bg-[#EFCEA5]/10 text-[#EFCEA5] hover:bg-[#EFCEA5]/20 text-[0.68rem] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3 text-red-400" /> View PDF
                          </a>
                        )}
                        {sub.link && (
                          <a
                            href={sub.link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded bg-white/5 text-[#EFCEA5] hover:bg-white/10 text-[0.68rem] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> Drive / Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==============================================================
          TAB: USER MANAGEMENT (ALL REGISTERED USERS)
          ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 text-xs font-semibold uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5" /> Studio Permissions &amp; Identity
              </div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Registered User Directory</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Oversee all registered accounts, assign administrative roles, manage permissions, and audit member activity.
              </p>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-[#EFCEA5]/15 text-xs text-[#EFCEA5]/80">
                Total Users: <strong className="text-[#F8F4EF]">{users.length}</strong>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-[#EFCEA5]/15 text-xs text-[#EFCEA5]/80">
                Directors: <strong className="text-amber-300">{users.filter((u) => u.role === 'admin').length}</strong>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-[#EFCEA5]/15 text-xs text-[#EFCEA5]/80">
                Members: <strong className="text-emerald-300">{users.filter((u) => u.role === 'member').length}</strong>
              </div>
              <button
                id="refresh-users-btn"
                onClick={() => workspaceStore.syncFromSupabase()}
                disabled={workspaceStore.getSyncState().isSyncing}
                className="px-3.5 py-1.5 rounded-xl bg-[#EFCEA5] text-[#1F0205] text-xs font-semibold flex items-center gap-1.5 hover:bg-white transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${workspaceStore.getSyncState().isSyncing ? 'animate-spin' : ''}`} />
                {workspaceStore.getSyncState().isSyncing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
              <input
                type="text"
                placeholder="Search registered user by name, email, discipline, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/40 focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#EFCEA5] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Studio Directors (Admin)</option>
                <option value="member">Creative Talent (Member)</option>
              </select>

              {/* Status filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#EFCEA5] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Deactivated</option>
              </select>

              {/* Discipline filter */}
              <select
                value={userDisciplineFilter}
                onChange={(e) => setUserDisciplineFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#EFCEA5] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="all">All Disciplines</option>
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Table / List */}
          {filteredUsers.length === 0 && users.length === 0 && workspaceStore.getSyncState().isSyncing ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <Loader2 className="w-8 h-8 text-[#EFCEA5]/60 mx-auto animate-spin" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">Loading users…</h3>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <Users className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Registered Users Found</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                {userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all' || userDisciplineFilter !== 'all'
                  ? 'No registered profiles matched your current filters. Try resetting search parameters.'
                  : 'No users have registered on the platform yet. New user signups will appear here automatically.'}
              </p>
              {(userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all' || userDisciplineFilter !== 'all') && (
                <button
                  onClick={() => {
                    setUserSearch('');
                    setUserRoleFilter('all');
                    setUserStatusFilter('all');
                    setUserDisciplineFilter('all');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFCEA5] text-[#1F0205]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl overflow-hidden divide-y divide-[#EFCEA5]/10">
              {filteredUsers.map((usr) => (
                <div 
                  key={usr.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* User Initials Monogram Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                      usr.role === 'admin'
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                        : 'bg-white/5 border-[#EFCEA5]/20 text-[#EFCEA5]'
                    }`}>
                      {usr.avatar_url ? (
                        <img src={usr.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (usr.full_name || usr.email || 'TH').slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-serif text-[#F8F4EF] font-medium">
                          {usr.full_name || 'Anonymous Creative'}
                        </span>
                        
                        {/* Role Badge */}
                        <span className={`text-[0.62rem] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          usr.role === 'admin'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                            : 'bg-white/5 text-[#EFCEA5]/80 border border-[#EFCEA5]/20'
                        }`}>
                          {usr.role === 'admin' ? 'Studio Director' : 'Member'}
                        </span>

                        {/* Status Badge */}
                        <span className={`text-[0.62rem] px-2 py-0.5 rounded uppercase font-semibold ${
                          usr.status === 'inactive'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        }`}>
                          {usr.status || 'active'}
                        </span>

                        {usr.discipline && (
                          <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] uppercase font-semibold">
                            {usr.discipline}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#EFCEA5]/70 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#EFCEA5]/40" /> {usr.email}
                        </span>
                        {usr.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#EFCEA5]/40" /> {usr.phone}
                          </span>
                        )}
                        {usr.created_at && (
                          <span className="flex items-center gap-1 text-[0.68rem] text-[#EFCEA5]/50">
                            <Calendar className="w-3 h-3 text-[#EFCEA5]/30" /> Joined {new Date(usr.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {usr.bio && (
                        <p className="text-xs text-[#F8F4EF]/70 italic pt-1">{usr.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Role Toggle & Status Toggle */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                    {usr.portfolio_url && (
                      <a
                        href={usr.portfolio_url.startsWith('http') ? usr.portfolio_url : `https://${usr.portfolio_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#EFCEA5] flex items-center gap-1 transition-colors"
                      >
                        Portfolio <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Toggle Role Button */}
                    <button
                      onClick={() => handleToggleUserRole(usr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                        usr.role === 'admin'
                          ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-500/30'
                          : 'bg-white/5 hover:bg-[#EFCEA5] text-[#EFCEA5] hover:text-[#1F0205] border border-[#EFCEA5]/20'
                      }`}
                      title={usr.role === 'admin' ? 'Click to demote to Member' : 'Click to promote to Director'}
                    >
                      <Shield className="w-3 h-3" />
                      {usr.role === 'admin' ? 'Demote to Member' : 'Promote to Director'}
                    </button>

                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleToggleUserStatus(usr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                        usr.status === 'inactive'
                          ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30'
                          : 'bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30'
                      }`}
                      title={usr.status === 'inactive' ? 'Click to activate account' : 'Click to deactivate account'}
                    >
                      {usr.status === 'inactive' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {usr.status === 'inactive' ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB: HERO STREAM CMS (2-ROW KINETIC MARQUEE)
          ============================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <input
            ref={heroFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleHeroItemUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 text-xs font-semibold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" /> Landing Page Kinetics
              </div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Hero Kinetic Stream CMS</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Edit imagery, titles, categories, and look tags for the 2 kinetic infinite marquee streams on the public landing page.
              </p>
            </div>

            {/* Row Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-[#EFCEA5]/15">
              <button
                onClick={() => setActiveHeroRow(1)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeHeroRow === 1 ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                }`}
              >
                Row 1 (Top Stream)
              </button>
              <button
                onClick={() => setActiveHeroRow(2)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeHeroRow === 2 ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
                }`}
              >
                Row 2 (Bottom Stream)
              </button>
            </div>
          </div>

          {/* Row Information Banner */}
          <div className="p-4 rounded-2xl bg-black/30 border border-[#EFCEA5]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#EFCEA5]/80">
            <span>
              Currently viewing <strong>Row {activeHeroRow}</strong> ({activeHeroRow === 1 ? 'Scrolls Right-to-Left' : 'Scrolls Left-to-Right'}).
              Changes made here instantly update the public landing page marquee.
            </span>
            <button
              onClick={() => {
                const title = prompt('Enter Look Title:');
                if (!title) return;
                workspaceStore.addHeroStreamItem({
                  title,
                  category: 'High-Fashion Editorial',
                  tag: '',
                  image: '/assets/images/editorial_hero.jpg',
                  rowNumber: activeHeroRow,
                  orderIndex: heroStream.filter(i => i.rowNumber === activeHeroRow).length + 1,
                });
              }}
              className="px-4 py-2 rounded-xl bg-[#EFCEA5] text-[#1F0205] font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 hover:bg-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Look to Row {activeHeroRow}
            </button>
          </div>

          {(heroNeedsRepair || repairState) && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-100">
              <div className="space-y-1">
                <strong className="text-amber-300 text-sm block">
                  {repairState && !isRepairing ? 'Image repair' : 'Your hero images need a one-time fix'}
                </strong>
                <span className="block text-amber-100/80">
                  {repairState
                    ? repairState.message
                    : 'Earlier uploads were saved in a way that is too large for the website to load, so your changes weren’t showing. Click the button to fix them automatically — no re-uploading needed.'}
                </span>
              </div>
              {(!repairState || isRepairing || repairState.failed > 0) && (
                <button
                  id="repair-hero-images-btn"
                  onClick={handleRepairMedia}
                  disabled={isRepairing}
                  className="px-4 py-2.5 rounded-xl bg-amber-300 text-[#1F0205] font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 hover:bg-white transition-colors disabled:opacity-70"
                >
                  {isRepairing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {isRepairing ? 'Fixing…' : repairState?.failed ? 'Try again' : 'Fix my images'}
                </button>
              )}
            </div>
          )}

          {heroError && (
            <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-start justify-between gap-3 text-xs text-rose-200">
              <span><strong className="text-rose-300">Not saved.</strong> {heroError}</span>
              <button onClick={() => setHeroError(null)} className="text-rose-300 hover:text-white shrink-0" aria-label="Dismiss error">
                Dismiss
              </button>
            </div>
          )}

          {/* Cards for active hero row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroStream
              .filter((item) => item.rowNumber === activeHeroRow)
              .map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl overflow-hidden p-5 space-y-4 hover:border-[#EFCEA5]/35 transition-all"
                >
                  {/* Thumbnail with Device Upload Button */}
                  <div className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden group">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                      <button
                        onClick={() => {
                          setTargetHeroItemForUpload(item.id);
                          heroFileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#EFCEA5] text-[#1F0205] text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        {uploadingHeroItemId === item.id ? 'Uploading...' : 'Replace via File'}
                      </button>
                      <button
                        onClick={() => {
                          const newUrl = prompt('Enter Image URL:', item.image.startsWith('data:') ? '' : item.image);
                          if (newUrl && newUrl !== item.image) {
                            setHeroError(null);
                            workspaceStore.updateHeroStreamItem(item.id, { image: newUrl }).then((r) => {
                              if (r.ok) flashSaved(item.id);
                              else setHeroError(r.error || 'Could not save the new image URL.');
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-[0.68rem] font-semibold uppercase tracking-wider flex items-center gap-1 hover:bg-white/30"
                      >
                        <Link2 className="w-3 h-3" /> Change URL
                      </button>
                    </div>
                  </div>

                  {/* Editable Fields: ONLY Look Title */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[0.65rem] uppercase tracking-wider text-[#EFCEA5]/80 font-semibold block">
                          Look Title
                        </label>
                        {savedHeroItemId === item.id && (
                          <span className="text-[0.62rem] text-emerald-400 font-bold flex items-center gap-0.5 animate-pulse">
                            <Check className="w-3 h-3" /> Saved!
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={heroTitles[item.id] !== undefined ? heroTitles[item.id] : item.title}
                        onChange={(e) => setHeroTitles((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="e.g. Solitude in Crimson"
                        className="w-full bg-black/40 border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSaveHeroItem(item)}
                      disabled={savingHeroItemId === item.id}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        savedHeroItemId === item.id
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                          : 'bg-[#EFCEA5] text-[#1F0205] hover:bg-white shadow'
                      }`}
                    >
                      {savingHeroItemId === item.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                        </>
                      ) : savedHeroItemId === item.id ? (
                        <>
                          <Check className="w-3 h-3" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3" /> Save Look
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Remove look "${item.title}" from hero marquee?`)) {
                          workspaceStore.deleteHeroStreamItem(item.id);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      title="Remove from Hero"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB: LOOKBOOK CMS
          ============================================================== */}
      {activeTab === 'lookbook' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Published Lookbook Archive</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Manage high-fashion editorial works displayed across the public website gallery.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
                <input
                  type="text"
                  placeholder="Filter looks..."
                  value={lookbookSearch}
                  onChange={(e) => setLookbookSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/40 focus:outline-none focus:border-[#EFCEA5]"
                />
              </div>

              <button
                onClick={onOpenNewLook}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Publish Look
              </button>
            </div>
          </div>

          {filteredLookbook.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <Inbox className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Editorial Works Found</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                {lookbookSearch 
                  ? `No published looks matching query "${lookbookSearch}".`
                  : 'The archive is currently empty. Publish your first look to feature it in the public lookbook.'}
              </p>
              <button
                onClick={onOpenNewLook}
                className="mt-3 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205]"
              >
                + Publish First Look
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLookbook.map((work) => (
                <div 
                  key={work.id}
                  className="group bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl overflow-hidden transition-all hover:border-[#EFCEA5]/40"
                >
                  <div className="relative aspect-[4/3] bg-black overflow-hidden">
                    {isVideoMedia(work.videoUrl || work.image, work.mediaType) ? (
                      <>
                        <video 
                          src={work.videoUrl || work.image} 
                          poster={work.videoUrl ? work.image : undefined}
                          muted 
                          loop 
                          playsInline 
                          autoPlay 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1F0205]/85 border border-[#EFCEA5]/30 text-[#EFCEA5] text-[0.62rem] font-semibold tracking-wider backdrop-blur-md shadow-md z-10">
                          <Video className="w-3 h-3 text-[#EFCEA5]" />
                          <span>MOTION</span>
                        </div>
                      </>
                    ) : (
                      <img 
                        src={work.image} 
                        alt={work.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {work.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[0.62rem] font-bold uppercase tracking-wider shadow">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[0.65rem] text-[#EFCEA5]/70 uppercase tracking-widest font-semibold block">
                      {work.discipline}
                    </span>
                    <h3 className="text-base font-serif text-[#F8F4EF] font-medium">{work.title}</h3>
                    <p className="text-xs text-[#EFCEA5]/60">{work.category}</p>

                    <div className="pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPreviewLook(work)}
                          className="text-[#EFCEA5] hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </button>
                        <button
                          onClick={() => onEditLook?.(work)}
                          className="px-2.5 py-1 rounded-lg bg-[#EFCEA5]/15 text-[#EFCEA5] hover:bg-[#EFCEA5] hover:text-[#1F0205] flex items-center gap-1 font-semibold uppercase tracking-wider text-[0.62rem] transition-all"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete look "${work.title}" from archive?`)) {
                            workspaceStore.deleteLookbookWork(work.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 3: TALENT ROSTER & OPEN CALL CRM
          ============================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Talent Roster &amp; Candidate Pipeline</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Evaluate open call auditions and manage verified collective talent profiles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/40 focus:outline-none focus:border-[#EFCEA5]"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-[#170204] rounded-xl border border-[#EFCEA5]/15 text-xs">
                {(['all', 'Pending', 'Under Review', 'On Roster', 'Archived'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setApplicantFilter(filter)}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[0.62rem] font-semibold transition-colors ${
                      applicantFilter === filter 
                        ? 'bg-[#EFCEA5] text-[#1F0205]' 
                        : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <Users className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Applications in Queue</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                {applicantFilter === 'all'
                  ? 'Open call applications submitted through the public website will arrive here for evaluation.'
                  : `No candidates currently under status "${applicantFilter}".`}
              </p>
            </div>
          ) : (
            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl overflow-hidden divide-y divide-[#EFCEA5]/10">
              {filteredApplicants.map((app) => (
                <div 
                  key={app.id} 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-serif text-[#F8F4EF] font-medium">{app.fullName}</span>
                      <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] uppercase font-semibold">
                        {app.discipline}
                      </span>
                      <span className={`text-[0.62rem] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                        app.status === 'On Roster' ? 'bg-emerald-950 text-emerald-300' :
                        app.status === 'Under Review' ? 'bg-amber-950 text-amber-300' :
                        app.status === 'Archived' ? 'bg-neutral-800 text-neutral-400' :
                        'bg-rose-950 text-rose-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#EFCEA5]/70">{app.contact}</p>
                    {app.notes && (
                      <p className="text-xs text-[#F8F4EF]/70 italic pt-1">&ldquo;{app.notes}&rdquo;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {app.portfolio && (
                      <a
                        href={app.portfolio.startsWith('http') ? app.portfolio : `https://instagram.com/${app.portfolio.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#EFCEA5] flex items-center gap-1.5 transition-colors"
                      >
                        Portfolio <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onSelectApplicant(app)}
                      className="px-4 py-2 rounded-xl bg-[#EFCEA5] text-[#1F0205] text-xs font-semibold uppercase tracking-wider hover:bg-[#F8F4EF] transition-all"
                    >
                      Review Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 4: PRODUCTION BRIEFS
          ============================================================== */}
      {activeTab === 'briefs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Production Briefs &amp; Call Times</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Schedule shoot logistics, assign talent members, and specify call sheet requirements.
              </p>
            </div>
            <button
              onClick={onOpenNewBrief}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Draft Brief
            </button>
          </div>

          {briefs.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <FolderKanban className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Production Briefs</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                Schedule your first production brief with call times, location, and assigned collective talent.
              </p>
              <button
                onClick={onOpenNewBrief}
                className="mt-3 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205]"
              >
                + Draft First Brief
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {briefs.map((brief) => (
                <div 
                  key={brief.id} 
                  className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6 transition-all hover:border-[#EFCEA5]/30 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[0.65rem] text-[#EFCEA5]/70 uppercase tracking-widest font-semibold block mb-1">
                        {brief.discipline} &bull; Lead: {brief.lead}
                      </span>
                      <h3 className="text-xl font-serif text-[#F8F4EF]">{brief.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-amber-950 text-amber-300 font-semibold uppercase tracking-wider">
                        {brief.status}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete brief "${brief.title}"?`)) {
                            workspaceStore.deleteBrief(brief.id);
                          }
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Delete Brief"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#EFCEA5]/10 text-xs text-[#EFCEA5]/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#EFCEA5]" />
                      <span>{brief.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EFCEA5]" />
                      <span>{brief.callTime}</span>
                    </div>
                    {brief.budget && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#EFCEA5]" />
                        <span>Budget: {brief.budget}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#F8F4EF]/80 leading-relaxed">{brief.description}</p>

                  {/* Talent Engagement Tracker Button & Drawer */}
                  <div className="pt-3 border-t border-[#EFCEA5]/10">
                    <button
                      onClick={() => setExpandedBriefAuditId(expandedBriefAuditId === brief.id ? null : brief.id)}
                      className="w-full flex items-center justify-between text-xs text-[#EFCEA5] hover:text-[#F8F4EF] transition-colors py-1"
                    >
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Talent Engagement Audit (Who Clicked vs Who Submitted)
                      </span>
                      {expandedBriefAuditId === brief.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedBriefAuditId === brief.id && (
                      <div className="mt-3 p-4 rounded-xl bg-black/50 border border-[#EFCEA5]/15 space-y-4 animate-fade-in">
                        {(() => {
                          const interactions = workspaceStore.getBriefInteractions(brief.id);
                          const briefSubs = submissions.filter((s) => s.briefId === brief.id);
                          const clickedCount = interactions.length;
                          const submittedCount = interactions.filter((i) => i.submitted).length || briefSubs.length;
                          const clickedPendingCount = Math.max(0, clickedCount - submittedCount);

                          return (
                            <>
                              {/* Audit Counters */}
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2.5 rounded-lg bg-black/40 border border-[#EFCEA5]/10">
                                  <span className="text-[0.62rem] uppercase tracking-wider text-[#EFCEA5]/70 block">Inspected / Clicked</span>
                                  <strong className="text-base font-serif text-[#F8F4EF]">{clickedCount}</strong>
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/40 border border-[#EFCEA5]/10">
                                  <span className="text-[0.62rem] uppercase tracking-wider text-emerald-400 block">Submitted Work</span>
                                  <strong className="text-base font-serif text-emerald-400">{submittedCount}</strong>
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/40 border border-[#EFCEA5]/10">
                                  <span className="text-[0.62rem] uppercase tracking-wider text-amber-300 block">Clicked, Not Submitted</span>
                                  <strong className="text-base font-serif text-amber-300">{clickedPendingCount}</strong>
                                </div>
                              </div>

                              {interactions.length === 0 ? (
                                <p className="text-xs text-[#EFCEA5]/60 text-center py-3">
                                  No member interactions recorded for this brief yet. Once members view or open this call sheet in their dashboard, their activity will appear here.
                                </p>
                              ) : (
                                <div className="divide-y divide-[#EFCEA5]/10">
                                  {interactions.map((interaction) => (
                                    <div key={interaction.id} className="py-2.5 flex items-center justify-between text-xs">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-serif text-[#F8F4EF] font-medium">{interaction.userName}</span>
                                          <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] uppercase">
                                            {interaction.discipline || 'Talent'}
                                          </span>
                                        </div>
                                        <span className="text-[0.65rem] text-[#EFCEA5]/60 block mt-0.5">
                                          First opened: {new Date(interaction.viewedAt).toLocaleString()}
                                        </span>
                                      </div>

                                      <div>
                                        {interaction.submitted ? (
                                          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[0.65rem] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Submitted
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[0.65rem] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Clicked &bull; Pending Deliverable
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Delivered Work List for this Brief */}
                              {briefSubs.length > 0 && (
                                <div className="pt-3 border-t border-[#EFCEA5]/10 space-y-2">
                                  <span className="text-[0.65rem] uppercase tracking-wider text-emerald-400 font-semibold block">
                                    Delivered Work for this Call Sheet ({briefSubs.length}):
                                  </span>
                                  <div className="space-y-1.5">
                                    {briefSubs.map((s) => (
                                      <div key={s.id} className="p-2.5 rounded-lg bg-black/60 border border-emerald-500/20 flex items-center justify-between text-xs">
                                        <div>
                                          <span className="text-[#F8F4EF] font-medium block">{s.memberName} ({s.role})</span>
                                          {s.notes && <span className="text-[0.68rem] text-[#EFCEA5]/70 italic block">&ldquo;{s.notes}&rdquo;</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {s.pdfUrl && (
                                            <a href={s.pdfUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-[#EFCEA5]/10 text-[#EFCEA5] hover:bg-[#EFCEA5]/20 text-[0.68rem] flex items-center gap-1">
                                              <FileText className="w-3 h-3 text-red-400" /> PDF
                                            </a>
                                          )}
                                          {s.link && (
                                            <a href={s.link} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-white/5 text-[#EFCEA5] hover:bg-white/10 text-[0.68rem] flex items-center gap-1">
                                              <ExternalLink className="w-3 h-3" /> Drive
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 5: DELIVERABLES QA
          ============================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Quality Assurance &amp; Deliverables
              </div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Member Deliverables QA Review</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Review PDF assignments and cloud drive asset packages submitted by collective talent against assigned call sheets.
              </p>
            </div>

            {/* Submissions Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
                <input
                  type="text"
                  placeholder="Filter deliverables..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#F8F4EF] placeholder-[#EFCEA5]/40 focus:outline-none focus:border-[#EFCEA5]"
                />
              </div>

              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="all">All Statuses ({submissions.length})</option>
                <option value="Submitted">Submitted ({submissions.filter((s) => s.status === 'Submitted').length})</option>
                <option value="Approved">Approved ({submissions.filter((s) => s.status === 'Approved').length})</option>
                <option value="Revision Requested">Revision ({submissions.filter((s) => s.status === 'Revision Requested').length})</option>
              </select>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Deliverables in QA Queue</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                {submissionSearch || submissionStatusFilter !== 'all'
                  ? 'No member deliverables match the selected filter criteria.'
                  : 'When collective members submit PDF deliverables or cloud drive links against active production briefs, they will appear here for QA sign-off.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <div key={sub.id} className="p-6 bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl space-y-4 transition-all hover:border-[#EFCEA5]/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFCEA5]/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-serif text-[#F8F4EF] font-medium">{sub.briefTitle}</h3>
                        <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] uppercase font-semibold">
                          {sub.role}
                        </span>
                      </div>
                      <span className="text-xs text-[#EFCEA5]/70 block mt-1">
                        Submitted by: <strong className="text-[#F8F4EF]">{sub.memberName}</strong> &bull; {sub.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        sub.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' :
                        sub.status === 'Revision Requested' ? 'bg-rose-950 text-rose-300 border border-rose-500/20' :
                        'bg-amber-950 text-amber-300 border border-amber-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  {sub.notes && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-[#EFCEA5]/10">
                      <span className="text-[0.65rem] text-[#EFCEA5]/60 uppercase tracking-wider block mb-1">
                        Talent Submission Notes:
                      </span>
                      <p className="text-xs text-[#F8F4EF]/90 italic leading-relaxed">
                        &ldquo;{sub.notes}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Media & Asset Links */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {sub.pdfUrl && (
                        <a
                          href={sub.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-[#EFCEA5]/10 text-[#EFCEA5] hover:bg-[#EFCEA5]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#EFCEA5]/20"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-400" /> Open PDF Deliverable
                        </a>
                      )}
                      {sub.link && (
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 text-[#EFCEA5] hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#EFCEA5]/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Drive / Assets
                        </a>
                      )}
                    </div>

                    {/* QA Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {sub.status !== 'Approved' && (
                        <button
                          onClick={() => workspaceStore.updateSubmissionStatus(sub.id, 'Approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors border border-emerald-500/30"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                      )}
                      {sub.status !== 'Revision Requested' && (
                        <button
                          onClick={() => {
                            const feedback = prompt('Enter revision feedback for member:');
                            workspaceStore.updateSubmissionStatus(sub.id, 'Revision Requested', feedback || undefined);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors border border-amber-500/30"
                        >
                          <Clock className="w-3 h-3" /> Request Revision
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 6: STUDIO ASSETS
          ============================================================== */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15">
            <div>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">Digital Asset Library</h2>
              <p className="text-xs text-[#EFCEA5]/70 mt-1">
                Upload brand guides, LUT color profiles, and templates for talent members to download.
              </p>
            </div>
            <button
              onClick={onOpenNewAsset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Asset
            </button>
          </div>

          {assets.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <FileText className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">Asset Library is Empty</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                Upload brand assets, LUT color presets, and call sheet templates for collective talent to download.
              </p>
              <button
                onClick={onOpenNewAsset}
                className="mt-3 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205]"
              >
                + Upload First Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div key={asset.id} className="p-6 bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl space-y-3">
                  <span className="text-[0.65rem] text-[#EFCEA5]/70 uppercase tracking-widest font-semibold block">
                    {asset.category}
                  </span>
                  <h3 className="text-base font-serif text-[#F8F4EF]">{asset.title}</h3>
                  <div className="pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between text-xs text-[#EFCEA5]/70">
                    <span>{asset.fileType} &bull; {asset.fileSize}</span>
                    <a href={asset.downloadUrl} className="text-[#EFCEA5] hover:underline flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
