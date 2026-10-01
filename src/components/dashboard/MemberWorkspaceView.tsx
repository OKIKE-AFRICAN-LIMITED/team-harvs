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
  Users
} from 'lucide-react';
import { ProjectBrief, CreativeAsset, MemberSubmission, Application } from '@/lib/workspaceStore';

interface MemberWorkspaceViewProps {
  briefs: ProjectBrief[];
  assets: CreativeAsset[];
  submissions: MemberSubmission[];
  roster: Application[];
  onOpenSubmitDeliverable: () => void;
}

export const MemberWorkspaceView: React.FC<MemberWorkspaceViewProps> = ({
  briefs,
  assets,
  submissions,
  roster,
  onOpenSubmitDeliverable,
}) => {
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Member Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4E0A12] via-[#320409] to-[#1F0205] border border-[#EFCEA5]/30 p-6 sm:p-8">
        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFCEA5]/10 border border-[#EFCEA5]/20 text-[#EFCEA5] text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Team Harvs Collective Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#F8F4EF]">
            Member Creative Workspace
          </h1>
          <p className="mt-2 text-sm text-[#EFCEA5]/80 leading-relaxed font-sans">
            Access upcoming shoot call sheets, download studio LUT presets and brand guides, collaborate with fellow talent, and submit your project deliverables.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenSubmitDeliverable}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-lg hover:scale-105"
            >
              <Send className="w-3.5 h-3.5" /> Submit Work / Drive Link
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 pointer-events-none translate-x-10 translate-y-10 opacity-10">
          <img src="/assets/th-monogram-cream.png" alt="" className="w-80 h-80 object-contain" />
        </div>
      </div>

      {/* Grid: Upcoming Shoots & Call Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Active Production Briefs for Members */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFCEA5]/15">
            <div>
              <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
                Your Assignments
              </span>
              <h2 className="text-xl font-serif text-[#F8F4EF] mt-0.5">Upcoming Productions &amp; Call Times</h2>
            </div>
            <span className="text-xs text-[#EFCEA5]/60 font-mono">{activeBriefs.length} Active</span>
          </div>

          <div className="space-y-4">
            {activeBriefs.map((brief) => (
              <div 
                key={brief.id} 
                className="bg-[#1C0306] border border-[#EFCEA5]/20 rounded-2xl p-6 transition-all hover:border-[#EFCEA5]/40"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[0.68rem] px-2.5 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 uppercase tracking-wider font-semibold">
                    {brief.discipline}
                  </span>
                  <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40 uppercase tracking-wider font-semibold">
                    {brief.status}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-[#F8F4EF] font-medium">{brief.title}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#EFCEA5]/10 text-xs text-[#EFCEA5]/80">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EFCEA5]" />
                    <span>Location: <strong>{brief.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#EFCEA5]" />
                    <span>Call Time: <strong>{brief.callTime}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-[#F8F4EF]/80 mt-3 leading-relaxed">
                  {brief.description}
                </p>

                {/* Deliverables */}
                <div className="mt-4 pt-3 border-t border-[#EFCEA5]/10">
                  <span className="text-[0.68rem] text-[#EFCEA5]/70 uppercase tracking-widest block mb-2 font-semibold">
                    Required Deliverables:
                  </span>
                  <ul className="space-y-1.5">
                    {brief.deliverables.map((del, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#F8F4EF]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFCEA5]/10 flex items-center justify-between">
                  <span className="text-[0.7rem] text-[#EFCEA5]/60">
                    Lead: {brief.lead}
                  </span>
                  <button
                    onClick={onOpenSubmitDeliverable}
                    className="flex items-center gap-1 text-xs text-[#EFCEA5] font-semibold hover:underline"
                  >
                    <Send className="w-3 h-3" /> Submit Files for this Shoot &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Member Submissions Status & Quick Resources */}
        <div className="space-y-6">
          
          {/* Submissions Track */}
          <div className="bg-[#1C0306] border border-[#EFCEA5]/20 rounded-2xl p-5">
            <div className="pb-3 border-b border-[#EFCEA5]/10 mb-3">
              <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
                Submission Log
              </span>
              <h3 className="text-lg font-serif text-[#F8F4EF] mt-0.5">Your Deliverables</h3>
            </div>

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-[#2A050A]/70 border border-[#EFCEA5]/10 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#F8F4EF]">{sub.briefTitle}</span>
                    <span className="text-[0.62rem] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 uppercase tracking-wider font-semibold">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-[#EFCEA5]/70 italic">&ldquo;{sub.notes}&rdquo;</p>
                  <a
                    href={sub.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[0.7rem] text-[#EFCEA5] hover:text-white flex items-center gap-1 underline pt-1"
                  >
                    View Drive Link <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenSubmitDeliverable}
              className="w-full mt-4 py-2 rounded-xl bg-[#EFCEA5]/15 hover:bg-[#EFCEA5]/25 text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              + Submit New Work
            </button>
          </div>

          {/* Quick Studio Assets */}
          <div className="bg-[#1C0306] border border-[#EFCEA5]/20 rounded-2xl p-5">
            <div className="pb-3 border-b border-[#EFCEA5]/10 mb-3">
              <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
                Studio Kits
              </span>
              <h3 className="text-lg font-serif text-[#F8F4EF] mt-0.5">Quick Resources</h3>
            </div>

            <div className="space-y-2.5">
              {assets.slice(0, 3).map((ast) => (
                <div key={ast.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#2A050A]/60 border border-[#EFCEA5]/10">
                  <div className="truncate mr-2">
                    <p className="text-[#F8F4EF] truncate font-medium">{ast.title}</p>
                    <span className="text-[0.68rem] text-[#EFCEA5]/60">{ast.fileType} &bull; {ast.fileSize}</span>
                  </div>
                  <a
                    href={ast.downloadUrl}
                    className="p-1.5 rounded bg-white/5 hover:bg-[#EFCEA5] text-[#EFCEA5] hover:text-[#1F0205] transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Roster Directory Preview */}
          <div className="bg-[#1C0306] border border-[#EFCEA5]/20 rounded-2xl p-5">
            <div className="pb-3 border-b border-[#EFCEA5]/10 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[0.68rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold">
                  Network
                </span>
                <h3 className="text-lg font-serif text-[#F8F4EF] mt-0.5">Collective Roster</h3>
              </div>
              <Users className="w-4 h-4 text-[#EFCEA5]/60" />
            </div>

            <div className="space-y-2">
              {roster.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#2A050A]/40">
                  <div>
                    <span className="text-[#F8F4EF] font-medium block">{member.fullName}</span>
                    <span className="text-[0.68rem] text-[#EFCEA5]/60">{member.discipline}</span>
                  </div>
                  <a
                    href={member.portfolio.startsWith('http') ? member.portfolio : `https://instagram.com/${member.portfolio.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[0.68rem] text-[#EFCEA5] hover:underline flex items-center gap-0.5"
                  >
                    Profile <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
