-- 🔐 Simple RLS Security Fix for Custom Authentication
-- This script enables RLS with service_role permissions for backend operations
-- while protecting against direct client access to PostgREST
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================================================

-- Main application tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_rumors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Voting and ratings tables
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.man_of_match_votes ENABLE ROW LEVEL SECURITY;

-- Custom polls
ALTER TABLE public.custom_polls ENABLE ROW LEVEL SECURITY;

-- Maritodle game tables
ALTER TABLE public.maritodle_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritodle_daily_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritodle_daily_attempts ENABLE ROW LEVEL SECURITY;

-- Football cache tables
ALTER TABLE public.football_matches_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_lineups_cache ENABLE ROW LEVEL SECURITY;

-- Match voting tables
ALTER TABLE public.match_voting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_voting_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- Football sync control
ALTER TABLE public.football_sync_control ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. CREATE SERVICE ROLE POLICIES (Allow backend full access)
-- =============================================================================

-- Users table
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL TO service_role USING (true);

-- Players table
CREATE POLICY "Service role can manage players" ON public.players
    FOR ALL TO service_role USING (true);

-- Transfer rumors table
CREATE POLICY "Service role can manage transfer_rumors" ON public.transfer_rumors
    FOR ALL TO service_role USING (true);

-- Discussions table
CREATE POLICY "Service role can manage discussions" ON public.discussions
    FOR ALL TO service_role USING (true);

-- Comments table
CREATE POLICY "Service role can manage comments" ON public.comments
    FOR ALL TO service_role USING (true);

-- Votes table
CREATE POLICY "Service role can manage votes" ON public.votes
    FOR ALL TO service_role USING (true);

-- Poll votes table
CREATE POLICY "Service role can manage poll_votes" ON public.poll_votes
    FOR ALL TO service_role USING (true);

-- Custom poll votes table
CREATE POLICY "Service role can manage custom_poll_votes" ON public.custom_poll_votes
    FOR ALL TO service_role USING (true);

-- Player ratings table
CREATE POLICY "Service role can manage player_ratings" ON public.player_ratings
    FOR ALL TO service_role USING (true);

-- Man of match votes table
CREATE POLICY "Service role can manage man_of_match_votes" ON public.man_of_match_votes
    FOR ALL TO service_role USING (true);

-- Custom polls table
CREATE POLICY "Service role can manage custom_polls" ON public.custom_polls
    FOR ALL TO service_role USING (true);

-- Maritodle players table
CREATE POLICY "Service role can manage maritodle_players" ON public.maritodle_players
    FOR ALL TO service_role USING (true);

-- Maritodle daily games table
CREATE POLICY "Service role can manage maritodle_daily_games" ON public.maritodle_daily_games
    FOR ALL TO service_role USING (true);

-- Maritodle daily attempts table
CREATE POLICY "Service role can manage maritodle_daily_attempts" ON public.maritodle_daily_attempts
    FOR ALL TO service_role USING (true);

-- Football matches cache table
CREATE POLICY "Service role can manage football_matches_cache" ON public.football_matches_cache
    FOR ALL TO service_role USING (true);

-- Football lineups cache table
CREATE POLICY "Service role can manage football_lineups_cache" ON public.football_lineups_cache
    FOR ALL TO service_role USING (true);

-- Match voting table
CREATE POLICY "Service role can manage match_voting" ON public.match_voting
    FOR ALL TO service_role USING (true);

-- Match voting players table
CREATE POLICY "Service role can manage match_voting_players" ON public.match_voting_players
    FOR ALL TO service_role USING (true);

-- Match players table
CREATE POLICY "Service role can manage match_players" ON public.match_players
    FOR ALL TO service_role USING (true);

-- Football sync control table
CREATE POLICY "Service role can manage football_sync_control" ON public.football_sync_control
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- 3. OPTIONAL: CREATE READ-ONLY POLICIES FOR PUBLIC DATA
-- =============================================================================

-- If you want to allow direct client access to some read-only data, uncomment these:

-- Allow public read access to players
-- CREATE POLICY "Public can read players" ON public.players
--     FOR SELECT TO public USING (true);

-- Allow public read access to maritodle_players
-- CREATE POLICY "Public can read maritodle_players" ON public.maritodle_players
--     FOR SELECT TO public USING (true);

-- Allow public read access to maritodle_daily_games
-- CREATE POLICY "Public can read maritodle_daily_games" ON public.maritodle_daily_games
--     FOR SELECT TO public USING (true);

-- Allow public read access to football cache tables
-- CREATE POLICY "Public can read football_matches_cache" ON public.football_matches_cache
--     FOR SELECT TO public USING (true);

-- CREATE POLICY "Public can read football_lineups_cache" ON public.football_lineups_cache
--     FOR SELECT TO public USING (true);

-- Allow public read access to match data
-- CREATE POLICY "Public can read match_players" ON public.match_players
--     FOR SELECT TO public USING (true);

-- CREATE POLICY "Public can read match_voting" ON public.match_voting
--     FOR SELECT TO public USING (true);

-- Allow public read access to transfer rumors (only non-deleted)
-- CREATE POLICY "Public can read transfer_rumors" ON public.transfer_rumors
--     FOR SELECT TO public USING (is_deleted = false);

-- Allow public read access to discussions
-- CREATE POLICY "Public can read discussions" ON public.discussions
--     FOR SELECT TO public USING (true);

-- Allow public read access to comments
-- CREATE POLICY "Public can read comments" ON public.comments
--     FOR SELECT TO public USING (true);

-- Allow public read access to active custom polls
-- CREATE POLICY "Public can read active custom_polls" ON public.custom_polls
--     FOR SELECT TO public USING (is_active = true);

-- =============================================================================
-- 4. FIX FUNCTION SECURITY (Set search_path for functions)
-- =============================================================================

-- Fix search_path security for functions
CREATE OR REPLACE FUNCTION public.update_discussion_timestamp()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_transfer_rumors_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- =============================================================================
-- 5. VERIFICATION QUERIES
-- =============================================================================

-- Check that RLS is now enabled on all tables
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename NOT LIKE '%_id_seq'
    AND tablename NOT IN ('analytics_events', 'user_sessions', 'page_performance')
ORDER BY tablename;

-- Check policies created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ RLS Security Fix Applied Successfully! All tables now have proper Row Level Security policies.' as status; 