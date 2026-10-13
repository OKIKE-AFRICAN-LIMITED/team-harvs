import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  LogOut, 
  LogIn, 
  X,
  Lock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { 
  workspaceStore, 
  Application, 
  LookbookWork, 
  ProjectBrief, 
  CreativeAsset, 
  MemberSubmission 
} from '@/lib/workspaceStore';
import { isSupabaseConfigured, authService, type Profile } from '@/lib/supabase';
import { AuthPage } from '../auth/AuthPage';
import { DashboardTopBar } from './DashboardTopBar';
import { DashboardSidebar } from './DashboardSidebar';
import { AdminDashboard } from './AdminDashboard';
import { MemberDashboard } from './MemberDashboard';

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
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<any>(initialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Store data state
  const [applications, setApplications] = useState<Application[]>([]);
  const [lookbook, setLookbook] = useState<LookbookWork[]>([]);
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [submissions, setSubmissions] = useState<MemberSubmission[]>([]);

  // Modals state
  const [isNewLookOpen, setIsNewLookOpen] = useState(false);
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [isSubmitDeliverableOpen, setIsSubmitDeliverableOpen] = useState(false);
  const [previewLookWork, setPreviewLookWork] = useState<LookbookWork | null>(null);

  // Auth & Profile state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Sync with workspace store
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

  // Sync with Supabase Auth & Profile
  useEffect(() => {
    async function loadAuth() {
      try {
        const user = await authService.getUser();
        if (user) {
          setCurrentUser(user);
          const profile = await authService.getProfile(user.id);
          if (profile) {
            setCurrentProfile(profile);
          } else {
            setCurrentProfile({
              id: user.id,
              email: user.email || '',
              full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || '',
              role: 'member',
              status: 'active'
            });
          }
        }
      } catch (e) {
        console.warn('Auth check error:', e);
      } finally {
        setAuthLoading(false);
      }
    }

    loadAuth();

    const { data } = authService.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const profile = await authService.getProfile(session.user.id);
        if (profile) {
          setCurrentProfile(profile);
        } else {
          setCurrentProfile({
            id: session.user.id,
            email: session.user.email || '',
            full_name: (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0] || '',
            role: 'member',
            status: 'active'
          });
        }
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
      }
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
  };

  // Full-Screen Auth Page
  if (isAuthPageOpen) {
    return (
      <AuthPage
        onBackToSite={() => setIsAuthPageOpen(false)}
        onAuthSuccess={(user, profile) => {
          setCurrentUser(user);
          setCurrentProfile(profile);
          setIsAuthPageOpen(false);
        }}
      />
    );
  }

  const role = currentProfile?.role || 'member';

  // Counts for sidebar badges
  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const activeBriefs = briefs.filter((b) => b.status === 'In Production' || b.status === 'Planning');

  const sidebarCounts = {
    lookbook: lookbook.length,
    roster: applications.length,
    pendingRoster: pendingApps.length,
    briefs: activeBriefs.length,
    submissions: submissions.length,
    assets: assets.length,
  };

  // Map active tab to a human-readable title for topbar breadcrumb
  const getTabLabel = (tab: string, currentRole: string) => {
    if (currentRole === 'admin') {
      switch (tab) {
        case 'overview': return 'Studio Overview';
        case 'lookbook': return 'Lookbook CMS Archive';
        case 'roster': return 'Talent Roster & CRM';
        case 'briefs': return 'Production Briefs';
        case 'submissions': return 'Deliverables QA';
        case 'assets': return 'Digital Asset Library';
        default: return 'Studio Management';
      }
    } else {
      switch (tab) {
        case 'overview': return 'Talent Dossier';
        case 'briefs': return 'Call Sheets & Shoots';
        case 'submissions': return 'Deliverables Log';
        case 'assets': return 'Studio Presets & Kits';
        default: return 'Talent Workspace';
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0C0203] text-[#F8F4EF] flex overflow-hidden antialiased selection:bg-[#EFCEA5] selection:text-[#1F0205]">
      
      {/* 1. DEDICATED STUDIO SIDEBAR (Persistent Desktop, Drawer Mobile) */}
      <DashboardSidebar
        role={role}
        profile={currentProfile}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        counts={sidebarCounts}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onBackToSite={onBackToSite}
        onSignOut={handleSignOut}
        onOpenNewLook={() => setIsNewLookOpen(true)}
        onOpenNewBrief={() => setIsNewBriefOpen(true)}
        onOpenNewAsset={() => setIsNewAssetOpen(true)}
        onOpenSubmitDeliverable={() => setIsSubmitDeliverableOpen(true)}
      />

      {/* 2. MAIN WORKSPACE CONTAINER (Top Bar + Scrollable Content) */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#0C0203]">
        
        {/* DEDICATED TOP BAR */}
        <DashboardTopBar
          role={role}
          profile={currentProfile}
          user={currentUser}
          activeTabLabel={getTabLabel(activeTab, role)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onBackToSite={onBackToSite}
          onSignOut={handleSignOut}
          onOpenNewLook={() => setIsNewLookOpen(true)}
          onOpenNewBrief={() => setIsNewBriefOpen(true)}
          onOpenNewAsset={() => setIsNewAssetOpen(true)}
          onOpenSubmitDeliverable={() => setIsSubmitDeliverableOpen(true)}
        />

        {/* SCROLLABLE DASHBOARD CANVAS */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 bg-[#0C0203] scrollbar-thin scrollbar-thumb-white/10">
          
          {/* If user is not authenticated: Show luxury studio access gate */}
          {!currentUser ? (
            <div className="py-20 text-center max-w-xl mx-auto space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#170204] border border-[#EFCEA5]/20 flex items-center justify-center mx-auto text-[#EFCEA5] shadow-lg">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-mono font-semibold block">
                  Restricted Studio Access
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F4EF]">
                  Studio Workspace Authentication Required
                </h2>
                <p className="text-xs sm:text-sm text-[#EFCEA5]/70 leading-relaxed font-sans pt-2">
                  Sign in with your creative credentials to access your talent call sheets, submit shoot deliverables, or access the administrative CMS.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setIsAuthPageOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-xl hover:scale-105"
                >
                  Sign In to Studio Portal &rarr;
                </button>
                <button
                  onClick={onBackToSite}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-[#EFCEA5] border border-[#EFCEA5]/20 transition-all"
                >
                  Return to Public Portfolio
                </button>
              </div>
            </div>
          ) : role === 'admin' ? (
            /* ADMIN DASHBOARD for Studio Directors */
            <AdminDashboard
              applications={applications}
              lookbook={lookbook}
              briefs={briefs}
              assets={assets}
              submissions={submissions}
              activeTab={activeTab}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNewLook={() => setIsNewLookOpen(true)}
              onOpenNewBrief={() => setIsNewBriefOpen(true)}
              onOpenNewAsset={() => setIsNewAssetOpen(true)}
              onSelectApplicant={(app) => setSelectedApplicant(app)}
              onPreviewLook={(work) => setPreviewLookWork(work)}
            />
          ) : (
            /* MEMBER DASHBOARD for Creative Talent */
            <MemberDashboard
              profile={currentProfile}
              briefs={briefs}
              assets={assets}
              submissions={submissions}
              activeTab={activeTab}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenSubmitDeliverable={() => setIsSubmitDeliverableOpen(true)}
            />
          )}

        </main>

      </div>

      {/* ==============================================================
          STUDIO MODALS
          ============================================================== */}
      
      {/* 1. New Look Modal */}
      <NewLookModal
        isOpen={isNewLookOpen}
        onClose={() => setIsNewLookOpen(false)}
      />

      {/* 2. New Brief Modal */}
      <NewBriefModal
        isOpen={isNewBriefOpen}
        onClose={() => setIsNewBriefOpen(false)}
      />

      {/* 3. New Asset Modal */}
      <NewAssetModal
        isOpen={isNewAssetOpen}
        onClose={() => setIsNewAssetOpen(false)}
      />

      {/* 4. Applicant Dossier Evaluation Modal */}
      <ApplicantDossierModal
        application={selectedApplicant}
        isOpen={Boolean(selectedApplicant)}
        onClose={() => setSelectedApplicant(null)}
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
            className="relative max-w-2xl w-full bg-[#170204] border border-[#EFCEA5]/30 rounded-3xl overflow-hidden shadow-2xl"
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
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-3">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold text-[#EFCEA5]">
                {previewLookWork.tag} &bull; {previewLookWork.discipline}
              </span>
              <h2 className="text-2xl font-serif text-[#F8F4EF]">{previewLookWork.title}</h2>
              <p className="text-xs text-[#EFCEA5]/80">{previewLookWork.category}</p>
              {previewLookWork.description && (
                <p className="text-xs text-[#F8F4EF]/80 pt-3 border-t border-[#EFCEA5]/10 leading-relaxed">
                  {previewLookWork.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
