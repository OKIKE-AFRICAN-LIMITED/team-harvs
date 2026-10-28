import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  FileText, 
  Send, 
  Download, 
  X, 
  LogOut, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  ArrowLeft
} from 'lucide-react';
import type { Profile } from '@/lib/supabase';

interface SidebarCounts {
  users?: number;
  lookbook?: number;
  roster?: number;
  pendingRoster?: number;
  briefs?: number;
  submissions?: number;
  assets?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  countBadgeColor?: string;
  isPendingBadge?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  role: 'admin' | 'member';
  profile: Profile | null;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  counts: SidebarCounts;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onBackToSite: () => void;
  onSignOut: () => void;
  onOpenNewLook?: () => void;
  onOpenNewBrief?: () => void;
  onOpenNewAsset?: () => void;
  onOpenSubmitDeliverable?: (briefId?: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  role,
  profile,
  activeTab,
  onSelectTab,
  counts,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onBackToSite,
  onSignOut,
  onOpenNewLook,
  onOpenNewBrief,
  onOpenNewAsset,
  onOpenSubmitDeliverable,
}) => {
  // Navigation Definitions
  const adminNavGroups: NavGroup[] = [
    {
      groupTitle: 'STUDIO DIRECTORY',
      items: [
        {
          id: 'overview',
          label: 'Studio Overview',
          icon: LayoutDashboard,
          count: undefined,
        },
        {
          id: 'users',
          label: 'User Management',
          icon: Shield,
          count: counts.users,
        },
        {
          id: 'hero',
          label: 'Hero Stream CMS',
          icon: Layers,
          count: undefined,
        },
        {
          id: 'lookbook',
          label: 'Lookbook CMS',
          icon: Sparkles,
          count: counts.lookbook,
        },
        {
          id: 'roster',
          label: 'Talent & Applications',
          icon: Users,
          count: counts.pendingRoster && counts.pendingRoster > 0 ? counts.pendingRoster : counts.roster,
          countBadgeColor: counts.pendingRoster && counts.pendingRoster > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : undefined,
          isPendingBadge: Boolean(counts.pendingRoster && counts.pendingRoster > 0),
        },
      ]
    },
    {
      groupTitle: 'PRODUCTION & QA',
      items: [
        {
          id: 'briefs',
          label: 'Production Briefs',
          icon: FolderKanban,
          count: counts.briefs,
        },
        {
          id: 'submissions',
          label: 'Deliverables QA',
          icon: CheckCircle2,
          count: counts.submissions,
        },
        {
          id: 'assets',
          label: 'Digital Asset Library',
          icon: FileText,
          count: counts.assets,
        },
      ]
    }
  ];

  const memberNavGroups: NavGroup[] = [
    {
      groupTitle: 'TALENT WORKSPACE',
      items: [
        {
          id: 'overview',
          label: 'Overview & Dossier',
          icon: LayoutDashboard,
          count: undefined,
        },
        {
          id: 'briefs',
          label: 'Call Sheets & Shoots',
          icon: FolderKanban,
          count: counts.briefs,
        },
      ]
    },
    {
      groupTitle: 'DELIVERABLES & MEDIA',
      items: [
        {
          id: 'submissions',
          label: 'Submission Log',
          icon: Send,
          count: counts.submissions,
        },
        {
          id: 'assets',
          label: 'Studio Presets & Kits',
          icon: Download,
          count: counts.assets,
        },
      ]
    }
  ];

  const navGroups = role === 'admin' ? adminNavGroups : memberNavGroups;

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const displayName = profile?.full_name || 'Studio Member';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Sidebar Internal Content (Used both in desktop sticky bar and mobile drawer)
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0C0203] text-[#F8F4EF] border-r border-[#EFCEA5]/15 select-none">
      
      {/* 1. Studio Header Brand & Monogram */}
      <div className={`p-5 border-b border-[#EFCEA5]/15 flex items-center justify-between transition-all ${
        isCollapsed ? 'px-3 justify-center' : ''
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#170204] border border-[#EFCEA5]/25 flex items-center justify-center shrink-0 shadow-inner">
            <img 
              src="/assets/th-monogram-cream.png" 
              alt="Team Harvs" 
              className="w-5 h-5 object-contain"
            />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-sm font-serif text-[#F8F4EF] tracking-wide block leading-tight truncate">
                Team Harvs
              </span>
              <span className="text-[0.62rem] tracking-[0.2em] text-[#EFCEA5]/70 uppercase font-mono block mt-0.5 truncate">
                {role === 'admin' ? 'Studio Command Center' : 'Talent Workspace'}
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-[#EFCEA5]/70 hover:text-white hover:bg-white/5"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Navigation Categories */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[0.62rem] font-mono uppercase tracking-[0.22em] text-[#EFCEA5]/50 block mb-2">
                {group.groupTitle}
              </span>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-[#EFCEA5] text-[#1F0205] font-semibold shadow-md'
                        : 'text-[#EFCEA5]/80 hover:text-[#F8F4EF] hover:bg-[#170204] border border-transparent hover:border-[#EFCEA5]/10'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#1F0205]' : 'text-[#EFCEA5]'
                    }`} />

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left tracking-wide">
                          {item.label}
                        </span>

                        {item.count !== undefined && (
                          <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-mono shrink-0 transition-colors ${
                            item.countBadgeColor 
                              ? item.countBadgeColor 
                              : isActive 
                                ? 'bg-[#1F0205] text-[#EFCEA5]' 
                                : 'bg-white/5 text-[#EFCEA5]/80 border border-[#EFCEA5]/15'
                          }`}>
                            {item.count}
                            {item.isPendingBadge && ' New'}
                          </span>
                        )}
                      </>
                    )}

                    {/* Active Pip Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#1F0205] rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 3. Quick Action Feature Card */}
        {!isCollapsed && (
          <div className="pt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#170204] to-[#120103] border border-[#EFCEA5]/15 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[0.62rem] font-mono uppercase tracking-widest text-[#EFCEA5]/70">
                  {role === 'admin' ? 'Curator Tools' : 'Talent Workflow'}
                </span>
              </div>
              
              <p className="text-[0.7rem] text-[#EFCEA5]/80 leading-relaxed font-sans">
                {role === 'admin'
                  ? 'Quickly publish editorial looks to the Selected Works gallery or draft call sheets.'
                  : 'Submit high-res images, video reels, and edit links directly to the studio director.'}
              </p>

              {role === 'admin' ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {onOpenNewLook && (
                    <button
                      onClick={onOpenNewLook}
                      className="w-full py-2 px-2.5 rounded-xl bg-[#EFCEA5] text-[#1F0205] text-[0.65rem] font-bold uppercase tracking-wider hover:bg-white transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" /> Look
                    </button>
                  )}
                  {onOpenNewBrief && (
                    <button
                      onClick={onOpenNewBrief}
                      className="w-full py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#EFCEA5] border border-[#EFCEA5]/20 text-[0.65rem] font-semibold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Brief
                    </button>
                  )}
                </div>
              ) : (
                onOpenSubmitDeliverable && (
                  <button
                    onClick={() => onOpenSubmitDeliverable()}
                    className="w-full py-2 px-3 rounded-xl bg-[#EFCEA5] text-[#1F0205] text-[0.68rem] font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3 h-3" /> Submit Work &rarr;
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Footer: Profile Summary + Sign Out */}
      <div className={`p-4 border-t border-[#EFCEA5]/15 bg-[#0C0203] space-y-3 ${
        isCollapsed ? 'px-2' : ''
      }`}>
        <div className={`flex items-center justify-between gap-3 ${
          isCollapsed ? 'flex-col justify-center' : ''
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#170204] border border-[#EFCEA5]/30 text-[#EFCEA5] flex items-center justify-center font-bold text-xs shrink-0">
              {userInitial}
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="block text-xs font-serif text-[#F8F4EF] font-medium truncate">
                  {displayName}
                </span>
                <span className="block text-[0.62rem] text-[#EFCEA5]/60 uppercase tracking-widest font-mono truncate">
                  {role === 'admin' ? 'Studio Director' : 'Active Talent'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className="p-1.5 rounded-xl text-[#EFCEA5]/60 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Return to Portfolio Link in Sidebar */}
        {!isCollapsed && (
          <button
            onClick={onBackToSite}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#EFCEA5]/15 text-[#EFCEA5] text-[0.68rem] uppercase font-semibold tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Portfolio
          </button>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= lg) */}
      <aside className={`hidden lg:block h-screen sticky top-0 shrink-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer (< lg) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
