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
  Phone
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
  workspaceStore 
} from '@/lib/workspaceStore';
import type { Profile } from '@/lib/supabase';
import { uploadLocalFile } from '@/lib/fileUpload';

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
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [targetHeroItemForUpload, setTargetHeroItemForUpload] = useState<string | null>(null);

  // PRODUCTION BRIEF ENGAGEMENT AUDIT STATE
  const [expandedBriefAuditId, setExpandedBriefAuditId] = useState<string | null>(null);

  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const rosterMembers = applications.filter((a) => a.status === 'On Roster');
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

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

  // Hero Item Device Upload Handler
  const handleHeroItemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetHeroItemForUpload) return;

    try {
      setUploadingHeroItemId(targetHeroItemForUpload);
      const res = await uploadLocalFile(file, 'lookbook');
      workspaceStore.updateHeroStreamItem(targetHeroItemForUpload, { image: res.url });
    } catch (err) {
      console.error('Hero item upload failed:', err);
    } finally {
      setUploadingHeroItemId(null);
      setTargetHeroItemForUpload(null);
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
          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <Users className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Registered Users Found</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                {userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all' || userDisciplineFilter !== 'all'
                  ? 'No registered profiles matched your current filters. Try resetting search parameters.'
                  : 'No users have registered on the platform yet. New user signups will appear here automatically.'}
              </p>
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
                  tag: `Look 0${heroStream.filter(i => i.rowNumber === activeHeroRow).length + 1} // Autumn`,
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
                          const newUrl = prompt('Enter Image URL:', item.image);
                          if (newUrl && newUrl !== item.image) {
                            workspaceStore.updateHeroStreamItem(item.id, { image: newUrl });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-[0.68rem] font-semibold uppercase tracking-wider flex items-center gap-1 hover:bg-white/30"
                      >
                        <Link2 className="w-3 h-3" /> Change URL
                      </button>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[0.65rem] uppercase tracking-wider text-[#EFCEA5]/70 block mb-1">
                        Look Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => workspaceStore.updateHeroStreamItem(item.id, { title: e.target.value })}
                        className="w-full bg-black/40 border border-[#EFCEA5]/20 rounded-lg px-3 py-1.5 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                      />
                    </div>

                    <div>
                      <label className="text-[0.65rem] uppercase tracking-wider text-[#EFCEA5]/70 block mb-1">
                        Category Subtitle
                      </label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => workspaceStore.updateHeroStreamItem(item.id, { category: e.target.value })}
                        className="w-full bg-black/40 border border-[#EFCEA5]/20 rounded-lg px-3 py-1.5 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                      />
                    </div>

                    <div>
                      <label className="text-[0.65rem] uppercase tracking-wider text-[#EFCEA5]/70 block mb-1">
                        Look Tag Badge
                      </label>
                      <input
                        type="text"
                        value={item.tag}
                        onChange={(e) => workspaceStore.updateHeroStreamItem(item.id, { tag: e.target.value })}
                        className="w-full bg-black/40 border border-[#EFCEA5]/20 rounded-lg px-3 py-1.5 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between">
                    <span className="text-[0.65rem] text-[#EFCEA5]/50">Row {item.rowNumber}</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove look "${item.title}" from hero marquee?`)) {
                          workspaceStore.deleteHeroStreamItem(item.id);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
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
                    <img 
                      src={work.image} 
                      alt={work.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {work.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[0.62rem] font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[0.65rem] text-[#EFCEA5]/70 uppercase tracking-widest font-semibold block">
                      {work.tag} &bull; {work.discipline}
                    </span>
                    <h3 className="text-base font-serif text-[#F8F4EF] font-medium">{work.title}</h3>
                    <p className="text-xs text-[#EFCEA5]/60">{work.category}</p>

                    <div className="pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onPreviewLook(work)}
                        className="text-[#EFCEA5] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
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
          <div className="pb-4 border-b border-[#EFCEA5]/15">
            <h2 className="text-2xl font-serif text-[#F8F4EF]">Member Deliverables QA Review</h2>
            <p className="text-xs text-[#EFCEA5]/70 mt-1">
              Review Google Drive &amp; Dropbox asset links submitted by talent against assigned call sheets.
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">No Deliverables in QA Queue</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                When members submit Google Drive or Dropbox links against project briefs, they will appear here for review and sign-off.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-6 bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif text-[#F8F4EF]">{sub.briefTitle}</h3>
                      <span className="text-xs text-[#EFCEA5]/70">Submitted by: {sub.memberName} ({sub.role})</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-semibold uppercase">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#F8F4EF]/80 italic">&ldquo;{sub.notes}&rdquo;</p>
                  <a
                    href={sub.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#EFCEA5] hover:underline"
                  >
                    Open Drive Folder <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
