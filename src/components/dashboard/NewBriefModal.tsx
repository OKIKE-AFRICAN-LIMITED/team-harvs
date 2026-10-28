import React, { useState, useEffect } from 'react';
import { X, FolderPlus, MapPin, Clock, Calendar, FileText, Send, Check } from 'lucide-react';
import { workspaceStore, ProjectBrief } from '@/lib/workspaceStore';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBrief?: ProjectBrief | null;
  initialMode?: 'brief' | 'assignment';
}

export const NewBriefModal: React.FC<NewBriefModalProps> = ({ 
  isOpen, 
  onClose, 
  editBrief,
  initialMode = 'brief'
}) => {
  const [modalMode, setModalMode] = useState<'brief' | 'assignment'>(initialMode);

  const [formData, setFormData] = useState({
    title: editBrief?.title || '',
    status: editBrief?.status || ('Planning' as ProjectBrief['status']),
    discipline: editBrief?.discipline || 'Fashion & Editorial',
    location: editBrief?.location || 'Studio Harvs, Uyo',
    callTime: editBrief?.callTime || '09:00 AM Call Time',
    lead: editBrief?.lead || 'Creative Director',
    assignedTalentInput: editBrief?.assignedTalent ? editBrief.assignedTalent.join(', ') : 'All Collective Talent',
    deliverablesInput: editBrief?.deliverables ? editBrief.deliverables.join('\n') : '1x Concept Moodboard\n3x Lookbook Outlines\nWritten Styling Treatment',
    description: editBrief?.description || '',
    assignmentText: editBrief?.assignmentText || editBrief?.description || '',
    budget: editBrief?.budget || 'Studio Harvs Production',
  });

  useEffect(() => {
    if (isOpen) {
      setModalMode(initialMode || (editBrief?.isAssignment ? 'assignment' : 'brief'));
      if (editBrief) {
        setFormData({
          title: editBrief.title,
          status: editBrief.status,
          discipline: editBrief.discipline,
          location: editBrief.location,
          callTime: editBrief.callTime,
          lead: editBrief.lead,
          assignedTalentInput: editBrief.assignedTalent?.join(', ') || '',
          deliverablesInput: editBrief.deliverables?.join('\n') || '',
          description: editBrief.description || '',
          assignmentText: editBrief.assignmentText || editBrief.description || '',
          budget: editBrief.budget || 'Studio Harvs Production',
        });
      }
    }
  }, [isOpen, initialMode, editBrief]);

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

    const isAssignment = modalMode === 'assignment';
    const mainText = isAssignment 
      ? (formData.assignmentText || formData.description)
      : (formData.description || formData.assignmentText);

    const briefPayload = {
      title: isAssignment && !formData.title.toLowerCase().includes('assignment')
        ? `[Assignment] ${formData.title.trim()}`
        : formData.title.trim(),
      status: formData.status,
      discipline: formData.discipline,
      location: isAssignment ? (formData.location || 'Remote Assignment / Online Studio') : formData.location,
      callTime: isAssignment ? (formData.callTime || 'Due within 48 Hours') : formData.callTime,
      lead: formData.lead,
      assignedTalent,
      deliverables,
      description: mainText,
      assignmentText: isAssignment ? mainText : undefined,
      isAssignment,
      budget: formData.budget,
    };

    if (editBrief) {
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
        <div className="flex items-center justify-between pb-4 border-b border-[#EFCEA5]/15 mb-5">
          <div>
            <span className="text-[0.68rem] tracking-[0.22em] text-[#EFCEA5] uppercase font-semibold">
              {modalMode === 'assignment' ? 'Talent Task & Brief Drop' : 'Production Workspace'}
            </span>
            <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">
              {modalMode === 'assignment' 
                ? (editBrief ? 'Update Text Assignment' : 'Drop Text Assignment for Talent')
                : (editBrief ? 'Update Production Brief' : 'Draft New Production Brief')}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#EFCEA5]/70 hover:text-[#EFCEA5] rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-[#EFCEA5]/15 mb-5 text-xs">
          <button
            type="button"
            onClick={() => setModalMode('brief')}
            className={`flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider text-[0.68rem] flex items-center justify-center gap-1.5 transition-colors ${
              modalMode === 'brief' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" /> Full Shoot Brief &amp; Call Sheet
          </button>
          <button
            type="button"
            onClick={() => setModalMode('assignment')}
            className={`flex-1 py-2 rounded-lg font-semibold uppercase tracking-wider text-[0.68rem] flex items-center justify-center gap-1.5 transition-colors ${
              modalMode === 'assignment' ? 'bg-[#EFCEA5] text-[#1F0205]' : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Drop Text Assignment / Task
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              {modalMode === 'assignment' ? 'Assignment Title' : 'Production Title'}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={modalMode === 'assignment' ? 'e.g. Moodboard Assignment // Grid\'s Merch Creative Direction' : 'e.g. Autumn Tailoring Series // Lookbook 02'}
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Target Talent Discipline
              </label>
              <select
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="All Collective">All Collective Talent</option>
                <option value="Fashion & Editorial">Fashion &amp; Editorial Tailoring</option>
                <option value="Commercial Campaign">Commercial Campaign</option>
                <option value="Model Development">Models / Model Development</option>
                <option value="Stylists">Stylists &amp; Wardrobe</option>
                <option value="BTS & Cinematography">Videographers / BTS Creators</option>
                <option value="Creative Collaborations">Creative Collaborations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              >
                <option value="Planning">Planning / Active</option>
                <option value="In Production">In Production</option>
                <option value="Review / Post">Review / Post-Production</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {modalMode === 'assignment' ? 'Location / Submission Venue' : 'Shoot Location'}
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={modalMode === 'assignment' ? 'e.g. Remote / Submit via Portal' : 'e.g. Studio Harvs & Uyo Plaza'}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {modalMode === 'assignment' ? 'Due Date / Deadline' : 'Call Time & Schedule'}
              </label>
              <input
                type="text"
                required
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                placeholder={modalMode === 'assignment' ? 'e.g. Friday, Nov 02 — 06:00 PM' : 'e.g. Oct 18, 2026 — 08:30 AM'}
                className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Assigned Talent Members (comma separated or "All")
            </label>
            <input
              type="text"
              value={formData.assignedTalentInput}
              onChange={(e) => setFormData({ ...formData, assignedTalentInput: e.target.value })}
              placeholder="e.g. All Collective, Aniekeme Bassey, Nsikan Umoh, David Okon"
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
            />
          </div>

          {/* Assignment Text or Creative Vision */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#EFCEA5]" />
                {modalMode === 'assignment' ? 'Assignment Instructions & Task Prompt' : 'Creative Vision & Shoot Brief'}
              </label>
              <span className="text-[0.68rem] text-[#EFCEA5]/60 font-mono">
                {modalMode === 'assignment' ? 'Talent will see this text in their dashboard' : 'Production details'}
              </span>
            </div>
            <textarea
              rows={5}
              required
              value={modalMode === 'assignment' ? formData.assignmentText : formData.description}
              onChange={(e) => {
                const val = e.target.value;
                if (modalMode === 'assignment') {
                  setFormData({ ...formData, assignmentText: val, description: val });
                } else {
                  setFormData({ ...formData, description: val, assignmentText: val });
                }
              }}
              placeholder={modalMode === 'assignment' 
                ? 'Drop the full assignment prompt here...\n\nExample:\n1. Review the Digital Asset Library for current moodboards.\n2. Develop 3 distinct silhouettes for Grid\'s merch.\n3. Submit your response directly as text, PDF or cloud link.' 
                : 'Lighting direction, color story, styling notes, moodboard context...'}
              className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg p-3 text-sm text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5] leading-relaxed font-sans"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#EFCEA5]/80 mb-1.5">
              Required Deliverables (one per line)
            </label>
            <textarea
              rows={2}
              value={formData.deliverablesInput}
              onChange={(e) => setFormData({ ...formData, deliverablesInput: e.target.value })}
              placeholder="1x Moodboard PDF or Text response&#10;3x Look proposals&#10;Styling notes"
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
              {modalMode === 'assignment' ? (
                <>
                  <Send className="w-4 h-4" />
                  {editBrief ? 'Update Assignment' : 'Drop Assignment for Talent'}
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  {editBrief ? 'Save Brief' : 'Issue Shoot Brief'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
