import * as React from "react"
import {
  ContainerAnimated,
  ContainerStagger,
} from "@/components/ui/animated-gallery"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye, ArrowUpRight } from "lucide-react"

import { DISCIPLINES, workspaceStore } from "@/lib/workspaceStore"

export interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  tag: string
  discipline?: string
}

interface SelectedWorksGalleryProps {
  activeFilter?: string
  onSelectFilter?: (filter: string) => void
  onOpenJoin?: () => void
  onSelectPreview?: (item: GalleryItem) => void
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'sw-01',
    title: 'Solitude in Crimson',
    category: 'Fashion & Tailoring',
    discipline: 'Stylists',
    tag: 'Look 01 // Autumn',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-02',
    title: 'Double-Breasted Cut',
    category: 'Avant-Garde Silhouette',
    discipline: 'Stylists',
    tag: 'Look 02 // Tailoring',
    image: '/assets/images/avant_garde_fashion.jpg',
  },
  {
    id: 'sw-03',
    title: 'Architectural Trench',
    category: 'High-Fashion Outerwear',
    discipline: 'Stylists',
    tag: 'Look 03 // Structure',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-04',
    title: 'Editorial Hero Look',
    category: 'Team Harvs Autumn Series',
    discipline: 'Photographers',
    tag: 'Look 04 // Direction',
    image: '/assets/images/editorial_hero.jpg',
  },
  {
    id: 'sw-05',
    title: 'Commercial Campaign Lookbook',
    category: 'Commercial Campaign Issue 01',
    discipline: 'Photographers',
    tag: 'Look 05 // Campaign',
    image: '/assets/images/campaign_lookbook.jpg',
  },
  {
    id: 'sw-06',
    title: 'Metropolitan Motion',
    category: 'Outdoor Dynamic Direction',
    discipline: 'Videographers / BTS Creators',
    tag: 'Look 06 // Dynamics',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-07',
    title: 'Model Development Dossier',
    category: 'Talent Dossier Scouting',
    discipline: 'Models',
    tag: 'Look 07 // Cast',
    image: '/assets/images/model_portrait.jpg',
  },
  {
    id: 'sw-08',
    title: '35mm Film Studio Set',
    category: 'BTS & Production Cinematography',
    discipline: 'Videographers / BTS Creators',
    tag: 'Look 08 // On Set',
    image: '/assets/images/creative_production_bts.jpg',
  },
  {
    id: 'sw-09',
    title: 'Monochromatic Form',
    category: 'Studio Architecture',
    discipline: 'Photographers',
    tag: 'Look 09 // Minimal',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-10',
    title: 'Fashion Motion Still',
    category: 'Movement Study',
    discipline: 'Videographers / BTS Creators',
    tag: 'Look 10 // Cinema Motion',
    image: '/assets/images/fashion_motion_still.jpg',
  },
  {
    id: 'sw-11',
    title: 'Pure Expression',
    category: 'Editorial Lighting',
    discipline: 'Makeup Artists',
    tag: 'Look 11 // Expression',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-12',
    title: 'Concrete Monolith',
    category: 'Urban Set Direction',
    discipline: 'Creative Assistants',
    tag: 'Look 12 // Spatial',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
  },
];

export const SelectedWorksGallery: React.FC<SelectedWorksGalleryProps> = ({
  activeFilter = 'All',
  onSelectFilter,
  onOpenJoin,
  onSelectPreview,
}) => {
  const [items, setItems] = React.useState<GalleryItem[]>(() => {
    const storeWorks = workspaceStore.getLookbook();
    return storeWorks.length > 0 ? storeWorks : GALLERY_ITEMS;
  });

  const [localFilter, setLocalFilter] = React.useState(activeFilter);

  React.useEffect(() => {
    if (activeFilter) {
      setLocalFilter(activeFilter);
    }
  }, [activeFilter]);

  React.useEffect(() => {
    const sync = () => {
      const storeWorks = workspaceStore.getLookbook();
      if (storeWorks.length > 0) {
        setItems(storeWorks);
      }
    };
    return workspaceStore.subscribe(sync);
  }, []);

  const handleFilterClick = (filter: string) => {
    setLocalFilter(filter);
    onSelectFilter?.(filter);
  };

  const filteredItems = items.filter((item) => {
    if (!localFilter || localFilter === 'All') return true;
    const matchDiscipline = (item.discipline || '').toLowerCase() === localFilter.toLowerCase();
    const matchCategory = (item.category || '').toLowerCase().includes(localFilter.toLowerCase());
    const matchTitle = (item.title || '').toLowerCase().includes(localFilter.toLowerCase());
    return matchDiscipline || matchCategory || matchTitle;
  });

  return (
    <section 
      className="relative overflow-hidden bg-[#EFE6D8] text-[#1F0205] pt-20 pb-20 border-t border-b border-[#580d16]/15" 
      id="portfolio"
    >
      {/* Header Text Block */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <ContainerStagger className="relative z-20 mx-auto max-w-4xl text-center">
          <ContainerAnimated>
            <span 
              className="inline-block text-[0.72rem] font-semibold tracking-[0.24em] uppercase text-[#680F1B] mb-3 px-3.5 py-1 rounded-full bg-[#680F1B]/10 border border-[#680F1B]/20"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              03 / Selected Works
            </span>
          </ContainerAnimated>

          <ContainerAnimated>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#1F0205] tracking-tight leading-[1.1] mb-4 uppercase"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Curated Productions &amp;{" "}
              <span 
                className="italic text-[#680F1B] normal-case"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                editorial direction
              </span>
            </h2>
          </ContainerAnimated>

          <ContainerAnimated className="max-w-2xl mx-auto mb-7">
            <p 
              className="text-sm sm:text-base text-[#382C2E]/85 leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              An intentional visual dossier of collaborative looks, commercial campaign lookbooks, and model development dossiers captured across fashion, tailoring, and cinematography.
            </p>
          </ContainerAnimated>

          {/* Interactive Discipline Filter Pills */}
          <ContainerAnimated className="flex items-center justify-center gap-2 flex-wrap mb-4">
            <button
              onClick={() => handleFilterClick('All')}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                localFilter === 'All'
                  ? 'bg-[#4E0A12] text-[#F8F4EF] scale-105 shadow-md'
                  : 'bg-white/60 hover:bg-white text-[#4E0A12] border border-[#4E0A12]/20'
              }`}
            >
              All Works
            </button>
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                onClick={() => handleFilterClick(d)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                  localFilter === d
                    ? 'bg-[#4E0A12] text-[#F8F4EF] scale-105 shadow-md'
                    : 'bg-white/60 hover:bg-white text-[#4E0A12] border border-[#4E0A12]/20'
                }`}
              >
                {d}
              </button>
            ))}
          </ContainerAnimated>
        </ContainerStagger>
      </div>

      {/* Atmospheric Soft Color Glow */}
      <div
        className="pointer-events-none absolute top-36 left-1/2 -translate-x-1/2 z-10 h-[500px] w-full max-w-5xl"
        style={{
          background: "radial-gradient(ellipse at center, rgba(104, 15, 27, 0.12) 0%, rgba(239, 206, 165, 0.28) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Continuous Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-20">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <h3 className="text-xl font-serif text-[#4E0A12]">No Editorial Works Under "{localFilter}"</h3>
            <p className="text-xs text-[#382C2E]/70 max-w-sm mx-auto">
              Our creative team is currently in production for this discipline. Check back soon or explore other disciplines.
            </p>
            <button
              onClick={() => handleFilterClick('All')}
              className="mt-2 px-5 py-2 rounded-full bg-[#4E0A12] text-[#F8F4EF] text-xs font-semibold uppercase tracking-wider"
            >
              View All Works
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectPreview?.(item)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#DFD3C2] border border-[#580d16]/20 shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#680F1B]/70"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F0205]/90 via-[#1F0205]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left">
                  <span 
                    className="inline-block text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#EFCEA5] mb-1.5"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {item.tag} {item.discipline ? `• ${item.discipline}` : ''}
                  </span>
                  <h3 
                    className="text-sm sm:text-base font-medium text-[#F8F4EF] uppercase tracking-wide truncate mb-0.5"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-[0.7rem] sm:text-[0.76rem] text-[#F8F4EF]/75 truncate"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {item.category}
                  </p>
                </div>
                <div className="absolute top-3 right-3 rounded-full bg-[#1F0205]/70 p-2 text-[#F8F4EF] opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Eye className="size-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
