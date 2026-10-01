import React, { useState } from 'react';
import { X, FolderPlus, MapPin, Clock, Calendar } from 'lucide-react';
import { workspaceStore, ProjectBrief } from '@/lib/workspaceStore';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBrief?: ProjectBrief | null;
}

export const NewBriefModal: React.FC<NewBriefModalProps> = ({ isOpen, onClose, editBrief }) => {
  const [formData, setFormData] = useState({
    title: editBrief?.title || '',
    status: editBrief?.status || ('Planning' as ProjectBrief['status']),
    discipline: editBrief?.discipline || 'Fashion & Editorial',
    location: editBrief?.location || 'Studio Harvs, Uyo',
    callTime: editBrief?.callTime || '09:00 AM Call Time',
    lead: editBrief?.lead || 'Creative Director',
    assignedTalentInput: editBrief?.assignedTalent ? editBrief.assignedTalent.join(', ') : 'Aniekeme Bassey, Nsikan Umoh, David Okon',
    deliverablesInput: editBrief?.deliverables ? editBrief.deliverables.join('\n') : '8 Master High-Res Looks\n1x 60s 4K Cinema Reel\nBTS 35mm Photo Package',
    description: editBrief?.description || '',
    budget: editBrief?.budget || 'Studio Harvs Production',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTalent = formData.assignedTalentInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const deliverables = formData.deliverablesInput
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const briefPayload = {
      title: formData.title,
      status: formData.status,
      discipline: formData.discipline,
      location: formData.location,
      callTime: formData.callTime,
      lead: formData.lead,
      assignedTalent,
      deliverables,
      description: formData.description,
      budget: formData.budget,
    };

    if (editBrief) {
      // update
      workspaceStore.deleteBrief(editBrief.id);
      workspaceStore.addBrief(briefPayload);
    } else {
      workspaceStore.addBrief(briefPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8F4EF]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15 mb-6">
          <div>
            <span className="text-[0.68rem] tracking-[0.22em] text-[#EFCEA5] uppercase font-semibold">
              Production Workspace
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">
              {editBrief ? 'Update Production Brief' : 'Draft New Production Brief'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#EFCEA5]/70 hover:text-[#EFCEA5] rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Production Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Autumn Tailoring Series // Lookbook 02"
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Discipline
              </label>
              <select
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="Fashion & Editorial">Fashion & Editorial Tailoring</option>
                <option value="Commercial Campaign">Commercial Campaign</option>
                <option value="Model Development">Model Development</option>
                <option value="BTS & Cinematography">BTS & Cinematography</option>
                <option value="Creative Collaborations">Creative Collaborations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="Planning">Planning</option>
                <option value="In Production">In Production</option>
                <option value="Review / Post">Review / Post-Production</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Shoot Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Studio Harvs & Uyo Plaza"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Call Time &amp; Schedule
              </label>
              <input
                type="text"
                required
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                placeholder="e.g. Oct 18, 2026 — 08:30 AM"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Lead Director / Lead
              </label>
              <input
                type="text"
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                placeholder="e.g. Creative Director"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Production Tier / Budget
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. Studio Harvs Tier 1"
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Assigned Roster Talent (comma separated)
            </label>
            <input
              type="text"
              value={formData.assignedTalentInput}
              onChange={(e) => setFormData({ ...formData, assignedTalentInput: e.target.value })}
              placeholder="e.g. Aniekeme Bassey (Stylist), Imo Ekong (Model), David Okon (Video)"
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Required Deliverables (one per line)
            </label>
            <textarea
              rows={3}
              value={formData.deliverablesInput}
              onChange={(e) => setFormData({ ...formData, deliverablesInput: e.target.value })}
              placeholder="8 Master High-Res Looks&#10;1x 60s 4K Cinema Reel&#10;BTS 35mm Photo Package"
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Creative Vision &amp; Shoot Brief
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Lighting direction, color story, styling notes, moodboard context..."
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFCEA5]/15 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider border border-[#EFCEA5]/30 text-[#EFCEA5]/80 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-lg hover:scale-105"
            >
              <FolderPlus className="w-4 h-4" />
              {editBrief ? 'Save Brief' : 'Issue Brief'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
