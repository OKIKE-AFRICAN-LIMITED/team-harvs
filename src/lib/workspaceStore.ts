import { isSupabaseConfigured, supabaseService, type Profile } from './supabase';

export const DISCIPLINES = [
  'Models',
  'Stylists',
  'Makeup Artists',
  'Videographers / BTS Creators',
  'Creative Assistants',
  'Photographers',
] as const;

export type DisciplineType = typeof DISCIPLINES[number];

export interface Application {
  id: string;
  fullName: string;
  contact: string;
  discipline: DisciplineType | string;
  portfolio: string;
  date: string;
  status: 'Pending' | 'Under Review' | 'On Roster' | 'Archived';
  notes?: string;
  experience?: string;
}

export interface LookbookWork {
  id: string;
  title: string;
  category: string;
  tag: string;
  image: string;
  discipline: DisciplineType | string;
  featured: boolean;
  photographer?: string;
  stylist?: string;
  model?: string;
  date: string;
  description?: string;
}

export interface ProjectBrief {
  id: string;
  title: string;
  status: 'Planning' | 'In Production' | 'Review / Post' | 'Completed';
  discipline: DisciplineType | string;
  location: string;
  callTime: string;
  date: string;
  lead: string;
  assignedTalent: string[];
  deliverables: string[];
  description: string;
  budget?: string;
}

export interface CreativeAsset {
  id: string;
  title: string;
  category: 'Brand Assets' | 'Call Sheets' | 'Moodboards' | 'Presets' | 'Guidelines' | string;
  fileType: string;
  fileSize: string;
  date: string;
  downloadUrl: string;
  tags: string[];
}

export interface MemberSubmission {
  id: string;
  briefId: string;
  briefTitle: string;
  memberName: string;
  role: string;
  link: string;
  pdfUrl?: string;
  notes: string;
  date: string;
  status: 'Submitted' | 'Approved' | 'Revision Requested';
}

export interface HeroStreamItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  image: string;
  rowNumber: 1 | 2;
  orderIndex: number;
}

export interface BriefInteraction {
  id: string;
  briefId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  discipline?: string;
  viewedAt: string;
  submitted: boolean;
  submittedAt?: string;
}

const STORAGE_KEYS = {
  APPLICATIONS: 'th_workspace_applications_clean_v3',
  LOOKBOOK: 'th_workspace_lookbook_clean_v3',
  BRIEFS: 'th_workspace_briefs_clean_v3',
  ASSETS: 'th_workspace_assets_clean_v3',
  SUBMISSIONS: 'th_workspace_submissions_clean_v3',
  HERO_STREAM: 'th_workspace_hero_stream_v3',
  BRIEF_INTERACTIONS: 'th_workspace_brief_interactions_v3',
  USERS: 'th_workspace_users_v3',
};

// Default curated 2-row hero stream items
export const DEFAULT_HERO_STREAM: HeroStreamItem[] = [
  { id: 'hs-01', title: 'Solitude in Crimson', category: 'Fashion & Editorial Tailoring', tag: 'Look 01 // Autumn', image: '/assets/images/editorial_hero.jpg', rowNumber: 1, orderIndex: 1 },
  { id: 'hs-02', title: 'Double-Breasted Cut', category: 'Avant-Garde Silhouette', tag: 'Look 02 // Tailoring', image: '/assets/images/avant_garde_fashion.jpg', rowNumber: 1, orderIndex: 2 },
  { id: 'hs-03', title: 'Urban Concrete', category: 'Commercial Campaign Lookbook', tag: 'Look 03 // Commercial', image: '/assets/images/campaign_lookbook.jpg', rowNumber: 1, orderIndex: 3 },
  { id: 'hs-04', title: 'Model Development', category: 'Editorial Talent Dossier', tag: 'Look 04 // Roster', image: '/assets/images/model_portrait.jpg', rowNumber: 1, orderIndex: 4 },
  { id: 'hs-05', title: 'Architectural Motion', category: 'High-Fashion Outerwear', tag: 'Look 05 // Movement', image: '/assets/images/fashion_motion_still.jpg', rowNumber: 1, orderIndex: 5 },
  { id: 'hs-06', title: 'Studio Process', category: 'BTS & 35mm Cinema Motion', tag: 'Look 06 // 35mm Motion', image: '/assets/images/creative_production_bts.jpg', rowNumber: 1, orderIndex: 6 },
  { id: 'hs-07', title: 'Burgundy & Cream', category: 'Color Direction & Form', tag: 'Look 07 // Direction', image: '/assets/images/avant_garde_fashion.jpg', rowNumber: 2, orderIndex: 1 },
  { id: 'hs-08', title: 'Akwa Ibom Set', category: 'Studio Harvs Production', tag: 'Look 08 // Set Design', image: '/assets/images/editorial_hero.jpg', rowNumber: 2, orderIndex: 2 },
  { id: 'hs-09', title: 'Metropolitan Set', category: 'Commercial Series Lookbook', tag: 'Look 09 // Series', image: '/assets/images/campaign_lookbook.jpg', rowNumber: 2, orderIndex: 3 },
  { id: 'hs-10', title: 'Editorial Duo', category: 'Coat Architecture', tag: 'Look 10 // Dynamic', image: '/assets/images/fashion_motion_still.jpg', rowNumber: 2, orderIndex: 4 },
  { id: 'hs-11', title: 'Roster Cast', category: 'Model Development Scouting', tag: 'Look 11 // Scouting', image: '/assets/images/model_portrait.jpg', rowNumber: 2, orderIndex: 5 },
  { id: 'hs-12', title: 'Daylight Cinema', category: 'BTS Cinematography', tag: 'Look 12 // Cinema', image: '/assets/images/creative_production_bts.jpg', rowNumber: 2, orderIndex: 6 },
];

class WorkspaceStore {
  private applications: Application[] = [];
  private lookbook: LookbookWork[] = [];
  private briefs: ProjectBrief[] = [];
  private assets: CreativeAsset[] = [];
  private submissions: MemberSubmission[] = [];
  private heroStream: HeroStreamItem[] = DEFAULT_HERO_STREAM;
  private briefInteractions: BriefInteraction[] = [];
  private users: Profile[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.syncFromSupabase();
    }
  }

  public async syncFromSupabase() {
    if (!isSupabaseConfigured) return;
    try {
      const [apps, lb, briefs, ast, sub, hero, users, interactions] = await Promise.all([
        supabaseService.getApplications(),
        supabaseService.getLookbook(),
        supabaseService.getBriefs(),
        supabaseService.getAssets(),
        supabaseService.getSubmissions(),
        supabaseService.getHeroStream(),
        supabaseService.getProfiles(),
        supabaseService.getBriefInteractions(),
      ]);

      let changed = false;
      if (apps !== null) {
        this.applications = apps;
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications));
        changed = true;
      }
      if (lb !== null) {
        this.lookbook = lb;
        localStorage.setItem(STORAGE_KEYS.LOOKBOOK, JSON.stringify(this.lookbook));
        changed = true;
      }
      if (briefs !== null) {
        this.briefs = briefs;
        localStorage.setItem(STORAGE_KEYS.BRIEFS, JSON.stringify(this.briefs));
        changed = true;
      }
      if (ast !== null) {
        this.assets = ast;
        localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(this.assets));
        changed = true;
      }
      if (sub !== null) {
        this.submissions = sub;
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
        changed = true;
      }
      if (hero !== null && hero.length > 0) {
        this.heroStream = hero;
        localStorage.setItem(STORAGE_KEYS.HERO_STREAM, JSON.stringify(this.heroStream));
        changed = true;
      }
      if (users !== null) {
        this.users = users;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
        changed = true;
      }
      if (interactions !== null) {
        this.briefInteractions = interactions;
        localStorage.setItem(STORAGE_KEYS.BRIEF_INTERACTIONS, JSON.stringify(this.briefInteractions));
        changed = true;
      }

      if (changed) {
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase store sync error:', err);
    }
  }

  private loadFromStorage() {
    try {
      const apps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      this.applications = apps ? JSON.parse(apps) : [];

      const lb = localStorage.getItem(STORAGE_KEYS.LOOKBOOK);
      this.lookbook = lb ? JSON.parse(lb) : [];

      const br = localStorage.getItem(STORAGE_KEYS.BRIEFS);
      this.briefs = br ? JSON.parse(br) : [];

      const ast = localStorage.getItem(STORAGE_KEYS.ASSETS);
      this.assets = ast ? JSON.parse(ast) : [];

      const sub = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      this.submissions = sub ? JSON.parse(sub) : [];

      const hs = localStorage.getItem(STORAGE_KEYS.HERO_STREAM);
      this.heroStream = hs ? JSON.parse(hs) : DEFAULT_HERO_STREAM;

      const usr = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = usr ? JSON.parse(usr) : [];

      const bi = localStorage.getItem(STORAGE_KEYS.BRIEF_INTERACTIONS);
      this.briefInteractions = bi ? JSON.parse(bi) : [];
    } catch {
      this.applications = [];
      this.lookbook = [];
      this.briefs = [];
      this.assets = [];
      this.submissions = [];
      this.heroStream = DEFAULT_HERO_STREAM;
      this.users = [];
      this.briefInteractions = [];
    }
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- HERO STREAM MANAGEMENT ---
  public getHeroStream(): HeroStreamItem[] {
    return [...this.heroStream];
  }

  public getHeroStreamRow(rowNumber: 1 | 2): HeroStreamItem[] {
    return this.heroStream.filter((item) => item.rowNumber === rowNumber);
  }

  public updateHeroStreamItem(id: string, updates: Partial<HeroStreamItem>) {
    this.heroStream = this.heroStream.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.persist(STORAGE_KEYS.HERO_STREAM, this.heroStream);

    if (isSupabaseConfigured) {
      supabaseService.upsertHeroStreamItem({ id, ...updates } as any).catch(console.warn);
    }
  }

  public addHeroStreamItem(item: Omit<HeroStreamItem, 'id'>): HeroStreamItem {
    const newItem: HeroStreamItem = {
      ...item,
      id: `hs-${Date.now()}`,
    };
    this.heroStream = [...this.heroStream, newItem];
    this.persist(STORAGE_KEYS.HERO_STREAM, this.heroStream);

    if (isSupabaseConfigured) {
      supabaseService.upsertHeroStreamItem(newItem).catch(console.warn);
    }
    return newItem;
  }

  public deleteHeroStreamItem(id: string) {
    this.heroStream = this.heroStream.filter((item) => item.id !== id);
    this.persist(STORAGE_KEYS.HERO_STREAM, this.heroStream);

    if (isSupabaseConfigured) {
      supabaseService.deleteHeroStreamItem(id).catch(console.warn);
    }
  }

  // --- USER MANAGEMENT ---
  public getUsers(): Profile[] {
    return [...this.users];
  }

  public updateUserRole(userId: string, role: 'admin' | 'member') {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, role } : u));
    this.persist(STORAGE_KEYS.USERS, this.users);

    if (isSupabaseConfigured) {
      supabaseService.updateProfileRole(userId, role).catch(console.warn);
    }
  }

  public updateUserStatus(userId: string, status: 'active' | 'inactive') {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, status } : u));
    this.persist(STORAGE_KEYS.USERS, this.users);

    if (isSupabaseConfigured) {
      supabaseService.updateProfileStatus(userId, status).catch(console.warn);
    }
  }

  // --- ASSIGNMENT CLICK & ENGAGEMENT AUDIT ---
  public getBriefInteractions(briefId?: string): BriefInteraction[] {
    if (briefId) {
      return this.briefInteractions.filter((b) => b.briefId === briefId);
    }
    return [...this.briefInteractions];
  }

  public recordBriefView(briefId: string, user: { id: string; name?: string; email?: string; discipline?: string }) {
    if (!user || !user.id) return;
    const existing = this.briefInteractions.find((b) => b.briefId === briefId && b.userId === user.id);
    if (!existing) {
      const interaction: BriefInteraction = {
        id: `bi-${Date.now()}`,
        briefId,
        userId: user.id,
        userName: user.name || user.email?.split('@')[0] || 'Collective Member',
        userEmail: user.email,
        discipline: user.discipline || 'Talent',
        viewedAt: new Date().toISOString(),
        submitted: false,
      };
      this.briefInteractions = [interaction, ...this.briefInteractions];
      this.persist(STORAGE_KEYS.BRIEF_INTERACTIONS, this.briefInteractions);

      if (isSupabaseConfigured) {
        supabaseService.recordBriefInteraction(interaction).catch(console.warn);
      }
    }
  }

  public recordBriefSubmission(briefId: string, userId: string) {
    this.briefInteractions = this.briefInteractions.map((b) =>
      b.briefId === briefId && b.userId === userId
        ? { ...b, submitted: true, submittedAt: new Date().toISOString() }
        : b
    );
    this.persist(STORAGE_KEYS.BRIEF_INTERACTIONS, this.briefInteractions);
  }

  // --- Applications CRM ---
  public getApplications(): Application[] {
    return [...this.applications];
  }

  public addApplication(data: Omit<Application, 'id' | 'date' | 'status'>): Application {
    const newApp: Application = {
      ...data,
      id: `app-${Date.now()}`,
      date: 'Just now',
      status: 'Pending',
    };
    this.applications = [newApp, ...this.applications];
    this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);

    if (isSupabaseConfigured) {
      supabaseService.insertApplication(data).catch((e) => console.warn('Supabase addApplication failed:', e));
    }
    return newApp;
  }

  public updateApplicationStatus(id: string, status: Application['status'], notes?: string) {
    this.applications = this.applications.map((app) =>
      app.id === id ? { ...app, status, notes: notes ?? app.notes } : app
    );
    this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);

    if (isSupabaseConfigured) {
      supabaseService.updateApplicationStatus(id, status, notes).catch((e) => console.warn('Supabase updateApplicationStatus failed:', e));
    }
  }

  public deleteApplication(id: string) {
    this.applications = this.applications.filter((a) => a.id !== id);
    this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);
  }

  // --- Lookbook Works CMS ---
  public getLookbook(): LookbookWork[] {
    return [...this.lookbook];
  }

  public addLookbookWork(work: Omit<LookbookWork, 'id' | 'date'>): LookbookWork {
    const newWork: LookbookWork = {
      ...work,
      id: `look-${Date.now()}`,
      date: 'Autumn 2026',
    };
    this.lookbook = [newWork, ...this.lookbook];
    this.persist(STORAGE_KEYS.LOOKBOOK, this.lookbook);

    if (isSupabaseConfigured) {
      supabaseService.insertLookbookWork(work).catch((e) => console.warn('Supabase addLookbookWork failed:', e));
    }
    return newWork;
  }

  public updateLookbookWork(id: string, updates: Partial<LookbookWork>) {
    this.lookbook = this.lookbook.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.persist(STORAGE_KEYS.LOOKBOOK, this.lookbook);
  }

  public deleteLookbookWork(id: string) {
    this.lookbook = this.lookbook.filter((item) => item.id !== id);
    this.persist(STORAGE_KEYS.LOOKBOOK, this.lookbook);

    if (isSupabaseConfigured) {
      supabaseService.deleteLookbookWork(id).catch((e) => console.warn('Supabase deleteLookbookWork failed:', e));
    }
  }

  // --- Project Briefs ---
  public getBriefs(): ProjectBrief[] {
    return [...this.briefs];
  }

  public addBrief(brief: Omit<ProjectBrief, 'id' | 'date'>): ProjectBrief {
    const newBrief: ProjectBrief = {
      ...brief,
      id: `brief-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    this.briefs = [newBrief, ...this.briefs];
    this.persist(STORAGE_KEYS.BRIEFS, this.briefs);

    if (isSupabaseConfigured) {
      supabaseService.insertBrief(brief).catch((e) => console.warn('Supabase insertBrief failed:', e));
    }
    return newBrief;
  }

  public updateBriefStatus(id: string, status: ProjectBrief['status']) {
    this.briefs = this.briefs.map((b) => (b.id === id ? { ...b, status } : b));
    this.persist(STORAGE_KEYS.BRIEFS, this.briefs);
  }

  public deleteBrief(id: string) {
    this.briefs = this.briefs.filter((b) => b.id !== id);
    this.persist(STORAGE_KEYS.BRIEFS, this.briefs);
  }

  // --- Assets ---
  public getAssets(): CreativeAsset[] {
    return [...this.assets];
  }

  public addAsset(asset: Omit<CreativeAsset, 'id' | 'date'>): CreativeAsset {
    const newAsset: CreativeAsset = {
      ...asset,
      id: `ast-${Date.now()}`,
      date: 'Just now',
    };
    this.assets = [newAsset, ...this.assets];
    this.persist(STORAGE_KEYS.ASSETS, this.assets);

    if (isSupabaseConfigured) {
      supabaseService.insertAsset(newAsset).catch((e) => console.warn('Supabase insertAsset failed:', e));
    }
    return newAsset;
  }

  public deleteAsset(id: string) {
    this.assets = this.assets.filter((a) => a.id !== id);
    this.persist(STORAGE_KEYS.ASSETS, this.assets);
  }

  // --- Member Submissions ---
  public getSubmissions(): MemberSubmission[] {
    return [...this.submissions];
  }

  public addSubmission(sub: Omit<MemberSubmission, 'id' | 'date' | 'status'>, memberId?: string): MemberSubmission {
    const newSub: MemberSubmission = {
      ...sub,
      id: `sub-${Date.now()}`,
      date: 'Just now',
      status: 'Submitted',
    };
    this.submissions = [newSub, ...this.submissions];
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    if (sub.briefId && memberId) {
      this.recordBriefSubmission(sub.briefId, memberId);
    }

    if (isSupabaseConfigured) {
      supabaseService.insertSubmission(sub, memberId).catch((e) => console.warn('Supabase addSubmission failed:', e));
    }
    return newSub;
  }

  public updateSubmissionStatus(id: string, status: MemberSubmission['status'], feedback?: string) {
    this.submissions = this.submissions.map((s) => (s.id === id ? { ...s, status } : s));
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    if (isSupabaseConfigured) {
      supabaseService.updateSubmissionStatus(id, status, feedback).catch((e) => console.warn('Supabase updateSubmissionStatus failed:', e));
    }
  }

  // Clear all data
  public clearAll() {
    this.applications = [];
    this.lookbook = [];
    this.briefs = [];
    this.assets = [];
    this.submissions = [];
    this.heroStream = DEFAULT_HERO_STREAM;
    this.users = [];
    this.briefInteractions = [];
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.notify();
  }
}

export const workspaceStore = new WorkspaceStore();
