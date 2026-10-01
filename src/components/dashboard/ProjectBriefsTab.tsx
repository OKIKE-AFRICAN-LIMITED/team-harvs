import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Users, 
  FileText,
  Send,
  Calendar
} from 'lucide-react';
import { ProjectBrief, workspaceStore } from '@/lib/workspaceStore';

interface ProjectBriefsTabProps {
  briefs: ProjectBrief[];
  onOpenNewBrief: () => void;
  onEditBrief: (brief: ProjectBrief) => void;
  onOpenSubmitDeliverable: () => void;
}

export const ProjectBriefsTab: React.FC<ProjectBriefsTabProps> = ({
  briefs,
  onOpenNewBrief,
  onEditBrief,
  onOpenSubmitDeliverable,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectBrief['status']>('All');

  const filteredBriefs = briefs.filter((b) => {
    return statusFilter === 'All' || b.status === statusFilter;
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove brief "${title}"?`)) {
      workspaceStore.deleteBrief(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: ProjectBrief['status']) => {
    workspaceStore.updateBriefStatus(id, newStatus);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
        <div>
          <span className="text-[0.68rem] tracking-[0.24em] text-[#EFCEA5] uppercase font-semibold">
            Production &amp; Studio Sets
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F8F4EF] mt-1">
            Production Briefs &amp; Call Sheets
          </h1>
          <p className="text-xs text-[#EFCEA5]/70 mt-1">
            Schedule shoot dates, issue team call sheets, outline required deliverables, and assign roster talent.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={onOpenSubmitDeliverable}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-transparent text-[#EFCEA5] border border-[#EFCEA5]/30 hover:bg-[#EFCEA5]/10 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Submit Work
          </button>
          <button
            onClick={onOpenNewBrief}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Issue New Brief
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#EFCEA5]/10">
        {(['All', 'Planning', 'In Production', 'Review / Post', 'Completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
              statusFilter === status
                ? 'border-[#EFCEA5] text-[#EFCEA5]'
                : 'border-transparent text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
            }`}
          >
            {status} ({status === 'All' ? briefs.length : briefs.filter((b) => b.status === status).length})
          </button>
        ))}
      </div>

      {/* Briefs Cards */}
      {filteredBriefs.length === 0 ? (
        <div className="text-center py-16 bg-[#1C0306]/50 rounded-2xl border border-[#EFCEA5]/10">
          <p className="text-sm font-serif text-[#EFCEA5]/70">No production briefs found in this state.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBriefs.map((brief) => (
            <div
              key={brief.id}
              className="bg-[#1C0306] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/35 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Badges & Status Selector */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.68rem] px-2.5 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 font-semibold uppercase tracking-wider">
                      {brief.discipline}
                    </span>
                    <select
                      value={brief.status}
                      onChange={(e) => handleStatusChange(brief.id, e.target.value as any)}
                      className={`text-[0.65rem] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold border focus:outline-none cursor-pointer ${
                        brief.status === 'In Production' 
                          ? 'bg-amber-950 text-amber-300 border-amber-600/40' 
                          : brief.status === 'Planning'
                          ? 'bg-blue-950 text-blue-300 border-blue-600/40'
                          : brief.status === 'Review / Post'
                          ? 'bg-purple-950 text-purple-300 border-purple-600/40'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-600/40'
                      }`}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Production">In Production</option>
                      <option value="Review / Post">Review / Post</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <span className="text-[0.7rem] font-mono text-[#EFCEA5]/60">
                    {brief.budget || 'Studio Harvs'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif text-[#F8F4EF] font-medium leading-snug">
                  {brief.title}
                </h3>

                {/* Location & Call Time */}
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

                {/* Description */}
                {brief.description && (
                  <p className="text-xs text-[#F8F4EF]/80 leading-relaxed mt-3 bg-[#2A050A]/60 p-3 rounded-lg border border-[#EFCEA5]/10">
                    {brief.description}
                  </p>
                )}

                {/* Assigned Cast & Crew */}
                {brief.assignedTalent.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[0.68rem] text-[#EFCEA5]/70 uppercase tracking-widest block mb-1.5 font-semibold">
                      Assigned Roster Team:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {brief.assignedTalent.map((talent, idx) => (
                        <span
                          key={idx}
                          className="text-[0.7rem] px-2.5 py-0.5 rounded-full bg-white/5 border border-[#EFCEA5]/15 text-[#F8F4EF]"
                        >
                          {talent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deliverables Checklist */}
                {brief.deliverables.length > 0 && (
                  <div className="mt-3.5">
                    <span className="text-[0.68rem] text-[#EFCEA5]/70 uppercase tracking-widest block mb-1.5 font-semibold">
                      Expected Deliverables:
                    </span>
                    <ul className="space-y-1">
                      {brief.deliverables.map((del, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#F8F4EF]/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#EFCEA5]/15">
                <span className="text-[0.7rem] text-[#EFCEA5]/50">
                  Lead: {brief.lead}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditBrief(brief)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#EFCEA5] transition-colors"
                    title="Edit Brief"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(brief.id, brief.title)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-950/80 text-rose-400 transition-colors"
                    title="Delete Brief"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
