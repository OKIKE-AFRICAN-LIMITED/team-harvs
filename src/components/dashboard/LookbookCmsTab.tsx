import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Eye, 
  ExternalLink 
} from 'lucide-react';
import { LookbookWork, workspaceStore } from '@/lib/workspaceStore';

interface LookbookCmsTabProps {
  lookbook: LookbookWork[];
  onOpenNewLook: () => void;
  onEditLook: (work: LookbookWork) => void;
  onPreviewLook: (work: LookbookWork) => void;
}

export const LookbookCmsTab: React.FC<LookbookCmsTabProps> = ({
  lookbook,
  onOpenNewLook,
  onEditLook,
  onPreviewLook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const disciplines = ['All', 'Fashion', 'Editorial', 'Commercial', 'Model Development', 'BTS & Motion'];

  const filteredWorks = lookbook.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.stylist && item.stylist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiscipline = selectedDiscipline === 'All' || item.discipline === selectedDiscipline;
    const matchesFeatured = !featuredOnly || item.featured;

    return matchesSearch && matchesDiscipline && matchesFeatured;
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the lookbook?`)) {
      workspaceStore.deleteLookbookWork(id);
    }
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    workspaceStore.updateLookbookWork(id, { featured: !current });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFCEA5]/15">
        <div>
          <span className="text-[0.68rem] tracking-[0.24em] text-[#EFCEA5] uppercase font-semibold">
            Visual Portfolio Curator
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F8F4EF] mt-1">
            Editorial &amp; Lookbook Manager
          </h1>
          <p className="text-xs text-[#EFCEA5]/70 mt-1">
            Curate the public gallery, hero kinetic marquee, and archived fashion series.
          </p>
        </div>

        <button
          onClick={onOpenNewLook}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Editorial Look
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C0306]/70 border border-[#EFCEA5]/15 rounded-xl p-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#EFCEA5]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search looks by title, tag, model, or stylist..."
            className="w-full bg-[#2A050A] border border-[#EFCEA5]/20 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F8F4EF] focus:outline-none focus:border-[#EFCEA5]"
          />
        </div>

        {/* Discipline Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {disciplines.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDiscipline(d)}
              className={`px-3 py-1.5 rounded-full text-[0.68rem] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                selectedDiscipline === d
                  ? 'bg-[#EFCEA5] text-[#1F0205]'
                  : 'bg-white/5 hover:bg-white/10 text-[#EFCEA5]/80 border border-[#EFCEA5]/20'
              }`}
            >
              {d}
            </button>
          ))}

          {/* Featured Toggle Button */}
          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`px-3 py-1.5 rounded-full text-[0.68rem] uppercase tracking-wider font-semibold flex items-center gap-1 whitespace-nowrap transition-colors border ${
              featuredOnly
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                : 'bg-white/5 text-[#EFCEA5]/70 border-[#EFCEA5]/20'
            }`}
          >
            <Star className={`w-3 h-3 ${featuredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            Featured
          </button>
        </div>

      </div>

      {/* Grid of Works */}
      {filteredWorks.length === 0 ? (
        <div className="text-center py-16 bg-[#1C0306]/50 rounded-2xl border border-[#EFCEA5]/10">
          <p className="text-sm font-serif text-[#EFCEA5]/70">No editorial looks found matching your criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDiscipline('All'); setFeaturedOnly(false); }}
            className="mt-3 text-xs text-[#EFCEA5] underline uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredWorks.map((work) => (
            <div
              key={work.id}
              className="group relative bg-[#1C0306] border border-[#EFCEA5]/15 hover:border-[#EFCEA5]/40 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Frame */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to placeholder if broken
                    (e.target as HTMLImageElement).src = '/assets/images/editorial_hero.jpg';
                  }}
                />

                {/* Overlays: Tag & Featured Star */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[#1F0205]/85 text-[#EFCEA5] backdrop-blur-md border border-[#EFCEA5]/30">
                    {work.tag}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFeatured(work.id, work.featured);
                    }}
                    className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-colors ${
                      work.featured 
                        ? 'bg-amber-400/90 text-[#1F0205]' 
                        : 'bg-[#1F0205]/70 text-[#EFCEA5]/60 hover:text-amber-300'
                    }`}
                    title={work.featured ? 'Featured on hero' : 'Mark as featured'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Quick Hover Action Bar */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => onPreviewLook(work)}
                    className="p-2.5 rounded-full bg-[#1F0205]/90 text-[#EFCEA5] hover:bg-[#EFCEA5] hover:text-[#1F0205] transition-all transform hover:scale-110 shadow-lg"
                    title="Inspect Look"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditLook(work)}
                    className="p-2.5 rounded-full bg-[#1F0205]/90 text-[#EFCEA5] hover:bg-[#EFCEA5] hover:text-[#1F0205] transition-all transform hover:scale-110 shadow-lg"
                    title="Edit Metadata"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(work.id, work.title)}
                    className="p-2.5 rounded-full bg-[#1F0205]/90 text-rose-400 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                    title="Delete Look"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Look Info */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-[#1C0306]">
                <div>
                  <span className="text-[0.62rem] text-[#EFCEA5]/60 uppercase tracking-widest font-semibold block mb-0.5">
                    {work.category}
                  </span>
                  <h3 className="text-base font-serif text-[#F8F4EF] font-medium leading-snug">
                    {work.title}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EFCEA5]/10 text-[0.7rem] text-[#EFCEA5]/70 space-y-0.5">
                  {work.stylist && <div>Stylist: <span className="text-[#F8F4EF]">{work.stylist}</span></div>}
                  {work.model && <div>Model: <span className="text-[#F8F4EF]">{work.model}</span></div>}
                  {work.photographer && <div>Camera: <span className="text-[#F8F4EF]">{work.photographer}</span></div>}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
