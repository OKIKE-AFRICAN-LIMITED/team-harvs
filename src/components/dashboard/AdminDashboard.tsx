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
  Filter
} from 'lucide-react';
import { 
  Application, 
  LookbookWork, 
  ProjectBrief, 
  CreativeAsset, 
  MemberSubmission,
  workspaceStore 
} from '@/lib/workspaceStore';

interface AdminDashboardProps {
  applications: Application[];
  lookbook: LookbookWork[];
  briefs: ProjectBrief[];
  assets: CreativeAsset[];
  submissions: MemberSubmission[];
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
  onOpenNewLook,
  onOpenNewBrief,
  onOpenNewAsset,
  onSelectApplicant,
  onPreviewLook,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lookbook' | 'roster' | 'briefs' | 'submissions' | 'assets'>('overview');
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'Pending' | 'Under Review' | 'On Roster' | 'Archived'>('all');

  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const rosterMembers = applications.filter((a) => a.status === 'On Roster');
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  const filteredApplicants = applications.filter((a) => 
    applicantFilter === 'all' ? true : a.status === applicantFilter
  );

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Executive Clean Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EFCEA5]/15">
        <div>
          <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold block mb-2">
            Studio Command Center // Director Privileges
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#F8F4EF] tracking-tight">
            Curate, Direct &amp; Manage
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#EFCEA5]/70 max-w-2xl leading-relaxed">
            Manage lookbook editions, review creative talent applications, schedule production call sheets, and review member deliverables.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewLook}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" /> Publish Look
          </button>
          <button
            onClick={onOpenNewBrief}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-[#EFCEA5] border border-[#EFCEA5]/20 transition-all"
          >
            <FolderKanban className="w-3.5 h-3.5" /> Draft Brief
          </button>
        </div>
      </div>

      {/* Spacious Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EFCEA5]/10 scrollbar-none">
        {[
          { id: 'overview', label: 'Studio Overview', count: undefined },
          { id: 'lookbook', label: 'Lookbook CMS', count: lookbook.length },
          { id: 'roster', label: 'Talent & Applications', count: pendingApps.length > 0 ? pendingApps.length : applications.length },
          { id: 'briefs', label: 'Production Briefs', count: briefs.length },
          { id: 'submissions', label: 'Deliverables QA', count: submissions.length },
          { id: 'assets', label: 'Studio Assets', count: assets.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#EFCEA5] text-[#1F0205] shadow-md font-bold'
                  : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5] hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-[#1F0205] text-[#EFCEA5]' : 'bg-white/10 text-[#EFCEA5]/80'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==============================================================
          TAB 1: OVERVIEW
          ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          
          {/* Key Metric Highlights (Live Counts, Clean Slate) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6">
              <span className="text-[0.68rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]/60 block mb-2">
                Published Works
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-serif text-[#F8F4EF]">{lookbook.length}</span>
                <span className="text-xs text-[#EFCEA5]/70">Live Archive</span>
              </div>
            </div>

            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6">
              <span className="text-[0.68rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]/60 block mb-2">
                Active Shoots
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-serif text-[#F8F4EF]">{activeBriefs.length}</span>
                <span className="text-xs text-amber-300">In Production</span>
              </div>
            </div>

            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6">
              <span className="text-[0.68rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]/60 block mb-2">
                Open Call Queue
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-serif text-[#F8F4EF]">{pendingApps.length}</span>
                <span className="text-xs text-[#EFCEA5]/70">Candidates</span>
              </div>
            </div>

            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-6">
              <span className="text-[0.68rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]/60 block mb-2">
                Roster Members
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-serif text-[#F8F4EF]">{rosterMembers.length}</span>
                <span className="text-xs text-emerald-400">Accepted Talent</span>
              </div>
            </div>
          </div>

          {/* Clean Slate Action Callout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EFCEA5]/10 text-[#EFCEA5]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#F8F4EF]">Lookbook Gallery</h3>
                  <p className="text-xs text-[#EFCEA5]/70">Publish new looks to show on the portfolio website.</p>
                </div>
              </div>
              <button
                onClick={onOpenNewLook}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#EFCEA5]/20 text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Editorial Look
              </button>
            </div>

            <div className="bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EFCEA5]/10 text-[#EFCEA5]">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#F8F4EF]">Production Briefs</h3>
                  <p className="text-xs text-[#EFCEA5]/70">Draft shoots, call sheets, locations, and assign talent.</p>
                </div>
              </div>
              <button
                onClick={onOpenNewBrief}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#EFCEA5]/20 text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Production Brief
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==============================================================
          TAB 2: LOOKBOOK CMS
          ============================================================== */}
      {activeTab === 'lookbook' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-[#F8F4EF]">Published Lookbook Archive</h2>
            <button
              onClick={onOpenNewLook}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Publish Look
            </button>
          </div>

          {lookbook.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
              <Inbox className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
              <h3 className="text-lg font-serif text-[#F8F4EF]">Lookbook Archive is Empty</h3>
              <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto">
                No editorial looks published yet. Publish your first look to show it on the public Selected Works gallery.
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
              {lookbook.map((work) => (
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
                          if (window.confirm('Delete this look from public archive?')) {
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
          TAB 3: TALENT & OPEN CALLS CRM
          ============================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif text-[#F8F4EF]">Talent Roster &amp; Open Call Queue</h2>
              <p className="text-xs text-[#EFCEA5]/60">Evaluate open call submissions and manage collective talent.</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-[#170204] rounded-xl border border-[#EFCEA5]/15 text-xs">
              {(['all', 'Pending', 'Under Review', 'On Roster', 'Archived'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setApplicantFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[0.65rem] font-semibold transition-colors ${
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

          {filteredApplicants.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-[#F8F4EF]">Production Briefs &amp; Call Times</h2>
            <button
              onClick={onOpenNewBrief}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Draft Brief
            </button>
          </div>

          {briefs.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
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
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-950 text-amber-300 font-semibold uppercase tracking-wider">
                      {brief.status}
                    </span>
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
          <h2 className="text-xl font-serif text-[#F8F4EF]">Member Submissions Review</h2>

          {submissions.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-[#F8F4EF]">Digital Asset Library</h2>
            <button
              onClick={onOpenNewAsset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Asset
            </button>
          </div>

          {assets.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
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
