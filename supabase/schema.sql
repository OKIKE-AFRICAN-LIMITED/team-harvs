-- ==========================================================
-- Team Harvs / Creative Collective — Supabase Database Schema
-- Roles: Admin Command Center & Talent Member Dashboard
-- ==========================================================

-- Enable pgcrypto extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 1. PROFILES TABLE (Linked to Supabase auth.users)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    discipline TEXT DEFAULT 'Model',
    phone TEXT,
    instagram_url TEXT,
    portfolio_url TEXT,
    avatar_url TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, discipline)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
        COALESCE(NEW.raw_user_meta_data->>'discipline', 'Model')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role = COALESCE(public.profiles.role, EXCLUDED.role);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function: Is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==========================================================
-- 2. APPLICATIONS TABLE (Public Open-Call Talent Submissions)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    discipline TEXT NOT NULL,
    portfolio TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'On Roster', 'Archived')),
    notes TEXT,
    experience TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 3. LOOKBOOK WORKS TABLE (Public & Editorial CMS Gallery)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.lookbook_works (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tag TEXT,
    image TEXT NOT NULL,
    discipline TEXT DEFAULT 'Editorial',
    featured BOOLEAN DEFAULT false,
    photographer TEXT,
    stylist TEXT,
    model TEXT,
    season TEXT DEFAULT 'Autumn 2026',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 4. PROJECT BRIEFS TABLE (Production Schedules & Call Sheets)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.project_briefs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'In Production', 'Review / Post', 'Completed')),
    discipline TEXT,
    location TEXT,
    call_time TEXT,
    shoot_date TEXT,
    lead TEXT,
    budget TEXT,
    description TEXT,
    deliverables JSONB DEFAULT '[]'::jsonb,
    assigned_talent JSONB DEFAULT '[]'::jsonb,
    assigned_member_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 5. CREATIVE ASSETS TABLE (Digital Asset Manager / Studio Kits)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.creative_assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Brand Assets', 'Call Sheets', 'Moodboards', 'Presets', 'Guidelines')),
    file_type TEXT,
    file_size TEXT,
    download_url TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 6. MEMBER SUBMISSIONS TABLE (Work Deliverables & Review)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.member_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    brief_id TEXT,
    brief_title TEXT,
    member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    role TEXT,
    link TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Revision Requested')),
    admin_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_submissions ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Any authenticated user can read profiles (to view collective roster)
CREATE POLICY "Allow authenticated read profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Public can view active roster profiles
CREATE POLICY "Allow public read active profiles"
ON public.profiles FOR SELECT
USING (status = 'active');

-- Users can update their own profile; admins can update any profile
CREATE POLICY "Allow users update own profile or admin"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- --- APPLICATIONS POLICIES ---
-- Public can submit open call applications
CREATE POLICY "Allow public insert applications"
ON public.applications FOR INSERT
WITH CHECK (true);

-- Admins can read, update, and manage applications
CREATE POLICY "Allow admin manage applications"
ON public.applications FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- LOOKBOOK WORKS POLICIES ---
-- Public can view published lookbook works
CREATE POLICY "Allow public read lookbook"
ON public.lookbook_works FOR SELECT
USING (true);

-- Admins can publish, update, and delete lookbook works
CREATE POLICY "Allow admin manage lookbook"
ON public.lookbook_works FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- PROJECT BRIEFS POLICIES ---
-- Authenticated members and admins can view project briefs
CREATE POLICY "Allow authenticated read briefs"
ON public.project_briefs FOR SELECT
USING (auth.role() = 'authenticated');

-- Admins can create and manage project briefs
CREATE POLICY "Allow admin manage briefs"
ON public.project_briefs FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- CREATIVE ASSETS POLICIES ---
-- Authenticated users can view and download assets
CREATE POLICY "Allow authenticated read assets"
ON public.creative_assets FOR SELECT
USING (auth.role() = 'authenticated');

-- Admins can manage assets
CREATE POLICY "Allow admin manage assets"
ON public.creative_assets FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- MEMBER SUBMISSIONS POLICIES ---
-- Members can view their own submissions; admins can view all
CREATE POLICY "Allow members and admins read submissions"
ON public.member_submissions FOR SELECT
USING (auth.uid() = member_id OR public.is_admin() OR auth.role() = 'authenticated');

-- Members can insert submissions
CREATE POLICY "Allow authenticated insert submissions"
ON public.member_submissions FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Members can update own submission, admins can review and update status
CREATE POLICY "Allow update submissions"
ON public.member_submissions FOR UPDATE
USING (auth.uid() = member_id OR public.is_admin() OR auth.role() = 'authenticated');

-- ==========================================================
-- SEED DATA (Team Harvs Initial Lookbook Portfolio)
-- ==========================================================
INSERT INTO public.lookbook_works (id, title, category, tag, image, discipline, featured, photographer, stylist, model, season)
VALUES
('sw-01', 'Silhouettes in Clay', 'Editorial Direction', 'Look 01 // Clay', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', 'Stylist', true, 'Emeka Okafor', 'Aniekeme Bassey', 'Imo Ekong', 'Autumn 2026'),
('sw-02', 'High-Contrast Monochrome', 'Campaign Tailoring', 'Look 02 // Mono', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80', 'Photographer', true, 'David Okon', 'Aniekeme Bassey', 'Imo Ekong', 'Autumn 2026'),
('sw-03', 'Oversized Silhouette', 'Menswear Editorial', 'Look 03 // Cut', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80', 'Stylist', false, 'Emeka Okafor', 'Aniekeme Bassey', 'David Okon', 'Autumn 2026')
ON CONFLICT (id) DO NOTHING;
