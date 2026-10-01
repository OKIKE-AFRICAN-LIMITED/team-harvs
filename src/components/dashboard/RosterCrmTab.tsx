import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  ExternalLink, 
  UserCheck, 
  Clock, 
  Archive, 
  Trash2, 
  Plus, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Application, workspaceStore } from '@/lib/workspaceStore';

interface RosterCrmTabProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
}

export const RosterCrmTab: React.FC<RosterCrmTabProps> = ({
  applications,
  onSelectApplication,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Application['status']>('All');
  const [disciplineFilter, setDisciplineFilter] = useState('All');
  const [isAddTalentOpen, setIsAddTalentOpen] = useState(false);

  // New talent quick-add state
  const [newTalent, setNewTalent] = useState({
    fullName: '',
    contact: '',
    discipline: 'Model',
    portfolio: '',
    notes: '',
    experience: '',
  });

  const disciplines = ['All', 'Model', 'Stylist', 'MUA', 'Videographer', 'Photographer', 'Assistant'];

  const filtered = applications.filter((app) => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.portfolio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesDiscipline = disciplineFilter === 'All' || app.discipline === disciplineFilter;

    return matchesSearch && matchesStatus && matchesDiscipline;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    workspaceStore.addApplication({
      fullName: newTalent.fullName,
      contact: newTalent.contact,
      discipline: newTalent.discipline,
      portfolio: newTalent.portfolio || '@teamharvs',
      notes: newTalent.notes,
      experience: newTalent.experience,
    });
    setNewTalent({
      fullName: '',
      contact: '',
      discipline: 'Model',
      portfolio: '',
      notes: '',
      experience: '',
    });
    setIsAddTalentOpen(false);
  };

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const rosterCount = applications.filter((a) => a.status === 'On Roster').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
        <div>
          <span className="text-[0.68rem] tracking-[0.24em] text-[#EFCEA5] uppercase font-semibold">
            Collective Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F8F4EF] mt-1">
            Talent &amp; Applications CRM
          </h1>
          <p className="text-xs text-[#EFCEA5]/70 mt-1">
            Review submissions from the &quot;Join Collective&quot; open call, maintain verified roster members, and track casting notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddTalentOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Talent to CRM
        </button>
      </div>

      {/* Pipeline Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#EFCEA5]/10">
        {[
          { key: 'All', label: 'All Candidates', count: applications.length },
          { key: 'Pending', label: 'Pending Review', count: pendingCount, highlight: pendingCount > 0 },
          { key: 'Under Review', label: 'Under Review', count: applications.filter((a) => a.status === 'Under Review').length },
          { key: 'On Roster', label: 'Active Roster', count: rosterCount },
          { key: 'Archived', label: 'Archived', count: applications.filter((a) => a.status === 'Archived').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              statusFilter === tab.key
                ? 'border-[#EFCEA5] text-[#EFCEA5]'
                : 'border-transparent text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[0.62rem] px-2 py-0.5 rounded-full ${
              tab.highlight
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                : 'bg-white/10 text-[#F8F4EF]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C0306]/70 border border-[#EFCEA5]/15 rounded-xl p-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name, contact, phone, or portfolio..."
            className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[0.7rem] text-[#EFCEA5]/60 uppercase tracking-wider mr-1">Discipline:</span>
          {disciplines.map((d) => (
            <button
              key={d}
              onClick={() => setDisciplineFilter(d)}
              className={`px-3 py-1.5 rounded-full text-[0.68rem] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                disciplineFilter === d
                  ? 'bg-[#EFCEA5] text-[#1F0205]'
                  : 'bg-white/5 hover:bg-white/10 text-[#EFCEA5]/80 border border-[#EFCEA5]/20'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#1C0306]/50 rounded-2xl border border-[#EFCEA5]/10">
          <p className="text-sm font-serif text-[#EFCEA5]/70">No candidates found in this pipeline view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const rawPhone = app.contact.replace(/[^\d]/g, '');
            const waUrl = rawPhone.length >= 10 ? `https://wa.me/${rawPhone}` : null;

            return (
              <div
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="group cursor-pointer bg-[#1C0306] hover:bg-[#250408] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 rounded-xl p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Name, Discipline, Date */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-serif text-[#F8F4EF] font-medium group-hover:text-[#EFCEA5] transition-colors">
                      {app.fullName}
                    </h3>
                    <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-[#EFCEA5]/10 text-[#EFCEA5] border border-[#EFCEA5]/20 uppercase tracking-wider font-semibold">
                      {app.discipline}
                    </span>
                    <span className={`text-[0.62rem] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      app.status === 'On Roster'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : app.status === 'Under Review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : app.status === 'Pending'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#EFCEA5]/70">
                    Applied <span className="text-[#F8F4EF]">{app.date}</span> &bull; {app.contact}
                  </p>

                  {app.notes && (
                    <p className="text-xs text-[#F8F4EF]/80 italic line-clamp-1">
                      Notes: &ldquo;{app.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div 
                  className="flex items-center gap-2.5 shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Chat on WhatsApp"
                      className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-800/80 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <a
                    href={app.portfolio.startsWith('http') ? app.portfolio : `https://instagram.com/${app.portfolio.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Portfolio"
                    className="p-2 rounded-lg bg-white/5 border border-[#EFCEA5]/20 text-[#EFCEA5] hover:bg-[#EFCEA5] hover:text-[#1F0205] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => workspaceStore.updateApplicationStatus(app.id, e.target.value as any)}
                    className="bg-[#2A050A] border border-[#EFCEA5]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#EFCEA5] font-semibold uppercase tracking-wider focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="On Roster">On Roster</option>
                    <option value="Archived">Archived</option>
                  </select>

                  <button
                    onClick={() => onSelectApplication(app)}
                    className="px-3 py-1.5 rounded-lg bg-[#EFCEA5]/15 hover:bg-[#EFCEA5]/25 text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider border border-[#EFCEA5]/20 transition-colors"
                  >
                    Dossier &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Talent Modal */}
      {isAddTalentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#F8F4EF]">
            <h2 className="text-2xl font-serif text-[#F8F4EF] mb-4">Direct Talent Onboarding</h2>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newTalent.fullName}
                  onChange={(e) => setNewTalent({ ...newTalent, fullName: e.target.value })}
                  placeholder="e.g. Imo Ekong"
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                    Discipline
                  </label>
                  <select
                    value={newTalent.discipline}
                    onChange={(e) => setNewTalent({ ...newTalent, discipline: e.target.value })}
                    className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF]"
                  >
                    <option value="Model">Model</option>
                    <option value="Stylist">Stylist</option>
                    <option value="MUA">MUA</option>
                    <option value="Videographer">Videographer</option>
                    <option value="Photographer">Photographer</option>
                    <option value="Assistant">Assistant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                    Contact Phone / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={newTalent.contact}
                    onChange={(e) => setNewTalent({ ...newTalent, contact: e.target.value })}
                    placeholder="+234... or email"
                    className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                  Instagram Handle / Portfolio
                </label>
                <input
                  type="text"
                  value={newTalent.portfolio}
                  onChange={(e) => setNewTalent({ ...newTalent, portfolio: e.target.value })}
                  placeholder="@handle or portfolio URL"
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1">
                  Casting Notes / Measurements
                </label>
                <textarea
                  rows={2}
                  value={newTalent.notes}
                  onChange={(e) => setNewTalent({ ...newTalent, notes: e.target.value })}
                  placeholder="Measurements, style preferences, specialty..."
                  className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3 py-2 text-xs text-[#F8F4EF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTalentOpen(false)}
                  className="px-4 py-2 text-xs text-[#EFCEA5]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#EFCEA5] text-[#1F0205] text-xs font-semibold uppercase tracking-wider hover:bg-white"
                >
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
