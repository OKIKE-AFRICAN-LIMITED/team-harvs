import * as React from "react"
import {
  ContainerAnimated,
  ContainerStagger,
} from "@/components/ui/animated-gallery"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye, ArrowUpRight } from "lucide-react"

import { workspaceStore } from "@/lib/workspaceStore"

export interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  tag: string
}

interface SelectedWorksGalleryProps {
  onOpenJoin?: () => void
  onSelectPreview?: (item: GalleryItem) => void
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'sw-01',
    title: 'Solitude in Crimson',
    category: 'Fashion & Tailoring',
    tag: 'Look 01 // Autumn',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-02',
    title: 'Double-Breasted Cut',
    category: 'Avant-Garde Silhouette',
    tag: 'Look 02 // Tailoring',
    image: '/assets/images/avant_garde_fashion.jpg',
  },
  {
    id: 'sw-03',
    title: 'Architectural Trench',
    category: 'High-Fashion Outerwear',
    tag: 'Look 03 // Structure',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-04',
    title: 'Editorial Hero Look',
    category: 'Team Harvs Autumn Series',
    tag: 'Look 04 // Direction',
    image: '/assets/images/editorial_hero.jpg',
  },
  {
    id: 'sw-05',
    title: 'Commercial Campaign Lookbook',
    category: 'Commercial Campaign Issue 01',
    tag: 'Look 05 // Campaign',
    image: '/assets/images/campaign_lookbook.jpg',
  },
  {
    id: 'sw-06',
    title: 'Metropolitan Motion',
    category: 'Outdoor Dynamic Direction',
    tag: 'Look 06 // Dynamics',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-07',
    title: 'Model Development Dossier',
    category: 'Talent Dossier Scouting',
    tag: 'Look 07 // Cast',
    image: '/assets/images/model_portrait.jpg',
  },
  {
    id: 'sw-08',
    title: '35mm Film Studio Set',
    category: 'BTS & Production Cinematography',
    tag: 'Look 08 // On Set',
    image: '/assets/images/creative_production_bts.jpg',
  },
  {
    id: 'sw-09',
    title: 'Monochromatic Form',
    category: 'Studio Architecture',
    tag: 'Look 09 // Minimal',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-10',
    title: 'Fashion Motion Still',
    category: 'Movement Study',
    tag: 'Look 10 // Cinema Motion',
    image: '/assets/images/fashion_motion_still.jpg',
  },
  {
    id: 'sw-11',
    title: 'Pure Expression',
    category: 'Editorial Lighting',
    tag: 'Look 11 // Expression',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-12',
    title: 'Concrete Monolith',
    category: 'Urban Set Direction',
    tag: 'Look 12 // Spatial',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-13',
    title: 'Silk & Velvet Drapery',
    category: 'Textile Movement',
    tag: 'Look 13 // Drapery',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-14',
    title: 'Structured Denim & Cotton',
    category: 'Commercial Editorial',
    tag: 'Look 14 // Lookbook',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-15',
    title: 'Daylight Cinema Study',
    category: 'Visual Composition',
    tag: 'Look 15 // Series',
    image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-16',
    title: 'Gaffer & Cinema Lighting',
    category: 'Set Production BTS',
    tag: 'Look 16 // BTS',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-17',
    title: 'Modernist Silhouette',
    category: 'High-Fashion Line',
    tag: 'Look 17 // Silhouette',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-18',
    title: 'Runway Elevation',
    category: 'Directional Stride',
    tag: 'Look 18 // Runway',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-19',
    title: 'Editorial Gaze',
    category: 'Model Development',
    tag: 'Look 19 // Roster',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-20',
    title: 'Studio Lighting Study',
    category: 'Tonal Composition',
    tag: 'Look 20 // Lighting',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sw-21',
    title: 'Tailored Profile',
    category: 'Lookbook Feature',
    tag: 'Look 21 // Profile',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
  },
]

export const SelectedWorksGallery: React.FC<SelectedWorksGalleryProps> = ({
  onOpenJoin,
  onSelectPreview,
}) => {
  const [items, setItems] = React.useState<GalleryItem[]>(() => {
    const storeWorks = workspaceStore.getLookbook();
    return storeWorks.length > 0 ? storeWorks : GALLERY_ITEMS;
  });

  React.useEffect(() => {
    const sync = () => {
      const storeWorks = workspaceStore.getLookbook();
      if (storeWorks.length > 0) {
        setItems(storeWorks);
      }
    };
    return workspaceStore.subscribe(sync);
  }, []);

  return (
    <section 
      className="relative overflow-hidden bg-[#EFE6D8] text-[#1F0205] pt-20 pb-20 border-t border-b border-[#580d16]/15" 
      id="work"
    >
      {/* Header Text Block */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
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

          <ContainerAnimated className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={onOpenJoin}
              className="gap-2 bg-[#4E0A12] text-[#F8F4EF] hover:bg-[#680F1B] rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-md hover:shadow-lg hover:scale-105"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Apply to Join Collective <Sparkles className="size-3.5" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-1 border-[#4E0A12]/30 text-[#4E0A12] hover:bg-[#4E0A12]/10 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <a href="#what-we-do">
                Explore Disciplines <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
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

      {/* Continuous Gallery Grid - Zero Empty Space, Full Natural Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {items.map((item) => (
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
                  {item.tag}
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
      </div>
    </section>
  )
}
