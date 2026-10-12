import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  LogOut, 
  LogIn, 
  X,
  Lock,
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
import { isSupabaseConfigured, authService, type Profile } from '@/lib/supabase';
import { AuthPage } from '../auth/AuthPage';
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
}) => {
  // Store state (Clean slate synced with Supabase)
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
            // Default profile structure if table row is still creating
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

  // Handle Full-Screen Auth Page
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

  return (
    <div className="min-h-screen bg-[#0C0203] text-[#F8F4EF] flex flex-col antialiased selection:bg-[#EFCEA5] selection:text-[#1F0205]">
      
      {/* ==============================================================
          TOP LUXURY HEADER BAR (Spacious, Minimalist)
          ============================================================== */}
      <header className="sticky top-0 z-40 bg-[#0C0203]/90 backdrop-blur-md border-b border-[#EFCEA5]/10 px-6 sm:px-12 py-5 flex items-center justify-between">
        
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-2.5 text-xs text-[#EFCEA5] hover:text-white uppercase tracking-wider font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Return to Portfolio</span>
          </button>

          <div className="h-4 w-px bg-[#EFCEA5]/20 hidden sm:block" />

          <div className="flex items-center gap-3">
            <img 
              src="/assets/th-monogram-cream.png" 
              alt="Team Harvs" 
              className="w-7 h-7 object-contain"
            />
            <div>
              <span className="text-sm font-serif text-[#F8F4EF] tracking-wide block leading-none">
                Team Harvs
              </span>
              <span className="text-[0.62rem] tracking-[0.2em] text-[#EFCEA5]/60 uppercase font-mono block mt-1">
                {role === 'admin' ? 'Studio Command Center' : 'Talent Workspace'}
              </span>
            </div>
          </div>
        </div>

        {/* User Pill & Sign Out */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-[#170204] border border-[#EFCEA5]/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#F8F4EF] font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  {currentProfile?.full_name || currentUser.email}
                </span>
                <span className={`text-[0.62rem] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-[#EFCEA5]/15 text-[#EFCEA5] border border-[#EFCEA5]/20'
                }`}>
                  {role === 'admin' ? 'Studio Director' : 'Talent Member'}
                </span>
              </div>

              <button
                onClick={async () => {
                  await authService.signOut();
                  setCurrentUser(null);
                  setCurrentProfile(null);
                }}
                title="Sign Out"
                className="p-1.5 rounded-full text-[#EFCEA5]/60 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthPageOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EFCEA5] text-[#1F0205] hover:bg-[#F8F4EF] transition-all shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In / Register
            </button>
          )}
        </div>

      </header>

      {/* ==============================================================
          MAIN CONTENT VIEW (Strictly Governed by Profile Role)
          ============================================================== */}
      <main className="flex-1 p-6 sm:p-10 lg:p-16 max-w-7xl w-full mx-auto">
        
        {/* If user is not authenticated: Show luxury gateway invitation */}
        {!currentUser ? (
          <div className="py-20 text-center max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#170204] border border-[#EFCEA5]/20 flex items-center justify-center mx-auto text-[#EFCEA5]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[0.68rem] tracking-[0.24em] uppercase text-[#EFCEA5] font-semibold block">
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
          /* Strictly ADMIN DASHBOARD for Studio Directors */
          <AdminDashboard
            applications={applications}
            lookbook={lookbook}
            briefs={briefs}
            assets={assets}
            submissions={submissions}
            onOpenNewLook={() => setIsNewLookOpen(true)}
            onOpenNewBrief={() => setIsNewBriefOpen(true)}
            onOpenNewAsset={() => setIsNewAssetOpen(true)}
            onSelectApplicant={(app) => setSelectedApplicant(app)}
            onPreviewLook={(work) => setPreviewLookWork(work)}
          />
        ) : (
          /* Strictly MEMBER DASHBOARD for Creative Talent */
          <MemberDashboard
            profile={currentProfile}
            briefs={briefs}
            assets={assets}
            submissions={submissions}
            onOpenSubmitDeliverable={() => setIsSubmitDeliverableOpen(true)}
          />
        )}

      </main>

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
