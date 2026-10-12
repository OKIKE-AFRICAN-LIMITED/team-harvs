import React from 'react';
import { 
  Send, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Download, 
  ExternalLink,
  Sparkles,
  Camera,
  FolderKanban,
  Inbox
} from 'lucide-react';
import { ProjectBrief, CreativeAsset, MemberSubmission } from '@/lib/workspaceStore';
import type { Profile } from '@/lib/supabase';

interface MemberDashboardProps {
  profile: Profile | null;
  briefs: ProjectBrief[];
  assets: CreativeAsset[];
  submissions: MemberSubmission[];
  onOpenSubmitDeliverable: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  profile,
  briefs,
  assets,
  submissions,
  onOpenSubmitDeliverable,
}) => {
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      
      {/* Talent Dossier Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 p-8 sm:p-12">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFCEA5]/10 border border-[#EFCEA5]/20 text-[#EFCEA5] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Collective Talent Workspace
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#F8F4EF] tracking-tight">
            Welcome, {profile?.full_name || 'Creative Member'}.
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#EFCEA5]/80">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-[#EFCEA5]/20 font-semibold uppercase">
              {profile?.discipline || 'Creative Collaborator'}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold uppercase">
              Active Talent Roster
            </span>
            {profile?.portfolio_url && (
              <a 
                href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white underline flex items-center gap-1"
              >
                View Your Portfolio <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#EFCEA5]/70 leading-relaxed max-w-xl font-sans pt-2">
            Access your production schedules, verify shoot call times, download studio presets, and submit your project deliverables for editorial sign-off.
          </p>

          <div className="pt-4">
            <button
              onClick={onOpenSubmitDeliverable}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-xl hover:scale-105"
            >
              <Send className="w-3.5 h-3.5" /> Submit Deliverables / Drive Link
            </button>
          </div>
        </div>

        {/* Ambient Watermark Monogram */}
        <div className="absolute right-0 bottom-0 pointer-events-none translate-x-12 translate-y-12 opacity-10">
          <img src="/assets/th-monogram-cream.png" alt="" className="w-80 h-80 object-contain" />
        </div>
      </div>

      {/* ==============================================================
          SECTION 1: UPCOMING PRODUCTION CALL SHEETS & ASSIGNMENTS
          ============================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFCEA5]/15">
          <div>
            <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold block">
              Call Sheets &amp; Productions
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">Your Upcoming Shoots</h2>
          </div>
          <span className="text-xs text-[#EFCEA5]/60 font-mono">{activeBriefs.length} Active</span>
        </div>

        {activeBriefs.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
            <FolderKanban className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
            <h3 className="text-lg font-serif text-[#F8F4EF]">No Active Shoot Assignments</h3>
            <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto leading-relaxed">
              You are currently not cast in any active production briefs. Once the Studio Director assigns you to a shoot, your call times, locations, and requirements will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBriefs.map((brief) => (
              <div 
                key={brief.id} 
                className="bg-[#170204] border border-[#EFCEA5]/15 rounded-3xl p-7 space-y-5 transition-all hover:border-[#EFCEA5]/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[0.68rem] px-3 py-1 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 uppercase tracking-wider font-semibold">
                    {brief.discipline}
                  </span>
                  <span className="text-[0.65rem] px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-600/30 uppercase tracking-wider font-semibold">
                    {brief.status}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-[#F8F4EF] font-medium leading-snug">{brief.title}</h3>

                <div className="space-y-2 pt-2 border-t border-[#EFCEA5]/10 text-xs text-[#EFCEA5]/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#EFCEA5] shrink-0" />
                    <span>Location: <strong>{brief.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#EFCEA5] shrink-0" />
                    <span>Call Time: <strong>{brief.callTime}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-[#F8F4EF]/75 leading-relaxed pt-1">
                  {brief.description}
                </p>

                <div className="pt-4 border-t border-[#EFCEA5]/10 flex items-center justify-between">
                  <span className="text-[0.68rem] text-[#EFCEA5]/60">Lead: {brief.lead}</span>
                  <button
                    onClick={onOpenSubmitDeliverable}
                    className="text-xs text-[#EFCEA5] font-semibold hover:underline flex items-center gap-1"
                  >
                    Submit Deliverables &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==============================================================
          SECTION 2: DELIVERABLES SUBMISSION LOG
          ============================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFCEA5]/15">
          <div>
            <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold block">
              Deliverables &amp; Post
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">Your Submission Log</h2>
          </div>
          <button
            onClick={onOpenSubmitDeliverable}
            className="text-xs font-semibold uppercase tracking-wider text-[#EFCEA5] hover:underline"
          >
            + Submit New Work
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 space-y-3">
            <Inbox className="w-8 h-8 text-[#EFCEA5]/40 mx-auto" />
            <h3 className="text-lg font-serif text-[#F8F4EF]">No Deliverables Submitted</h3>
            <p className="text-xs text-[#EFCEA5]/60 max-w-md mx-auto leading-relaxed">
              When you submit your high-res stills, video cuts, moodboard links, or face charts, their review status will appear here.
            </p>
            <button
              onClick={onOpenSubmitDeliverable}
              className="mt-3 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205]"
            >
              + Submit Work Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div 
                key={sub.id} 
                className="p-6 bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-serif text-[#F8F4EF]">{sub.briefTitle}</h3>
                    <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 uppercase font-semibold">
                      {sub.status}
                    </span>
                  </div>
                  {sub.notes && (
                    <p className="text-xs text-[#EFCEA5]/70 italic">&ldquo;{sub.notes}&rdquo;</p>
                  )}
                </div>

                <a
                  href={sub.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#EFCEA5] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  View Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==============================================================
          SECTION 3: STUDIO RESOURCES & DOWNLOADS
          ============================================================== */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-[#EFCEA5]/15">
          <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold block">
            Studio Resources
          </span>
          <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">Downloadable Kits &amp; Presets</h2>
        </div>

        {assets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#170204] border border-[#EFCEA5]/15 text-xs text-[#EFCEA5]/60">
            No downloadable studio kits published yet by the studio director.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((ast) => (
              <div key={ast.id} className="p-6 bg-[#170204] border border-[#EFCEA5]/15 rounded-2xl space-y-3">
                <span className="text-[0.65rem] text-[#EFCEA5]/70 uppercase tracking-widest font-semibold block">
                  {ast.category}
                </span>
                <h3 className="text-base font-serif text-[#F8F4EF]">{ast.title}</h3>
                <div className="pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between text-xs text-[#EFCEA5]/70">
                  <span>{ast.fileType} &bull; {ast.fileSize}</span>
                  <a href={ast.downloadUrl} className="text-[#EFCEA5] hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
