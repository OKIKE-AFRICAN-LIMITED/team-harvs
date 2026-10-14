import * as React from "react"
import {
  ContainerAnimated,
  ContainerStagger,
} from "@/components/ui/animated-gallery"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye, ArrowUpRight, Video, Play } from "lucide-react"

import { DISCIPLINES, workspaceStore, DEFAULT_LOOKBOOK, isVideoMedia } from "@/lib/workspaceStore"

export interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  videoUrl?: string
  mediaType?: 'image' | 'video'
  tag?: string
  discipline?: string
}

interface SelectedWorksGalleryProps {
  items?: GalleryItem[]
  activeFilter?: string
  onSelectFilter?: (filter: string) => void
  onOpenJoin?: () => void
  onSelectPreview?: (item: GalleryItem) => void
}

export const SelectedWorksGallery: React.FC<SelectedWorksGalleryProps> = ({
  items: propItems,
  activeFilter = 'All',
  onSelectFilter,
  onOpenJoin,
  onSelectPreview,
}) => {
  const [items, setItems] = React.useState<GalleryItem[]>(() => {
    if (propItems && propItems.length > 0) return propItems;
    const storeWorks = workspaceStore.getLookbook();
    return storeWorks.length > 0 ? storeWorks : DEFAULT_LOOKBOOK;
  });

  const [localFilter, setLocalFilter] = React.useState(activeFilter);

  React.useEffect(() => {
    if (activeFilter) {
      setLocalFilter(activeFilter);
    }
  }, [activeFilter]);

  React.useEffect(() => {
    if (propItems && propItems.length > 0) {
      setItems(propItems);
    }
  }, [propItems]);

  React.useEffect(() => {
    const sync = () => {
      if (propItems && propItems.length > 0) {
        setItems(propItems);
      } else {
        const storeWorks = workspaceStore.getLookbook();
        if (storeWorks.length > 0) {
          setItems(storeWorks);
        }
      }
    };
    sync();
    return workspaceStore.subscribe(sync);
  }, [propItems]);

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
              Curated Productions{" "}
              <span 
                className="italic text-[#680F1B] normal-case"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
              </span>
            </h2>
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
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  {isVideoMedia(item.videoUrl || item.image, item.mediaType) ? (
                    <>
                      <video
                        src={item.videoUrl || item.image}
                        poster={item.videoUrl ? item.image : undefined}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1F0205]/85 border border-[#EFCEA5]/30 text-[#EFCEA5] text-[0.62rem] font-semibold tracking-wider backdrop-blur-md shadow-md z-10">
                        <Video className="w-3 h-3 text-[#EFCEA5]" />
                        <span>CINEMA MOTION</span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F0205]/90 via-[#1F0205]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left">
                  <span 
                    className="inline-block text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#EFCEA5] mb-1.5"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {item.discipline || 'EDITORIAL'}
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
