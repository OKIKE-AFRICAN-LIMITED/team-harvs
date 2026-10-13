import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { 
  Application, 
  LookbookWork, 
  ProjectBrief, 
  CreativeAsset, 
  MemberSubmission,
  workspaceStore 
} from '@/lib/workspaceStore';

export interface AdminDashboardProps {
  applications: Application[];
  lookbook: LookbookWork[];
  briefs: ProjectBrief[];
  assets: CreativeAsset[];
  submissions: MemberSubmission[];
  activeTab?: 'overview' | 'lookbook' | 'roster' | 'briefs' | 'submissions' | 'assets';
  onNavigateTab?: (tab: any) => void;
  onOpenNewLook: () => void;
  onOpenNewBrief: () => void;
  onOpenNewAsset: () => void;
  onSelectApplicant: (app: Application) => void;
  onPreviewLook: (work: LookbookWork) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
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
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'Pending' | 'Under Review' | 'On Roster' | 'Archived'>('all');
  const [lookbookSearch, setLookbookSearch] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');

  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const rosterMembers = applications.filter((a) => a.status === 'On Roster');
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  const filteredApplicants = applications.filter((a) => {
    const matchesFilter = applicantFilter === 'all' ? true : a.status === applicantFilter;
    const matchesSearch = rosterSearch === '' ? true : (
      a.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      a.discipline.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      a.contact.toLowerCase().includes(rosterSearch.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

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
          TAB 2: LOOKBOOK CMS
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
