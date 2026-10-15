-- =========================================================================
-- Unified DSA Tracking Platform Database Schema (PostgreSQL / Supabase)
-- Architected per technical specifications: Pedagogy, System Design, Automation
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timezone VARCHAR(64) DEFAULT 'UTC',
    telegram_chat_id VARCHAR(64),
    telegram_notifications_enabled BOOLEAN DEFAULT FALSE,
    target_solves_per_day INT DEFAULT 2,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE
);

-- 2. External Platform Accounts
CREATE TABLE IF NOT EXISTS public.external_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform VARCHAR(32) NOT NULL, -- 'leetcode', 'codeforces', 'geeksforgeeks', 'codechef'
    handle VARCHAR(128) NOT NULL,
    rating INT DEFAULT NULL,
    max_rating INT DEFAULT NULL,
    rank_title VARCHAR(64) DEFAULT NULL,
    total_solved INT DEFAULT 0,
    last_synced TIMESTAMPTZ DEFAULT NULL,
    profile_data JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

-- 3. Problem Catalog
CREATE TABLE IF NOT EXISTS public.problems (
    id VARCHAR(128) PRIMARY KEY, -- e.g. 'lc-two-sum', 'cf-158A'
    platform VARCHAR(32) NOT NULL,
    platform_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    difficulty VARCHAR(16) NOT NULL, -- 'Easy', 'Medium', 'Hard'
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Solves Ledger (Every problem solved)
CREATE TABLE IF NOT EXISTS public.solves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    problem_id VARCHAR(128) REFERENCES public.problems(id) ON DELETE SET NULL,
    platform VARCHAR(32) NOT NULL,
    problem_slug VARCHAR(255) NOT NULL,
    problem_title VARCHAR(255),
    difficulty VARCHAR(16),
    language VARCHAR(32),
    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_platform_problem UNIQUE (user_id, platform, problem_slug)
);

-- 5. Daily Activity Materialized Aggregates
CREATE TABLE IF NOT EXISTS public.daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    problems_solved INT DEFAULT 0,
    is_streak_maintained BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- 6. Curricula (Striver A2Z DSA Sheet & NeetCode 150)
CREATE TABLE IF NOT EXISTS public.curriculum (
    id BIGSERIAL PRIMARY KEY,
    framework VARCHAR(32) NOT NULL, -- 'striver-a2z', 'neetcode-150'
    step_number INT,
    step_title VARCHAR(128),
    category VARCHAR(128) NOT NULL,
    difficulty VARCHAR(16) NOT NULL,
    problem_name VARCHAR(255) NOT NULL,
    leetcode_slug VARCHAR(255),
    gfg_slug VARCHAR(255),
    pattern VARCHAR(128),
    platform_links JSONB DEFAULT '{}'::jsonb
);

-- 7. Contests Catalog
CREATE TABLE IF NOT EXISTS public.contests (
    id VARCHAR(128) PRIMARY KEY, -- e.g. 'cf-2041', 'lc-weekly-436'
    platform VARCHAR(32) NOT NULL,
    contest_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_seconds INT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contest Participations
CREATE TABLE IF NOT EXISTS public.participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contest_id VARCHAR(128) NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    rank INT,
    rating_change INT,
    new_rating INT,
    solved_count INT,
    participated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Problem Revision Notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    problem_slug VARCHAR(255) NOT NULL,
    problem_title VARCHAR(255) NOT NULL,
    platform VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    approach_summary TEXT,
    time_complexity VARCHAR(64),
    space_complexity VARCHAR(64),
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_problem_note UNIQUE (user_id, platform, problem_slug)
);

-- 10. Tags Catalog
CREATE TABLE IF NOT EXISTS public.tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

-- 11. Problem to Tags Mapping
CREATE TABLE IF NOT EXISTS public.problem_tags (
    problem_id VARCHAR(128) NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

-- 12. Notification Rules & Delivery History
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- 'daily_reminder', 'streak_milestone', 'contest_alert', 'weekly_summary'
    channel VARCHAR(32) NOT NULL DEFAULT 'telegram', -- 'telegram', 'email', 'push'
    message TEXT NOT NULL,
    last_sent TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_solves_user_time ON public.solves(user_id, solved_at DESC);
CREATE INDEX IF NOT EXISTS idx_solves_slug ON public.solves(problem_slug);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_curriculum_framework ON public.curriculum(framework);
CREATE INDEX IF NOT EXISTS idx_curriculum_lc_slug ON public.curriculum(leetcode_slug);
CREATE INDEX IF NOT EXISTS idx_contests_start ON public.contests(start_time);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures complete user privacy and session isolation
-- =========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Public read for catalogs
CREATE POLICY "Public read problems" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Public read curriculum" ON public.curriculum FOR SELECT USING (true);
CREATE POLICY "Public read contests" ON public.contests FOR SELECT USING (true);

-- User-isolated access
CREATE POLICY "Users read/write own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users read/write own external_accounts" ON public.external_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read/write own solves" ON public.solves
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read/write own daily_activity" ON public.daily_activity
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read/write own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read/write own participations" ON public.participations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read/write own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);
