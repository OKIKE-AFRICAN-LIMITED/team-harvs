import React from 'react';
import { 
  Menu, 
  ChevronRight, 
  Plus, 
  Send, 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  FolderKanban, 
  Upload, 
  PanelLeftClose, 
  PanelLeftOpen,
  Shield,
  UserCheck
} from 'lucide-react';
import type { Profile } from '@/lib/supabase';

interface DashboardTopBarProps {
  role: 'admin' | 'member';
  profile: Profile | null;
  user: any;
  activeTabLabel: string;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onToggleMobileSidebar: () => void;
  onBackToSite: () => void;
  onSignOut: () => void;
  onOpenNewLook?: () => void;
  onOpenNewBrief?: () => void;
  onOpenNewAsset?: () => void;
  onOpenSubmitDeliverable?: () => void;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  role,
  profile,
  user,
  activeTabLabel,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onToggleMobileSidebar,
  onBackToSite,
  onSignOut,
  onOpenNewLook,
  onOpenNewBrief,
  onOpenNewAsset,
  onOpenSubmitDeliverable,
}) => {
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Studio Member';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#0C0203]/95 backdrop-blur-xl border-b border-[#EFCEA5]/15 px-4 sm:px-8 flex items-center justify-between shrink-0 transition-colors">
      
      {/* Left Section: Mobile Menu Trigger + Sidebar Collapse Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        
        {/* Mobile Sidebar Hamburger (< lg) */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-[#EFCEA5] hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-[#EFCEA5]"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Sidebar Collapse Toggle (>= lg) */}
        <button
          onClick={onToggleSidebarCollapse}
          className="hidden lg:flex p-2 rounded-xl bg-[#170204] border border-[#EFCEA5]/20 text-[#EFCEA5]/70 hover:text-[#EFCEA5] hover:bg-white/5 transition-colors focus:outline-none"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Elegant Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs truncate">
          <div className="hidden sm:flex items-center gap-1.5 text-[#EFCEA5]/60 uppercase tracking-widest font-mono text-[0.65rem]">
            <span>{role === 'admin' ? 'Studio Command' : 'Talent Portal'}</span>
            <ChevronRight className="w-3 h-3 text-[#EFCEA5]/40 shrink-0" />
          </div>

          <span className="font-serif text-[#F8F4EF] text-sm sm:text-base font-medium tracking-wide truncate">
            {activeTabLabel}
          </span>

          {/* Live Sync Indicator Pill */}
          <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/25 text-emerald-300 text-[0.62rem] font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Right Section: Action Buttons + Public Site Link + Profile Pill */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Role-Specific Quick Action Buttons */}
        {role === 'admin' ? (
          <div className="hidden sm:flex items-center gap-2">
            {onOpenNewLook && (
              <button
                onClick={onOpenNewLook}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-sm hover:scale-105"
              >
                <Plus className="w-3 h-3" /> Look
              </button>
            )}
            {onOpenNewBrief && (
              <button
                onClick={onOpenNewBrief}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-[#EFCEA5] border border-[#EFCEA5]/20 transition-all"
              >
                <FolderKanban className="w-3 h-3" /> Brief
              </button>
            )}
            {onOpenNewAsset && (
              <button
                onClick={onOpenNewAsset}
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-[#EFCEA5] border border-[#EFCEA5]/20 transition-all"
              >
                <Upload className="w-3 h-3" /> Asset
              </button>
            )}
          </div>
        ) : (
          onOpenSubmitDeliverable && (
            <button
              onClick={onOpenSubmitDeliverable}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105"
            >
              <Send className="w-3 h-3" /> Submit Work
            </button>
          )
        )}

        {/* Return to Public Portfolio Button */}
        <button
          onClick={onBackToSite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.68rem] font-semibold uppercase tracking-wider text-[#EFCEA5]/80 hover:text-white bg-white/5 hover:bg-white/10 border border-[#EFCEA5]/15 transition-all"
          title="Return to Public Portfolio"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="hidden md:inline">Public Site</span>
        </button>

        {/* User Profile Pill & Sign Out */}
        {user && (
          <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-[#170204] border border-[#EFCEA5]/20 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#EFCEA5]/15 text-[#EFCEA5] flex items-center justify-center font-bold text-xs">
              {initial}
            </div>

            <div className="hidden sm:block text-left max-w-[120px] truncate">
              <span className="block text-[0.72rem] text-[#F8F4EF] font-medium truncate leading-tight">
                {displayName}
              </span>
              <span className="block text-[0.58rem] text-[#EFCEA5]/60 uppercase tracking-widest font-mono leading-none">
                {role === 'admin' ? 'Director' : 'Talent'}
              </span>
            </div>

            <button
              onClick={onSignOut}
              title="Sign Out of Studio Portal"
              className="p-1 rounded-full text-[#EFCEA5]/60 hover:text-rose-400 hover:bg-rose-950/40 transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </header>
  );
};
