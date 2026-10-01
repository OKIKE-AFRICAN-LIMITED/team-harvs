import React from 'react';
import { 
  Sparkles, 
  Users, 
  Layers, 
  FolderKanban, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  Application, 
  LookbookWork, 
  ProjectBrief, 
  CreativeAsset, 
  MemberSubmission,
  workspaceStore 
} from '@/lib/workspaceStore';

interface OverviewTabProps {
  applications: Application[];
  lookbook: LookbookWork[];
  briefs: ProjectBrief[];
  assets: CreativeAsset[];
  submissions: MemberSubmission[];
  onNavigateTab: (tab: string) => void;
  onOpenNewLook: () => void;
  onOpenNewBrief: () => void;
  onSelectApplication: (app: Application) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  applications,
  lookbook,
  briefs,
  assets,
  submissions,
  onNavigateTab,
  onOpenNewLook,
  onOpenNewBrief,
  onSelectApplication,
}) => {
  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const rosterMembers = applications.filter((a) => a.status === 'On Roster');
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Studio Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#320409] via-[#4E0A12] to-[#1F0205] border border-[#EFCEA5]/20 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFCEA5]/10 border border-[#EFCEA5]/20 text-[#EFCEA5] text-xs font-semibold tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Studio Harvs Command Center // Uyo
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#F8F4EF] leading-tight">
            Curate Intentional Creative Production.
          </h1>
          <p className="mt-2 text-sm text-[#EFCEA5]/80 leading-relaxed font-sans">
            Manage lookbook editions, coordinate upcoming editorial &amp; commercial productions, and review emerging talent across fashion, styling, cinematography, and model development.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onOpenNewLook}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" /> Publish Look
            </button>
            <button
              onClick={onOpenNewBrief}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#1F0205]/60 hover:bg-[#1F0205] text-[#EFCEA5] border border-[#EFCEA5]/30 transition-all"
            >
              <FolderKanban className="w-3.5 h-3.5" /> Draft Production Brief
            </button>
            <button
              onClick={() => onNavigateTab('roster')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-transparent text-[#EFCEA5]/80 hover:text-[#EFCEA5] transition-colors"
            >
              Review Open Calls ({pendingApps.length}) &rarr;
            </button>
          </div>
        </div>

        {/* Ambient watermark background */}
        <div className="absolute right-0 bottom-0 pointer-events-none translate-x-12 translate-y-12 opacity-15">
          <img src="/assets/th-monogram-cream.png" alt="" className="w-96 h-96 object-contain" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('briefs')}
          className="group cursor-pointer bg-[#1C0306]/80 hover:bg-[#250408] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 rounded-xl p-5 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-[#EFCEA5]/70 mb-2">
            <span className="uppercase tracking-widest text-[0.7rem]">Active Shoots</span>
            <div className="p-2 rounded-lg bg-[#EFCEA5]/10 text-[#EFCEA5]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#F8F4EF] font-bold">
            {activeBriefs.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{briefs.length} total productions registered</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('roster')}
          className="group cursor-pointer bg-[#1C0306]/80 hover:bg-[#250408] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 rounded-xl p-5 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-[#EFCEA5]/70 mb-2">
            <span className="uppercase tracking-widest text-[0.7rem]">Active Roster</span>
            <div className="p-2 rounded-lg bg-[#EFCEA5]/10 text-[#EFCEA5]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#F8F4EF] font-bold">
            {rosterMembers.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#EFCEA5]/80 mt-2">
            <span>Verified Models, Stylists &amp; Creators</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('roster')}
          className="group cursor-pointer bg-[#1C0306]/80 hover:bg-[#250408] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 rounded-xl p-5 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-[#EFCEA5]/70 mb-2">
            <span className="uppercase tracking-widest text-[0.7rem]">Pending Applications</span>
            <div className="p-2 rounded-lg bg-[#8C1625]/30 text-rose-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif text-[#F8F4EF] font-bold">{pendingApps.length}</span>
            {pendingApps.length > 0 && (
              <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider font-semibold">
                Action Needed
              </span>
            )}
          </div>
          <div className="text-xs text-[#EFCEA5]/80 mt-2">
            <span>From website &quot;Join Collective&quot; call</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateTab('lookbook')}
          className="group cursor-pointer bg-[#1C0306]/80 hover:bg-[#250408] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 rounded-xl p-5 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-[#EFCEA5]/70 mb-2">
            <span className="uppercase tracking-widest text-[0.7rem]">Lookbook Works</span>
            <div className="p-2 rounded-lg bg-[#EFCEA5]/10 text-[#EFCEA5]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#F8F4EF] font-bold">
            {lookbook.length}
          </div>
          <div className="text-xs text-amber-300 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{lookbook.filter((l) => l.featured).length} Featured on Hero &amp; Gallery</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Active Shoots & Pending Talent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Active Production Briefs */}
        <div className="lg:col-span-2 bg-[#1C0306]/80 border border-[#EFCEA5]/15 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/10 mb-4">
            <div>
              <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
                Schedule &amp; Production Track
              </span>
              <h2 className="text-xl font-serif text-[#F8F4EF] mt-0.5">Upcoming Productions &amp; Shoots</h2>
            </div>
            <button
              onClick={() => onNavigateTab('briefs')}
              className="text-xs uppercase tracking-wider text-[#EFCEA5] hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {briefs.slice(0, 3).map((brief) => (
              <div 
                key={brief.id} 
                className="bg-[#2A050A]/70 hover:bg-[#320409] border border-[#EFCEA5]/15 rounded-xl p-4.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20">
                        {brief.discipline}
                      </span>
                      <span className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                        brief.status === 'In Production' 
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/40' 
                          : brief.status === 'Planning'
                          ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      }`}>
                        {brief.status}
                      </span>
                    </div>
                    <h3 className="text-base font-serif text-[#F8F4EF] font-medium">{brief.title}</h3>
                  </div>

                  <span className="text-[0.7rem] text-[#EFCEA5]/60 font-mono shrink-0">
                    {brief.budget}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#EFCEA5]/10 text-xs text-[#EFCEA5]/80">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EFCEA5]/60" />
                    <span>{brief.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#EFCEA5]/60" />
                    <span>{brief.callTime}</span>
                  </div>
                </div>

                {brief.assignedTalent.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    <span className="text-[0.68rem] text-[#EFCEA5]/60 uppercase tracking-wider">Cast &amp; Crew:</span>
                    {brief.assignedTalent.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[0.68rem] bg-white/5 px-2 py-0.5 rounded text-[#F8F4EF]">
                        {t}
                      </span>
                    ))}
                    {brief.assignedTalent.length > 3 && (
                      <span className="text-[0.68rem] text-[#EFCEA5]/60">+{brief.assignedTalent.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 span): Recent Open Call Submissions */}
        <div className="bg-[#1C0306]/80 border border-[#EFCEA5]/15 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/10 mb-4">
              <div>
                <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
                  Talent Pipeline
                </span>
                <h2 className="text-xl font-serif text-[#F8F4EF] mt-0.5">Recent Applicants</h2>
              </div>
              <button
                onClick={() => onNavigateTab('roster')}
                className="text-xs uppercase tracking-wider text-[#EFCEA5] hover:underline"
              >
                All ({applications.length})
              </button>
            </div>

            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="group cursor-pointer bg-[#2A050A]/70 hover:bg-[#320409] border border-[#EFCEA5]/10 hover:border-[#EFCEA5]/30 rounded-xl p-3.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-[#F8F4EF] group-hover:text-[#EFCEA5] transition-colors">
                      {app.fullName}
                    </span>
                    <span className={`text-[0.62rem] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      app.status === 'On Roster'
                        ? 'bg-emerald-950 text-emerald-300'
                        : app.status === 'Pending'
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#EFCEA5]/70 mt-1.5">
                    <span>{app.discipline}</span>
                    <span className="text-[0.68rem] text-[#EFCEA5]/50">{app.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('roster')}
            className="w-full mt-5 py-2.5 rounded-xl border border-[#EFCEA5]/30 hover:border-[#EFCEA5] text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider text-center transition-all bg-[#2A050A]/50 hover:bg-[#2A050A]"
          >
            Review Talent Pipeline &rarr;
          </button>
        </div>

      </div>

      {/* Member Submissions & Feedback Feed */}
      <div className="bg-[#1C0306]/80 border border-[#EFCEA5]/15 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/10 mb-4">
          <div>
            <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
              Deliverables Stream
            </span>
            <h2 className="text-xl font-serif text-[#F8F4EF] mt-0.5">Member Submissions &amp; Work Links</h2>
          </div>
          <span className="text-xs text-[#EFCEA5]/70">
            {submissions.length} updates logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-[#2A050A]/60 border border-[#EFCEA5]/10 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#F8F4EF]">{sub.memberName}</h4>
                  <span className="text-xs text-[#EFCEA5]/70">{sub.role} &bull; {sub.briefTitle}</span>
                </div>
                <span className="text-[0.65rem] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider font-semibold">
                  {sub.status}
                </span>
              </div>
              <p className="text-xs text-[#F8F4EF]/80 italic">&ldquo;{sub.notes}&rdquo;</p>
              <div className="flex items-center justify-between pt-2 border-t border-[#EFCEA5]/10 text-xs">
                <span className="text-[0.7rem] text-[#EFCEA5]/50">{sub.date}</span>
                <a 
                  href={sub.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-[#EFCEA5] hover:text-white flex items-center gap-1 underline font-mono"
                >
                  Inspect Work Link <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
