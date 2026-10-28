import { isSupabaseConfigured, supabaseService, authService, type Profile } from './supabase';

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
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  discipline: DisciplineType | string;
  featured: boolean;
  photographer?: string;
  stylist?: string;
  model?: string;
  date: string;
  description?: string;
}

export function isVideoMedia(url?: string, mediaType?: string): boolean {
  if (mediaType === 'video') return true;
  if (!url) return false;
  if (url.startsWith('data:video')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogg')
  );
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
  assignmentText?: string;
  isAssignment?: boolean;
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
  textContent?: string;
  submissionType?: 'link' | 'pdf' | 'text';
  notes: string;
  date: string;
  status: 'Submitted' | 'Approved' | 'Revision Requested';
  adminFeedback?: string;
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
  { id: 'hs-01', title: 'Solitude in Crimson', category: 'Fashion & Editorial Tailoring', tag: '', image: '/assets/images/editorial_hero.jpg', rowNumber: 1, orderIndex: 1 },
  { id: 'hs-02', title: 'Double-Breasted Cut', category: 'Avant-Garde Silhouette', tag: '', image: '/assets/images/avant_garde_fashion.jpg', rowNumber: 1, orderIndex: 2 },
  { id: 'hs-03', title: 'Urban Concrete', category: 'Commercial Campaign Lookbook', tag: '', image: '/assets/images/campaign_lookbook.jpg', rowNumber: 1, orderIndex: 3 },
  { id: 'hs-04', title: 'Model Development', category: 'Editorial Talent Dossier', tag: '', image: '/assets/images/model_portrait.jpg', rowNumber: 1, orderIndex: 4 },
  { id: 'hs-05', title: 'Architectural Motion', category: 'High-Fashion Outerwear', tag: '', image: '/assets/images/fashion_motion_still.jpg', rowNumber: 1, orderIndex: 5 },
  { id: 'hs-06', title: 'Studio Process', category: 'BTS & 35mm Cinema Motion', tag: '', image: '/assets/images/creative_production_bts.jpg', rowNumber: 1, orderIndex: 6 },
  { id: 'hs-07', title: 'Burgundy & Cream', category: 'Color Direction & Form', tag: '', image: '/assets/images/avant_garde_fashion.jpg', rowNumber: 2, orderIndex: 1 },
  { id: 'hs-08', title: 'Akwa Ibom Set', category: 'Studio Harvs Production', tag: '', image: '/assets/images/editorial_hero.jpg', rowNumber: 2, orderIndex: 2 },
  { id: 'hs-09', title: 'Metropolitan Set', category: 'Commercial Series Lookbook', tag: '', image: '/assets/images/campaign_lookbook.jpg', rowNumber: 2, orderIndex: 3 },
  { id: 'hs-10', title: 'Editorial Duo', category: 'Coat Architecture', tag: '', image: '/assets/images/fashion_motion_still.jpg', rowNumber: 2, orderIndex: 4 },
  { id: 'hs-11', title: 'Roster Cast', category: 'Model Development Scouting', tag: '', image: '/assets/images/model_portrait.jpg', rowNumber: 2, orderIndex: 5 },
  { id: 'hs-12', title: 'Daylight Cinema', category: 'BTS Cinematography', tag: '', image: '/assets/images/creative_production_bts.jpg', rowNumber: 2, orderIndex: 6 },
];

// Default initial curated works for Selected Works archive (tags cleared)
export const DEFAULT_LOOKBOOK: LookbookWork[] = [
  {
    id: 'sw-01',
    title: 'test to see if it works',
    category: 'Fashion & Tailoring',
    discipline: 'Stylists',
    tag: '',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    date: 'Autumn 2026',
    featured: true,
    photographer: 'Studio Harvs Camera',
    stylist: 'Aniekeme Bassey',
    description: 'Experimental silhouette exploring structured avant-garde tailoring and intentional motion.'
  },
  {
    id: 'sw-02',
    title: 'Double-Breasted Cut',
    category: 'Avant-Garde Silhouette',
    discipline: 'Stylists',
    tag: '',
    image: '/assets/images/avant_garde_fashion.jpg',
    date: 'Autumn 2026',
    featured: true,
    photographer: 'Harvs Editorial Team',
    stylist: 'Team Harvs',
    description: 'Structured tailoring with pronounced shoulder pads and monochromatic harmony.'
  },
  {
    id: 'sw-03',
    title: 'Architectural Trench',
    category: 'High-Fashion Outerwear',
    discipline: 'Stylists',
    tag: '',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    date: 'Autumn 2026',
    featured: true,
    photographer: 'Studio Harvs Camera',
    stylist: 'Team Harvs',
    description: 'Volumetric trench cut constructed for kinetic movement and outdoor editorial settings.'
  },
  {
    id: 'sw-04',
    title: 'Editorial Hero Look',
    category: 'Team Harvs Autumn Series',
    discipline: 'Photographers',
    tag: '',
    image: '/assets/images/editorial_hero.jpg',
    date: 'Autumn 2026',
    featured: true,
    photographer: 'Studio Harvs',
    stylist: 'Team Harvs',
    description: 'Signature editorial hero look shot on location in Uyo, Akwa Ibom.'
  },
  {
    id: 'sw-05',
    title: 'Commercial Campaign Lookbook',
    category: 'Commercial Campaign Issue 01',
    discipline: 'Photographers',
    tag: '',
    image: '/assets/images/campaign_lookbook.jpg',
    date: 'Autumn 2026',
    featured: true,
    photographer: 'Studio Harvs',
    stylist: 'Team Harvs',
    description: 'Commercial brand campaign with cinematic color grading and modern street texture.'
  },
  {
    id: 'sw-06',
    title: 'Metropolitan Motion',
    category: 'Outdoor Dynamic Direction',
    discipline: 'Videographers / BTS Creators',
    tag: '',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'Motion Studio',
    stylist: 'Team Harvs',
    description: 'Dynamic outdoor pacing capturing wind-swept textures and active tailoring.'
  },
  {
    id: 'sw-07',
    title: 'Model Development Dossier',
    category: 'Talent Dossier Scouting',
    discipline: 'Models',
    tag: '',
    image: '/assets/images/model_portrait.jpg',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'Harvs Portrait Studio',
    stylist: 'Team Harvs',
    description: 'Clean-light beauty & profile test for emerging collective model roster.'
  },
  {
    id: 'sw-08',
    title: '35mm Film Studio Set',
    category: 'BTS & Production Cinematography',
    discipline: 'Videographers / BTS Creators',
    tag: '',
    image: '/assets/images/creative_production_bts.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    mediaType: 'video',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'BTS Cinema Unit',
    stylist: 'Team Harvs',
    description: 'Raw behind-the-scenes 35mm film stills from our creative production sessions in Uyo.'
  },
  {
    id: 'sw-09',
    title: 'Monochromatic Form',
    category: 'Studio Architecture',
    discipline: 'Photographers',
    tag: '',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'Studio Harvs Camera',
    stylist: 'Team Harvs',
    description: 'Studio architectural lighting focusing on sharp geometric cuts and textures.'
  },
  {
    id: 'sw-10',
    title: 'Fashion Motion Still',
    category: 'Movement Study',
    discipline: 'Videographers / BTS Creators',
    tag: '',
    image: '/assets/images/fashion_motion_still.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    mediaType: 'video',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'Motion Studio',
    stylist: 'Team Harvs',
    description: 'Cinematic freeze-frame studying fabric flow at 60fps under tungsten warm lighting.'
  },
  {
    id: 'sw-11',
    title: 'Pure Expression',
    category: 'Editorial Lighting',
    discipline: 'Makeup Artists',
    tag: '',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'Studio Harvs',
    stylist: 'Team Harvs',
    description: 'High-contrast editorial makeup look highlighting skin texture and natural glow.'
  },
  {
    id: 'sw-12',
    title: 'Concrete Monolith',
    category: 'Urban Set Direction',
    discipline: 'Creative Assistants',
    tag: '',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
    date: 'Autumn 2026',
    featured: false,
    photographer: 'Studio Harvs',
    stylist: 'Team Harvs',
    description: 'Spatial and brutalist set design on location utilizing industrial concrete geometry.'
  },
];

class WorkspaceStore {
  private applications: Application[] = [];
  private lookbook: LookbookWork[] = DEFAULT_LOOKBOOK;
  private briefs: ProjectBrief[] = [];
  private assets: CreativeAsset[] = [];
  private submissions: MemberSubmission[] = [];
  private heroStream: HeroStreamItem[] = DEFAULT_HERO_STREAM;
  private briefInteractions: BriefInteraction[] = [];
  private users: Profile[] = [];
  private listeners: Set<() => void> = new Set();

  private syncInFlight: Promise<void> | null = null;
  private lastSyncError: string | null = null;
  private isSyncing = false;
  private failedSections: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.syncFromSupabase();
      // Refresh when the admin comes back to the tab so the dashboard never looks stale
      window.addEventListener('focus', () => this.syncFromSupabase());
    }
  }

  /** Cache to localStorage without ever throwing (quota errors used to abort the whole sync). */
  private safeCache(key: string, data: any) {
    try {
      const json = JSON.stringify(data);
      // Never cache multi-MB payloads (e.g. embedded base64 media) — it fills the 5 MB quota
      if (json.length > 1_500_000) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, json);
    } catch {
      try { localStorage.removeItem(key); } catch {}
    }
  }

  public getSyncState() {
    return { isSyncing: this.isSyncing, lastError: this.lastSyncError, failedSections: [...this.failedSections] };
  }

  /**
   * Pulls every table from Supabase. Each table is applied INDEPENDENTLY as soon as it
   * arrives, so one slow/broken table (e.g. the hero stream) can no longer block or
   * wipe out the others (this is why User Management used to show 0 users).
   */
  public syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured) return Promise.resolve();
    if (this.syncInFlight) return this.syncInFlight;

    this.isSyncing = true;
    this.lastSyncError = null;
    this.notify();

    const apply = <T,>(label: string, p: Promise<T | null>, onData: (data: T) => void) =>
      p.then((data) => {
        if (data !== null && data !== undefined) {
          this.failedSections.delete(label);
          onData(data);
          this.notify();
        } else {
          this.failedSections.add(label);
        }
      }).catch((err) => {
        console.warn(`Supabase sync (${label}) failed:`, err);
        this.failedSections.add(label);
        this.lastSyncError = `Couldn't load ${label}.`;
      });

    const tasks = [
      apply('users', supabaseService.getProfiles(), (users) => {
        this.users = users;
        this.safeCache(STORAGE_KEYS.USERS, this.users);
      }),
      apply('applications', supabaseService.getApplications(), (apps) => {
        this.applications = apps;
        this.safeCache(STORAGE_KEYS.APPLICATIONS, this.applications);
      }),
      apply('lookbook', supabaseService.getLookbook(), (lb) => {
        if (lb.length > 0) {
          this.lookbook = lb;
        } else {
          if (this.lookbook.length === 0) this.lookbook = DEFAULT_LOOKBOOK;
          // Supabase lookbook table is empty: seed it so items exist in the database
          this.lookbook.forEach((item) => {
            supabaseService.upsertLookbookWork(item).catch(() => {});
          });
        }
        this.safeCache(STORAGE_KEYS.LOOKBOOK, this.lookbook);
      }),
      apply('briefs', supabaseService.getBriefs(), (briefs) => {
        this.briefs = briefs;
        this.safeCache(STORAGE_KEYS.BRIEFS, this.briefs);
      }),
      apply('assets', supabaseService.getAssets(), (ast) => {
        this.assets = ast;
        this.safeCache(STORAGE_KEYS.ASSETS, this.assets);
      }),
      apply('submissions', supabaseService.getSubmissions(), (sub) => {
        const remoteIds = new Set(sub.map((s) => s.id));
        const unsynced = this.submissions.filter((s) => !remoteIds.has(s.id));
        this.submissions = [...sub, ...unsynced];
        this.safeCache(STORAGE_KEYS.SUBMISSIONS, this.submissions);
      }),
      apply('hero stream', supabaseService.getHeroStream(), (hero) => {
        if (hero.length > 0) {
          this.heroStream = hero;
          this.safeCache(STORAGE_KEYS.HERO_STREAM, this.heroStream);
        }
      }),
      apply('brief activity', supabaseService.getBriefInteractions(), (interactions) => {
        this.briefInteractions = interactions;
        this.safeCache(STORAGE_KEYS.BRIEF_INTERACTIONS, this.briefInteractions);
      }),
    ];

    this.syncInFlight = Promise.all(tasks).then(() => {
      this.isSyncing = false;
      this.syncInFlight = null;
      this.notify();
    });
    return this.syncInFlight;
  }

  private loadFromStorage() {
    try {
      const apps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      this.applications = apps ? JSON.parse(apps) : [];

      const lb = localStorage.getItem(STORAGE_KEYS.LOOKBOOK);
      this.lookbook = (lb && JSON.parse(lb).length > 0) ? JSON.parse(lb) : DEFAULT_LOOKBOOK;

      const br = localStorage.getItem(STORAGE_KEYS.BRIEFS);
      this.briefs = br ? JSON.parse(br) : [];

      const ast = localStorage.getItem(STORAGE_KEYS.ASSETS);
      this.assets = ast ? JSON.parse(ast) : [];

      const sub = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      this.submissions = sub ? JSON.parse(sub) : [];

      const hs = localStorage.getItem(STORAGE_KEYS.HERO_STREAM);
      this.heroStream = (hs && JSON.parse(hs).length > 0) ? JSON.parse(hs) : DEFAULT_HERO_STREAM;

      const usr = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = usr ? JSON.parse(usr) : [];

      const bi = localStorage.getItem(STORAGE_KEYS.BRIEF_INTERACTIONS);
      this.briefInteractions = bi ? JSON.parse(bi) : [];
    } catch {
      this.applications = [];
      this.lookbook = DEFAULT_LOOKBOOK;
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

  /** Updates a hero card. Resolves with `{ ok, error }` from the database so the UI can report it honestly. */
  public async updateHeroStreamItem(id: string, updates: Partial<HeroStreamItem>): Promise<{ ok: boolean; error?: string }> {
    const existing = this.heroStream.find((item) => item.id === id);
    const merged = existing ? { ...existing, ...updates } : ({ id, ...updates } as HeroStreamItem);

    this.heroStream = this.heroStream.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.persist(STORAGE_KEYS.HERO_STREAM, this.heroStream);

    if (!isSupabaseConfigured) return { ok: true };
    try {
      const saved = await supabaseService.upsertHeroStreamItem(merged);
      return saved ? { ok: true } : { ok: false, error: 'The database rejected the change. Make sure you are signed in as an admin.' };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Network error while saving.' };
    }
  }

  public addHeroStreamItem(item: Omit<HeroStreamItem, 'id'>): HeroStreamItem {
    const newItem: HeroStreamItem = {
      ...item,
      id: `hs-${Date.now()}`,
    };
    this.heroStream = [...this.heroStream, newItem];
    this.persist(STORAGE_KEYS.HERO_STREAM, this.heroStream);
    this.notify();

    if (isSupabaseConfigured) {
      supabaseService.upsertHeroStreamItem(newItem).catch((err) =>
        console.warn('Supabase addHeroStreamItem failed:', err)
      );
    }
    return newItem;
  }

  public deleteHeroStreamItem(id: string) {
    this.heroStream = this.heroStream.filter((item) => item.id !== id);
    this.persist(STORAGE_KEYS.HERO_STREAM, this.heroStream);
    this.notify();

    if (isSupabaseConfigured) {
      supabaseService.deleteHeroStreamItem(id).catch((err) =>
        console.warn('Supabase deleteHeroStreamItem failed:', err)
      );
    }
  }

  // --- USER MANAGEMENT ---
  public getUsers(): Profile[] {
    return [...this.users];
  }

  public async updateUserRole(userId: string, role: 'admin' | 'member') {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, role } : u));
    this.safeCache(STORAGE_KEYS.USERS, this.users);
    this.notify();

    if (isSupabaseConfigured) {
      await authService.updateProfile(userId, { role }).catch(console.warn);
    }
  }

  public async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'pending') {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, status } : u));
    this.safeCache(STORAGE_KEYS.USERS, this.users);
    this.notify();

    if (isSupabaseConfigured) {
      await authService.updateProfile(userId, { status }).catch(console.warn);
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
    this.notify();

    if (isSupabaseConfigured) {
      supabaseService.insertLookbookWork(work).catch((e) => console.warn('Supabase addLookbookWork failed:', e));
    }
    return newWork;
  }

  public updateLookbookWork(id: string, updates: Partial<LookbookWork>) {
    const existing = this.lookbook.find((item) => item.id === id);
    const merged = existing ? { ...existing, ...updates, id } : ({ id, ...updates } as LookbookWork);

    this.lookbook = this.lookbook.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.persist(STORAGE_KEYS.LOOKBOOK, this.lookbook);
    this.notify();

    if (isSupabaseConfigured) {
      supabaseService.upsertLookbookWork(merged).catch((e) =>
        console.warn('Supabase upsertLookbookWork failed:', e)
      );
    }
  }

  public deleteLookbookWork(id: string) {
    this.lookbook = this.lookbook.filter((item) => item.id !== id);
    this.persist(STORAGE_KEYS.LOOKBOOK, this.lookbook);
    this.notify();

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
    this.submissions = this.submissions.map((s) =>
      s.id === id ? { ...s, status, adminFeedback: feedback !== undefined ? feedback : s.adminFeedback } : s
    );
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    if (isSupabaseConfigured) {
      supabaseService.updateSubmissionStatus(id, status, feedback).catch((e) => console.warn('Supabase updateSubmissionStatus failed:', e));
    }
  }

  public deleteSubmission(id: string) {
    this.submissions = this.submissions.filter((s) => s.id !== id);
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    if (isSupabaseConfigured) {
      supabaseService.deleteSubmission(id).catch((e) => console.warn('Supabase deleteSubmission failed:', e));
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
