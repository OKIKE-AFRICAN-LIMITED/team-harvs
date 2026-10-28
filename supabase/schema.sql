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
    discipline TEXT DEFAULT 'Models',
    phone TEXT,
    instagram_url TEXT,
    portfolio_url TEXT,
    avatar_url TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, discipline, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
        COALESCE(NEW.raw_user_meta_data->>'discipline', 'Models'),
        COALESCE(NEW.raw_user_meta_data->>'status', 'pending')
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
-- 2. HERO STREAM ITEMS TABLE (Editable Hero Kinetic Stream)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.hero_stream_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tag TEXT,
    image TEXT NOT NULL,
    row_number INT NOT NULL DEFAULT 1 CHECK (row_number IN (1, 2)),
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 3. APPLICATIONS TABLE (Public Open-Call Talent Submissions)
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
-- 4. LOOKBOOK WORKS TABLE (Public & Editorial CMS Gallery)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.lookbook_works (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tag TEXT,
    image TEXT NOT NULL,
    video_url TEXT,
    media_type TEXT DEFAULT 'image',
    discipline TEXT DEFAULT 'Models',
    featured BOOLEAN DEFAULT false,
    photographer TEXT,
    stylist TEXT,
    model TEXT,
    season TEXT DEFAULT 'Autumn 2026',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- In case table already existed, ensure new columns are added safely
ALTER TABLE public.lookbook_works ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lookbook_works ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- ==========================================================
-- 5. PROJECT BRIEFS TABLE (Production Schedules & Call Sheets)
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
-- 6. BRIEF INTERACTIONS TABLE (Auditing: Clicked vs. Submitted)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.brief_interactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    brief_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT,
    discipline TEXT,
    viewed_at TIMESTAMPTZ DEFAULT now(),
    submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ,
    UNIQUE(brief_id, user_id)
);

-- ==========================================================
-- 7. CREATIVE ASSETS TABLE (Digital Asset Manager / Studio Kits)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.creative_assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_type TEXT,
    file_size TEXT,
    download_url TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 8. MEMBER SUBMISSIONS TABLE (Work Deliverables & Review)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.member_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    brief_id TEXT,
    brief_title TEXT,
    member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    role TEXT,
    link TEXT DEFAULT '',
    pdf_url TEXT DEFAULT '',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Revision Requested')),
    admin_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_stream_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_submissions ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Any authenticated user or public can read active profiles (directory)
DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
CREATE POLICY "Allow read profiles"
ON public.profiles FOR SELECT
USING (true);

-- Users can update own profile; admins can update any profile (role, status, discipline)
DROP POLICY IF EXISTS "Allow users update own profile or admin" ON public.profiles;
CREATE POLICY "Allow users update own profile or admin"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- --- HERO STREAM ITEMS POLICIES ---
DROP POLICY IF EXISTS "Allow public read hero_stream_items" ON public.hero_stream_items;
CREATE POLICY "Allow public read hero_stream_items"
ON public.hero_stream_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin manage hero_stream_items" ON public.hero_stream_items;
CREATE POLICY "Allow admin manage hero_stream_items"
ON public.hero_stream_items FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- APPLICATIONS POLICIES ---
DROP POLICY IF EXISTS "Allow public insert applications" ON public.applications;
CREATE POLICY "Allow public insert applications"
ON public.applications FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin manage applications" ON public.applications;
CREATE POLICY "Allow admin manage applications"
ON public.applications FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- LOOKBOOK WORKS POLICIES ---
DROP POLICY IF EXISTS "Allow public read lookbook" ON public.lookbook_works;
CREATE POLICY "Allow public read lookbook"
ON public.lookbook_works FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin manage lookbook" ON public.lookbook_works;
CREATE POLICY "Allow admin manage lookbook"
ON public.lookbook_works FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- PROJECT BRIEFS POLICIES ---
DROP POLICY IF EXISTS "Allow authenticated read briefs" ON public.project_briefs;
CREATE POLICY "Allow authenticated read briefs"
ON public.project_briefs FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin manage briefs" ON public.project_briefs;
CREATE POLICY "Allow admin manage briefs"
ON public.project_briefs FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- BRIEF INTERACTIONS POLICIES ---
DROP POLICY IF EXISTS "Allow manage own interactions" ON public.brief_interactions;
CREATE POLICY "Allow manage own interactions"
ON public.brief_interactions FOR ALL
USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'authenticated');

-- --- CREATIVE ASSETS POLICIES ---
DROP POLICY IF EXISTS "Allow read assets" ON public.creative_assets;
CREATE POLICY "Allow read assets"
ON public.creative_assets FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin manage assets" ON public.creative_assets;
CREATE POLICY "Allow admin manage assets"
ON public.creative_assets FOR ALL
USING (public.is_admin() OR auth.role() = 'authenticated');

-- --- MEMBER SUBMISSIONS POLICIES ---
DROP POLICY IF EXISTS "Allow read submissions" ON public.member_submissions;
DROP POLICY IF EXISTS "Allow members and admins read submissions" ON public.member_submissions;
CREATE POLICY "Allow read submissions"
ON public.member_submissions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow insert submissions" ON public.member_submissions;
CREATE POLICY "Allow insert submissions"
ON public.member_submissions FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update submissions" ON public.member_submissions;
CREATE POLICY "Allow update submissions"
ON public.member_submissions FOR UPDATE
USING (true);

-- ==========================================================
-- STORAGE BUCKETS (images, videos, PDFs uploaded from the dashboard)
-- Without these, uploads cannot be stored as files.
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('lookbook', 'lookbook', true),
    ('assets', 'assets', true),
    ('deliverables', 'deliverables', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Harvs public read media" ON storage.objects;
CREATE POLICY "Harvs public read media"
ON storage.objects FOR SELECT
USING (bucket_id IN ('lookbook', 'assets', 'deliverables'));

DROP POLICY IF EXISTS "Harvs signed-in upload media" ON storage.objects;
CREATE POLICY "Harvs signed-in upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('lookbook', 'assets', 'deliverables'));

DROP POLICY IF EXISTS "Harvs signed-in update media" ON storage.objects;
CREATE POLICY "Harvs signed-in update media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('lookbook', 'assets', 'deliverables'));

DROP POLICY IF EXISTS "Harvs signed-in delete media" ON storage.objects;
CREATE POLICY "Harvs signed-in delete media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('lookbook', 'assets', 'deliverables'));

-- ==========================================================
-- SEED DATA FOR HERO STREAM (2 Rows, Initial Looks)
-- ==========================================================
INSERT INTO public.hero_stream_items (id, title, category, tag, image, row_number, order_index)
VALUES
('hs-01', 'Solitude in Crimson', 'Fashion & Editorial Tailoring', 'Look 01 // Autumn', '/assets/images/editorial_hero.jpg', 1, 1),
('hs-02', 'Double-Breasted Cut', 'Avant-Garde Silhouette', 'Look 02 // Tailoring', '/assets/images/avant_garde_fashion.jpg', 1, 2),
('hs-03', 'Urban Concrete', 'Commercial Campaign Lookbook', 'Look 03 // Commercial', '/assets/images/campaign_lookbook.jpg', 1, 3),
('hs-04', 'Model Development', 'Editorial Talent Dossier', 'Look 04 // Roster', '/assets/images/model_portrait.jpg', 1, 4),
('hs-05', 'Architectural Motion', 'High-Fashion Outerwear', 'Look 05 // Movement', '/assets/images/fashion_motion_still.jpg', 1, 5),
('hs-06', 'Studio Process', 'BTS & 35mm Cinema Motion', 'Look 06 // 35mm Motion', '/assets/images/creative_production_bts.jpg', 1, 6),
('hs-07', 'Burgundy & Cream', 'Color Direction & Form', 'Look 07 // Direction', '/assets/images/avant_garde_fashion.jpg', 2, 1),
('hs-08', 'Akwa Ibom Set', 'Studio Harvs Production', 'Look 08 // Set Design', '/assets/images/editorial_hero.jpg', 2, 2),
('hs-09', 'Metropolitan Set', 'Commercial Series Lookbook', 'Look 09 // Series', '/assets/images/campaign_lookbook.jpg', 2, 3),
('hs-10', 'Editorial Duo', 'Coat Architecture', 'Look 10 // Dynamic', '/assets/images/fashion_motion_still.jpg', 2, 4),
('hs-11', 'Roster Cast', 'Model Development Scouting', 'Look 11 // Scouting', '/assets/images/model_portrait.jpg', 2, 5),
('hs-12', 'Daylight Cinema', 'BTS Cinematography', 'Look 12 // Cinema', '/assets/images/creative_production_bts.jpg', 2, 6)
ON CONFLICT (id) DO NOTHING;
