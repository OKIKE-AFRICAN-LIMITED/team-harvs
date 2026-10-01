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
  APPLICATIONS: 'th_workspace_applications_v1',
  LOOKBOOK: 'th_workspace_lookbook_v1',
  BRIEFS: 'th_workspace_briefs_v1',
  ASSETS: 'th_workspace_assets_v1',
  SUBMISSIONS: 'th_workspace_submissions_v1',
};

// Initial Seed Data reflecting Team Harvs Brand in Uyo & Nigeria
const SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-01',
    fullName: 'Imo Ekong',
    contact: '+234 814 290 8821 / imo.ekong@gmail.com',
    discipline: 'Model',
    portfolio: 'https://instagram.com/imo.ekong',
    date: '2 hours ago',
    status: 'Pending',
    notes: 'Height 5\'11", high fashion angular bone structure, strong runway stride.',
    experience: 'Walked for local bridal and contemporary menswear presentations in Uyo.'
  },
  {
    id: 'app-02',
    fullName: 'Aniekeme Bassey',
    contact: '+234 803 712 9014 / aniekeme.styles@outlook.com',
    discipline: 'Stylist',
    portfolio: 'https://instagram.com/aniekeme.styles',
    date: 'Yesterday',
    status: 'On Roster',
    notes: 'Exceptional tailoring sense, specializes in structured oversized coats and heritage fabric integration.',
    experience: 'Lead stylist on Team Harvs Issue 01 Lookbook.'
  },
  {
    id: 'app-03',
    fullName: 'David Okon',
    contact: '+234 812 559 3401 / david.visuals@gmail.com',
    discipline: 'Videographer',
    portfolio: 'https://vimeo.com/davidokoncinematics',
    date: '2 days ago',
    status: 'Under Review',
    notes: 'Shoots 35mm grain, anamorphic lenses, proficient with DaVinci Resolve color grading.',
    experience: 'Created 4 commercial fashion reels for emerging West African labels.'
  },
  {
    id: 'app-04',
    fullName: 'Nsikan Umoh',
    contact: '+234 902 443 1890 / nsikan.mua@gmail.com',
    discipline: 'MUA',
    portfolio: 'https://instagram.com/glambynsikan',
    date: '3 days ago',
    status: 'On Roster',
    notes: 'Natural glossy editorial skin, graphic graphic liner, seamless skin matching across all tones.',
    experience: 'Editorial MUA for multiple fashion lookbooks and commercial ad shoots.'
  },
  {
    id: 'app-05',
    fullName: 'Emeka Okafor',
    contact: '+234 809 611 7720 / emeka.raw@gmail.com',
    discipline: 'Photographer',
    portfolio: 'https://emekaokafor.format.com',
    date: '4 days ago',
    status: 'Pending',
    notes: 'Medium-format digital and 120 film portraiture. High contrast natural light specialist.',
    experience: 'Featured in contemporary African photography digests.'
  },
  {
    id: 'app-06',
    fullName: 'Blessing Sunday',
    contact: '+234 813 908 4412 / blessing.creat@gmail.com',
    discipline: 'Assistant',
    portfolio: 'https://instagram.com/blessing.creative',
    date: '1 week ago',
    status: 'Under Review',
    notes: 'Art direction support, on-set logistics, moodboard curation, gaffer assistance.',
    experience: 'Set assistant for 2 university creative collective productions.'
  }
];

const SEED_LOOKBOOK: LookbookWork[] = [
  {
    id: 'sw-01',
    title: 'Solitude in Crimson',
    category: 'Fashion & Tailoring',
    tag: 'Look 01 // Autumn',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    discipline: 'Fashion',
    featured: true,
    photographer: 'Harvs Studio Camera',
    stylist: 'Aniekeme Bassey',
    model: 'Imo Ekong',
    date: 'Autumn 2026',
    description: 'Deep crimson wool coat study exploring solitary architectural silhouettes against natural light.'
  },
  {
    id: 'sw-02',
    title: 'Double-Breasted Cut',
    category: 'Avant-Garde Silhouette',
    tag: 'Look 02 // Tailoring',
    image: '/assets/images/avant_garde_fashion.jpg',
    discipline: 'Fashion',
    featured: true,
    photographer: 'Harvs Studio Camera',
    stylist: 'Aniekeme Bassey',
    date: 'Autumn 2026',
    description: 'Structural lapels and oversized shoulder contouring with bespoke burgundy wool blend.'
  },
  {
    id: 'sw-03',
    title: 'Architectural Trench',
    category: 'High-Fashion Outerwear',
    tag: 'Look 03 // Structure',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    discipline: 'Fashion',
    featured: false,
    photographer: 'Emeka Okafor',
    date: 'Autumn 2026',
    description: 'Voluminous cotton twill trench tailored for motion.'
  },
  {
    id: 'sw-04',
    title: 'Editorial Hero Look',
    category: 'Team Harvs Autumn Series',
    tag: 'Look 04 // Direction',
    image: '/assets/images/editorial_hero.jpg',
    discipline: 'Editorial',
    featured: true,
    photographer: 'Harvs Studio Camera',
    stylist: 'Aniekeme Bassey',
    model: 'Imo Ekong',
    date: 'Autumn 2026',
    description: 'Signature Team Harvs identity piece embodying intentional creative production.'
  },
  {
    id: 'sw-05',
    title: 'Commercial Campaign Lookbook',
    category: 'Commercial Campaign Issue 01',
    tag: 'Look 05 // Campaign',
    image: '/assets/images/campaign_lookbook.jpg',
    discipline: 'Commercial',
    featured: true,
    photographer: 'Harvs Studio Camera',
    date: 'Summer 2026',
    description: 'Contemporary commercial lookbook shot across urban brutalist backdrops in Uyo.'
  },
  {
    id: 'sw-06',
    title: 'Model Development Dossier',
    category: 'Talent Dossier Scouting',
    tag: 'Look 06 // Cast',
    image: '/assets/images/model_portrait.jpg',
    discipline: 'Model Development',
    featured: false,
    photographer: 'Harvs Studio Camera',
    date: 'Autumn 2026',
    description: 'Raw casting portraiture focused on natural skin and expressive depth.'
  },
  {
    id: 'sw-07',
    title: '35mm Film Studio Set',
    category: 'BTS & Cinematography',
    tag: 'Look 07 // On Set',
    image: '/assets/images/creative_production_bts.jpg',
    discipline: 'BTS & Motion',
    featured: false,
    photographer: 'David Okon',
    date: 'Autumn 2026',
    description: 'Documenting light study, camera rigs, and collaborative team synergy.'
  },
  {
    id: 'sw-08',
    title: 'Fashion Motion Still',
    category: 'Movement Study',
    tag: 'Look 08 // Cinema Motion',
    image: '/assets/images/fashion_motion_still.jpg',
    discipline: 'Editorial',
    featured: true,
    photographer: 'David Okon',
    date: 'Autumn 2026',
    description: 'Cinematic shutter drag capturing garment flow in architectural space.'
  }
];

const SEED_BRIEFS: ProjectBrief[] = [
  {
    id: 'brief-01',
    title: 'Autumn Tailoring Series // Lookbook 02',
    status: 'In Production',
    discipline: 'Fashion & Editorial',
    location: 'Studio Harvs & Uyo Plaza',
    callTime: 'Oct 12, 2026 — 08:30 AM',
    date: 'Oct 12, 2026',
    lead: 'Creative Director',
    assignedTalent: ['Aniekeme Bassey (Stylist)', 'Nsikan Umoh (MUA)', 'David Okon (BTS Motion)', 'Imo Ekong (Model)'],
    deliverables: [
      '8 Key Looks Master High-Res Color Graded',
      '1x 60s 4K Cinema Reel for Instagram / Web',
      'Behind The Scenes 35mm Photo Package',
      'Lookbook Catalog PDF Layout'
    ],
    description: 'Production focused on deep burgundy suiting, cream cashmere knits, and architectural outerwear tailored for West African young creatives.',
    budget: 'Tier 1 Studio'
  },
  {
    id: 'brief-02',
    title: 'Metropolitan Motion // Commercial Series',
    status: 'Planning',
    discipline: 'Commercial Campaign',
    location: 'Ibom Icon Promenade & Industrial Sites',
    callTime: 'Oct 24, 2026 — 06:00 AM Sunrise',
    date: 'Oct 24, 2026',
    lead: 'Executive Producer',
    assignedTalent: ['David Okon (Lead Cinematography)', 'Blessing Sunday (Coordination)'],
    deliverables: [
      '12 Campaign Hero Stills',
      '30s Dynamic Commercial Video Spot',
      'Social Cutdowns (9:16 vertical 4K)'
    ],
    description: 'Capturing dynamic urban movement, active lifestyle silhouettes, and crisp morning golden hour sunlight.',
    budget: 'Commercial Client'
  },
  {
    id: 'brief-03',
    title: 'New Faces Model Development Dossier',
    status: 'Review / Post',
    discipline: 'Model Development',
    location: 'Studio Harvs Daylight Bay',
    callTime: 'Completed Oct 01, 2026',
    date: 'Oct 01, 2026',
    lead: 'Talent Director',
    assignedTalent: ['Nsikan Umoh (Clean MUA)', 'Emeka Okafor (Digital & 120 Film)'],
    deliverables: [
      'Individual Clean Digitals (Front, Profiles, Full Length)',
      'Editorial Test Look per model',
      'Standard Model Composite Cards PDF'
    ],
    description: 'Comprehensive roster intake session for emerging models stepping into editorial and commercial casting.',
    budget: 'Internal Development'
  }
];

const SEED_ASSETS: CreativeAsset[] = [
  {
    id: 'ast-01',
    title: 'Team Harvs Brand Guidelines & Identity Spec v2.0',
    category: 'Guidelines',
    fileType: 'PDF Document',
    fileSize: '4.8 MB',
    date: 'Updated Sept 2026',
    downloadUrl: '#',
    tags: ['Logo Rules', 'Color Palette', 'Typography', 'Tone of Voice']
  },
  {
    id: 'ast-02',
    title: 'Lookbook 02 Autumn Production Call Sheet',
    category: 'Call Sheets',
    fileType: 'PDF Template',
    fileSize: '1.2 MB',
    date: 'Oct 08, 2026',
    downloadUrl: '#',
    tags: ['Schedule', 'Location Pins', 'Wardrobe List', 'Emergency Contacts']
  },
  {
    id: 'ast-03',
    title: 'Team Harvs Burgundy 35mm LUT Pack (DaVinci / Premiere)',
    category: 'Presets',
    fileType: '.CUBE / Zip',
    fileSize: '820 KB',
    date: 'Aug 2026',
    downloadUrl: '#',
    tags: ['Color Grade', 'Film Emulation', 'Warm Shadows', 'Kodak 500T']
  },
  {
    id: 'ast-04',
    title: 'Autumn Tailoring Moodboard & Visual References Deck',
    category: 'Moodboards',
    fileType: 'Keynote / PDF',
    fileSize: '24.5 MB',
    date: 'Sept 2026',
    downloadUrl: '#',
    tags: ['Silhouettes', 'Lighting Maps', 'Posing References', 'Fabric Swatches']
  },
  {
    id: 'ast-05',
    title: 'Official TH Monograms & Master Vector Logos',
    category: 'Brand Assets',
    fileType: 'SVG / PNG / AI',
    fileSize: '12.4 MB',
    date: 'Aug 2026',
    downloadUrl: '#',
    tags: ['Burgundy', 'Cream', 'Monogram Crop', 'Transparent']
  }
];

const SEED_SUBMISSIONS: MemberSubmission[] = [
  {
    id: 'sub-01',
    briefId: 'brief-03',
    briefTitle: 'New Faces Model Development Dossier',
    memberName: 'Nsikan Umoh',
    role: 'MUA',
    link: 'https://drive.google.com/drive/folders/harvs-digitals-mua-notes',
    notes: 'Skin prep formulas and lighting-proof hydration notes for all 4 models.',
    date: 'Yesterday at 4:15 PM',
    status: 'Approved'
  },
  {
    id: 'sub-02',
    briefId: 'brief-01',
    briefTitle: 'Autumn Tailoring Series // Lookbook 02',
    memberName: 'Aniekeme Bassey',
    role: 'Stylist',
    link: 'https://figma.com/file/harvs-tailoring-pulls-look02',
    notes: 'Look 01 to 08 garments pulled from local artisans and tailoring partners in Uyo. Call time ready.',
    date: 'Today at 11:30 AM',
    status: 'Approved'
  }
];

class WorkspaceStore {
  private applications: Application[] = [];
  private lookbook: LookbookWork[] = [];
  private briefs: ProjectBrief[] = [];
  private assets: CreativeAsset[] = [];
  private submissions: MemberSubmission[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const apps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      this.applications = apps ? JSON.parse(apps) : SEED_APPLICATIONS;

      const lb = localStorage.getItem(STORAGE_KEYS.LOOKBOOK);
      this.lookbook = lb ? JSON.parse(lb) : SEED_LOOKBOOK;

      const br = localStorage.getItem(STORAGE_KEYS.BRIEFS);
      this.briefs = br ? JSON.parse(br) : SEED_BRIEFS;

      const ast = localStorage.getItem(STORAGE_KEYS.ASSETS);
      this.assets = ast ? JSON.parse(ast) : SEED_ASSETS;

      const sub = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      this.submissions = sub ? JSON.parse(sub) : SEED_SUBMISSIONS;
    } catch {
      this.applications = SEED_APPLICATIONS;
      this.lookbook = SEED_LOOKBOOK;
      this.briefs = SEED_BRIEFS;
      this.assets = SEED_ASSETS;
      this.submissions = SEED_SUBMISSIONS;
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

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
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
    return newApp;
  }

  public updateApplicationStatus(id: string, status: Application['status'], notes?: string) {
    this.applications = this.applications.map((app) => 
      app.id === id ? { ...app, status, notes: notes ?? app.notes } : app
    );
    this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);
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

  public addSubmission(sub: Omit<MemberSubmission, 'id' | 'date' | 'status'>): MemberSubmission {
    const newSub: MemberSubmission = {
      ...sub,
      id: `sub-${Date.now()}`,
      date: 'Just now',
      status: 'Submitted'
    };
    this.submissions = [newSub, ...this.submissions];
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    return newSub;
  }

  public updateSubmissionStatus(id: string, status: MemberSubmission['status']) {
    this.submissions = this.submissions.map((s) => s.id === id ? { ...s, status } : s);
    this.persist(STORAGE_KEYS.SUBMISSIONS, this.submissions);
  }

  // Reset to factory seed data if ever needed
  public resetToSeeds() {
    this.applications = SEED_APPLICATIONS;
    this.lookbook = SEED_LOOKBOOK;
    this.briefs = SEED_BRIEFS;
    this.assets = SEED_ASSETS;
    this.submissions = SEED_SUBMISSIONS;
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOOKBOOK);
    localStorage.removeItem(STORAGE_KEYS.BRIEFS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    this.notify();
  }
}

export const workspaceStore = new WorkspaceStore();
