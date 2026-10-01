import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  FolderKanban, 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  RotateCcw,
  Eye,
  ExternalLink
} from 'lucide-react';
import { 
  workspaceStore, 
  Application, 
  LookbookWork, 
  ProjectBrief, 
  CreativeAsset, 
  MemberSubmission 
} from '@/lib/workspaceStore';
import { OverviewTab } from './OverviewTab';
import { LookbookCmsTab } from './LookbookCmsTab';
import { RosterCrmTab } from './RosterCrmTab';
import { ProjectBriefsTab } from './ProjectBriefsTab';
import { AssetLibraryTab } from './AssetLibraryTab';
import { MemberWorkspaceView } from './MemberWorkspaceView';

import { NewLookModal } from './NewLookModal';
import { NewBriefModal } from './NewBriefModal';
import { ApplicantDossierModal } from './ApplicantDossierModal';
import { NewAssetModal } from './NewAssetModal';
import { SubmitDeliverableModal } from './SubmitDeliverableModal';

interface WorkspacePortalProps {
  onBackToSite: () => void;
  initialTab?: string;
}

export const WorkspacePortal: React.FC<WorkspacePortalProps> = ({
  onBackToSite,
  initialTab = 'overview',
}) => {
  // Store state
  const [applications, setApplications] = useState<Application[]>([]);
  const [lookbook, setLookbook] = useState<LookbookWork[]>([]);
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [submissions, setSubmissions] = useState<MemberSubmission[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [userRole, setUserRole] = useState<'admin' | 'member'>('admin');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal states
  const [isNewLookOpen, setIsNewLookOpen] = useState(false);
  const [editLookWork, setEditLookWork] = useState<LookbookWork | null>(null);

  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [editBrief, setEditBrief] = useState<ProjectBrief | null>(null);

  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);
  const [isSubmitDeliverableOpen, setIsSubmitDeliverableOpen] = useState(false);
  const [previewLookWork, setPreviewLookWork] = useState<LookbookWork | null>(null);

  // Sync with store
  useEffect(() => {
    const syncData = () => {
      setApplications(workspaceStore.getApplications());
      setLookbook(workspaceStore.getLookbook());
      setBriefs(workspaceStore.getBriefs());
      setAssets(workspaceStore.getAssets());
      setSubmissions(workspaceStore.getSubmissions());
    };

    syncData();
    const unsubscribe = workspaceStore.subscribe(syncData);
    return () => unsubscribe();
  }, []);

  const pendingAppsCount = applications.filter((a) => a.status === 'Pending').length;
  const activeBriefsCount = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'lookbook', label: 'Lookbook CMS', icon: Layers, badge: lookbook.length },
    { id: 'roster', label: 'Talent & Applications', icon: Users, badge: pendingAppsCount > 0 ? pendingAppsCount : undefined, badgeHighlight: true },
    { id: 'briefs', label: 'Production Briefs', icon: FolderKanban, badge: activeBriefsCount > 0 ? activeBriefsCount : undefined },
    { id: 'assets', label: 'Asset Library', icon: FileText, badge: assets.length },
  ];

  return (
    <div className="min-h-screen bg-[#140103] text-[#F8F4EF] flex flex-col lg:flex-row antialiased font-sans">
      
      {/* ==============================================================
          SIDEBAR (Desktop Persistent + Mobile Drawer)
          ============================================================== */}
      
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 bottom-0 left-0 z-40
        w-72 bg-[#1C0306] border-r border-[#EFCEA5]/15
        flex flex-col justify-between p-6 transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand & Top Header */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[#EFCEA5]/15">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/th-monogram-cream.png" 
                alt="Team Harvs" 
                className="w-9 h-9 object-contain"
              />
              <div>
                <h2 className="text-base font-serif tracking-wide text-[#F8F4EF] leading-tight">
                  Team Harvs
                </h2>
                <span className="text-[0.65rem] tracking-[0.2em] text-[#EFCEA5] uppercase font-semibold block">
                  Studio Workspace
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-[#EFCEA5] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Toggle Capsule */}
          <div className="mt-5 p-1 bg-[#2A050A] rounded-xl border border-[#EFCEA5]/15 flex items-center">
            <button
              onClick={() => setUserRole('admin')}
              className={`flex-1 py-1.5 text-[0.68rem] uppercase tracking-wider font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                userRole === 'admin'
                  ? 'bg-[#680F1B] text-[#F8F4EF] shadow-md border border-[#EFCEA5]/30'
                  : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#EFCEA5]" /> Admin CMS
            </button>
            <button
              onClick={() => setUserRole('member')}
              className={`flex-1 py-1.5 text-[0.68rem] uppercase tracking-wider font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                userRole === 'member'
                  ? 'bg-[#680F1B] text-[#F8F4EF] shadow-md border border-[#EFCEA5]/30'
                  : 'text-[#EFCEA5]/60 hover:text-[#EFCEA5]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#EFCEA5]" /> Member Hub
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && userRole === 'admin';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setUserRole('admin');
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#EFCEA5] text-[#1F0205] shadow-md'
                      : 'text-[#EFCEA5]/70 hover:text-[#EFCEA5] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F0205]' : 'text-[#EFCEA5]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[0.62rem] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? 'bg-[#1F0205] text-[#EFCEA5]' 
                        : item.badgeHighlight 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-white/10 text-[#EFCEA5]/80'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-[#EFCEA5]/15 space-y-3">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#EFCEA5]/30 hover:border-[#EFCEA5] text-[#EFCEA5] text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Portfolio
          </button>

          <div className="flex items-center justify-between text-[0.68rem] text-[#EFCEA5]/50 px-1">
            <span>Uyo &bull; Akwa Ibom</span>
            <button
              onClick={() => {
                if (window.confirm('Reset sample workspace data to factory defaults?')) {
                  workspaceStore.resetToSeeds();
                }
              }}
              title="Reset Demo Data"
              className="hover:text-[#EFCEA5] transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Data
            </button>
          </div>
        </div>
      </aside>

      {/* ==============================================================
          MAIN CONTENT AREA
          ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#1C0306]/90 backdrop-blur-md border-b border-[#EFCEA5]/15 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#EFCEA5] hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[0.65rem] tracking-[0.2em] text-[#EFCEA5]/60 uppercase font-semibold hidden sm:block">
                Team Harvs CMS // {userRole === 'admin' ? 'Studio Director' : 'Collective Member'}
              </span>
              <h1 className="text-lg sm:text-xl font-serif text-[#F8F4EF]">
                {userRole === 'member' ? 'Collective Member Workspace' : (
                  activeTab === 'overview' ? 'Executive Studio Overview' :
                  activeTab === 'lookbook' ? 'Lookbook & Editorial CMS' :
                  activeTab === 'roster' ? 'Talent Roster & Open Calls' :
                  activeTab === 'briefs' ? 'Production Briefs & Shoots' :
                  'Creative Asset Library'
                )}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditLookWork(null);
                setIsNewLookOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5]/15 hover:bg-[#EFCEA5]/25 text-[#EFCEA5] border border-[#EFCEA5]/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Look
            </button>

            <button
              onClick={onBackToSite}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
            </button>
          </div>
        </header>

        {/* Tab Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {userRole === 'member' ? (
            <MemberWorkspaceView
              briefs={briefs}
              assets={assets}
              submissions={submissions}
              roster={applications.filter((a) => a.status === 'On Roster')}
              onOpenSubmitDeliverable={() => setIsSubmitDeliverableOpen(true)}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  applications={applications}
                  lookbook={lookbook}
                  briefs={briefs}
                  assets={assets}
                  submissions={submissions}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenNewLook={() => {
                    setEditLookWork(null);
                    setIsNewLookOpen(true);
                  }}
                  onOpenNewBrief={() => {
                    setEditBrief(null);
                    setIsNewBriefOpen(true);
                  }}
                  onSelectApplication={(app) => setSelectedApplicant(app)}
                />
              )}

              {activeTab === 'lookbook' && (
                <LookbookCmsTab
                  lookbook={lookbook}
                  onOpenNewLook={() => {
                    setEditLookWork(null);
                    setIsNewLookOpen(true);
                  }}
                  onEditLook={(work) => {
                    setEditLookWork(work);
                    setIsNewLookOpen(true);
                  }}
                  onPreviewLook={(work) => setPreviewLookWork(work)}
                />
              )}

              {activeTab === 'roster' && (
                <RosterCrmTab
                  applications={applications}
                  onSelectApplication={(app) => setSelectedApplicant(app)}
                />
              )}

              {activeTab === 'briefs' && (
                <ProjectBriefsTab
                  briefs={briefs}
                  onOpenNewBrief={() => {
                    setEditBrief(null);
                    setIsNewBriefOpen(true);
                  }}
                  onEditBrief={(brief) => {
                    setEditBrief(brief);
                    setIsNewBriefOpen(true);
                  }}
                  onOpenSubmitDeliverable={() => setIsSubmitDeliverableOpen(true)}
                />
              )}

              {activeTab === 'assets' && (
                <AssetLibraryTab
                  assets={assets}
                  onOpenNewAsset={() => setIsNewAssetOpen(true)}
                />
              )}
            </>
          )}
        </main>

      </div>

      {/* ==============================================================
          GLOBAL MODALS
          ============================================================== */}
      
      {/* 1. New / Edit Look Modal */}
      <NewLookModal
        isOpen={isNewLookOpen}
        onClose={() => {
          setIsNewLookOpen(false);
          setEditLookWork(null);
        }}
        editWork={editLookWork}
      />

      {/* 2. New / Edit Brief Modal */}
      <NewBriefModal
        isOpen={isNewBriefOpen}
        onClose={() => {
          setIsNewBriefOpen(false);
          setEditBrief(null);
        }}
        editBrief={editBrief}
      />

      {/* 3. Talent Applicant Dossier Modal */}
      <ApplicantDossierModal
        application={selectedApplicant}
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
      />

      {/* 4. New Creative Asset Modal */}
      <NewAssetModal
        isOpen={isNewAssetOpen}
        onClose={() => setIsNewAssetOpen(false)}
      />

      {/* 5. Submit Deliverable Modal */}
      <SubmitDeliverableModal
        isOpen={isSubmitDeliverableOpen}
        onClose={() => setIsSubmitDeliverableOpen(false)}
        briefs={briefs}
      />

      {/* 6. Quick Lookbook Inspection Lightbox Modal */}
      {previewLookWork && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewLookWork(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-[#1C0306] border border-[#EFCEA5]/30 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-black">
              <img 
                src={previewLookWork.image} 
                alt={previewLookWork.title} 
                className="w-full h-full object-cover" 
              />
              <button
                onClick={() => setPreviewLookWork(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]">
                {previewLookWork.tag} &bull; {previewLookWork.discipline}
              </span>
              <h2 className="text-2xl font-serif text-[#F8F4EF] mt-1">{previewLookWork.title}</h2>
              <p className="text-xs text-[#EFCEA5]/80 mt-1">{previewLookWork.category}</p>
              {previewLookWork.description && (
                <p className="text-xs text-[#F8F4EF]/80 mt-3 leading-relaxed border-t border-[#EFCEA5]/10 pt-3">
                  {previewLookWork.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#EFCEA5]/10 text-xs text-[#EFCEA5]/70">
                <span>Stylist: {previewLookWork.stylist || 'Studio Harvs'}</span>
                <span>Camera: {previewLookWork.photographer || 'Studio Harvs'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
