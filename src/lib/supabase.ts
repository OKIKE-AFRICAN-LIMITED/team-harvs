import { createClient, type User, type Session } from '@supabase/supabase-js';
import type { Application, LookbookWork, ProjectBrief, CreativeAsset, MemberSubmission } from './workspaceStore';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Returns true if valid Supabase credentials are provided in the environment.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

/**
 * Supabase client instance.
 * Gracefully defaults to a mock endpoint if credentials have not been configured yet,
 * preventing any runtime initialization crashes.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

/**
 * Profile definition matching public.profiles
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member';
  discipline?: string;
  phone?: string;
  instagram_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
}

/**
 * Supabase Authentication & Role Service
 */
export const authService = {
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch user profile:', error.message);
      return null;
    }
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    return data as Profile;
  },

  async signIn(email: string, password: string):Promise<{ user: User | null; profile: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, profile: null, error: 'Supabase credentials not configured yet.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { user: null, profile: null, error: error.message };
    }
    if (data.user) {
      const profile = await this.getProfile(data.user.id);
      return { user: data.user, profile, error: null };
    }
    return { user: null, profile: null, error: 'Sign in failed.' };
  },

  async signUp(
    email: string, 
    password: string, 
    metadata: { full_name: string; role?: 'admin' | 'member'; discipline?: string }
  ): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase credentials not configured yet.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          role: metadata.role || 'member',
          discipline: metadata.discipline || 'Model',
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }
    return { user: data.user, error: null };
  },

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  },
};

/**
 * Supabase Data Service helpers with automatic fallback awareness
 */
export const supabaseService = {
  // --- Profiles / Roster Directory ---
  async getProfiles(): Promise<Profile[] | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    if (error) {
      console.warn('Supabase getProfiles error:', error);
      return null;
    }
    return data as Profile[];
  },

  // --- Applications CRM ---
  async getApplications(): Promise<Application[] | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getApplications error:', error);
      return null;
    }
    // Map snake_case to app interface
    return (data || []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      contact: row.contact,
      discipline: row.discipline,
      portfolio: row.portfolio,
      date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
      status: row.status,
      notes: row.notes,
      experience: row.experience,
    }));
  },

  async insertApplication(app: Omit<Application, 'id' | 'date' | 'status'>): Promise<Application | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        full_name: app.fullName,
        contact: app.contact,
        discipline: app.discipline,
        portfolio: app.portfolio,
        notes: app.notes || '',
        experience: app.experience || '',
        status: 'Pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insertApplication error:', error);
      return null;
    }
    return {
      id: data.id,
      fullName: data.full_name,
      contact: data.contact,
      discipline: data.discipline,
      portfolio: data.portfolio,
      date: 'Just now',
      status: data.status,
      notes: data.notes,
      experience: data.experience,
    };
  },

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const updates: any = { status };
    if (notes !== undefined) updates.notes = notes;
    const { error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id);
    return !error;
  },

  // --- Lookbook Works CMS ---
  async getLookbook(): Promise<LookbookWork[] | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('lookbook_works')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getLookbook error:', error);
      return null;
    }
    return data as LookbookWork[];
  },

  async insertLookbookWork(work: Omit<LookbookWork, 'id' | 'date'>): Promise<LookbookWork | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('lookbook_works')
      .insert([{
        ...work,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insertLookbookWork error:', error);
      return null;
    }
    return data as LookbookWork;
  },

  async deleteLookbookWork(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from('lookbook_works').delete().eq('id', id);
    return !error;
  },

  // --- Project Briefs ---
  async getBriefs(): Promise<ProjectBrief[] | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('project_briefs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getBriefs error:', error);
      return null;
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      discipline: row.discipline,
      location: row.location,
      callTime: row.call_time,
      date: row.shoot_date || 'Upcoming',
      lead: row.lead,
      assignedTalent: row.assigned_talent || [],
      deliverables: row.deliverables || [],
      description: row.description,
      budget: row.budget,
    }));
  },

  async insertBrief(brief: Omit<ProjectBrief, 'id' | 'date'>): Promise<ProjectBrief | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('project_briefs')
      .insert([{
        title: brief.title,
        status: brief.status,
        discipline: brief.discipline,
        location: brief.location,
        call_time: brief.callTime,
        lead: brief.lead,
        budget: brief.budget,
        description: brief.description,
        deliverables: brief.deliverables,
        assigned_talent: brief.assignedTalent,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insertBrief error:', error);
      return null;
    }
    return {
      ...brief,
      id: data.id,
      date: 'Upcoming',
    };
  },

  // --- Creative Assets ---
  async getAssets(): Promise<CreativeAsset[] | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('creative_assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getAssets error:', error);
      return null;
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      fileType: row.file_type,
      fileSize: row.file_size,
      downloadUrl: row.download_url,
      tags: row.tags || [],
      date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
    }));
  },

  // --- Member Submissions ---
  async getSubmissions(memberId?: string): Promise<MemberSubmission[] | null> {
    if (!isSupabaseConfigured) return null;
    let query = supabase.from('member_submissions').select('*').order('created_at', { ascending: false });
    if (memberId) {
      query = query.eq('member_id', memberId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getSubmissions error:', error);
      return null;
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      briefId: row.brief_id,
      briefTitle: row.brief_title,
      memberName: row.member_name,
      role: row.role,
      link: row.link,
      notes: row.notes,
      date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
      status: row.status,
    }));
  },

  async insertSubmission(sub: Omit<MemberSubmission, 'id' | 'date' | 'status'>, memberId?: string): Promise<MemberSubmission | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('member_submissions')
      .insert([{
        brief_id: sub.briefId,
        brief_title: sub.briefTitle,
        member_id: memberId || null,
        member_name: sub.memberName,
        role: sub.role,
        link: sub.link,
        notes: sub.notes,
        status: 'Submitted',
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insertSubmission error:', error);
      return null;
    }
    return {
      id: data.id,
      briefId: data.brief_id,
      briefTitle: data.brief_title,
      memberName: data.member_name,
      role: data.role,
      link: data.link,
      notes: data.notes,
      date: 'Just now',
      status: data.status,
    };
  },

  async updateSubmissionStatus(id: string, status: string, feedback?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const updates: any = { status };
    if (feedback !== undefined) updates.admin_feedback = feedback;
    const { error } = await supabase
      .from('member_submissions')
      .update(updates)
      .eq('id', id);
    return !error;
  },
};
