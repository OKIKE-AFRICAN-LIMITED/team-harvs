import { isSupabaseConfigured, supabaseService } from './supabase';

export interface Application {
  id: string;
  fullName: string;
  contact: string;
  discipline: 'Model' | 'Stylist' | 'MUA' | 'Videographer' | 'Assistant' | 'Photographer' | string;
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
  discipline: string;
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
  discipline: string;
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
  category: 'Brand Assets' | 'Call Sheets' | 'Moodboards' | 'Presets' | 'Guidelines';
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
  notes: string;
  date: string;
  status: 'Submitted' | 'Approved' | 'Revision Requested';
}

const STORAGE_KEYS = {
  APPLICATIONS: 'th_workspace_applications_clean_v2',
  LOOKBOOK: 'th_workspace_lookbook_clean_v2',
  BRIEFS: 'th_workspace_briefs_clean_v2',
  ASSETS: 'th_workspace_assets_clean_v2',
  SUBMISSIONS: 'th_workspace_submissions_clean_v2',
};

class WorkspaceStore {
  private applications: Application[] = [];
  private lookbook: LookbookWork[] = [];
  private briefs: ProjectBrief[] = [];
  private assets: CreativeAsset[] = [];
  private submissions: MemberSubmission[] = [];
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
      const [apps, lb, briefs, ast, sub] = await Promise.all([
        supabaseService.getApplications(),
        supabaseService.getLookbook(),
        supabaseService.getBriefs(),
        supabaseService.getAssets(),
        supabaseService.getSubmissions()
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
    } catch {
      this.applications = [];
      this.lookbook = [];
      this.briefs = [];
      this.assets = [];
      this.submissions = [];
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

  // --- Applications CRM ---
  public getApplications(): Application[] {
    return [...this.applications];
  }

  public addApplication(data: Omit<Application, 'id' | 'date' | 'status'>): Application {
    const newApp: Application = {
      ...data,
      id: `app-${Date.now()}`,
      date: 'Just now',
      status: 'Pending'
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
      date: 'Autumn 2026'
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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    this.briefs = [newBrief, ...this.briefs];
    this.persist(STORAGE_KEYS.BRIEFS, this.briefs);

    if (isSupabaseConfigured) {
      supabaseService.insertBrief(brief).catch((e) => console.warn('Supabase insertBrief failed:', e));
    }
    return newBrief;
  }

  public updateBriefStatus(id: string, status: ProjectBrief['status']) {
    this.briefs = this.briefs.map((b) => b.id === id ? { ...b, status } : b);
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
      date: 'Just now'
    };
    this.assets = [newAsset, ...this.assets];
    this.persist(STORAGE_KEYS.ASSETS, this.assets);
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
      status: 'Submitted'
    };
    this.submissions = [newSub, ...this.submissions];
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    if (isSupabaseConfigured) {
      supabaseService.insertSubmission(sub, memberId).catch((e) => console.warn('Supabase addSubmission failed:', e));
    }
    return newSub;
  }

  public updateSubmissionStatus(id: string, status: MemberSubmission['status'], feedback?: string) {
    this.submissions = this.submissions.map((s) => s.id === id ? { ...s, status } : s);
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    if (isSupabaseConfigured) {
      supabaseService.updateSubmissionStatus(id, status, feedback).catch((e) => console.warn('Supabase updateSubmissionStatus failed:', e));
    }
  }

  // Clear all data (Clean slate)
  public clearAll() {
    this.applications = [];
    this.lookbook = [];
    this.briefs = [];
    this.assets = [];
    this.submissions = [];
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.notify();
  }
}

export const workspaceStore = new WorkspaceStore();
