-- 🚀 Basic Performance Optimizations (Core Tables Only)
-- This script creates indexes only for tables that definitely exist
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- CORE INDEXES FOR MAIN APPLICATION TABLES
-- =============================================================================

-- Users table indexes (authentication & lookups)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Players table indexes (core functionality)
CREATE INDEX IF NOT EXISTS idx_players_name ON public.players(name);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position);

-- Votes table indexes (most important for performance)
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_player_id ON public.votes(player_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_player ON public.votes(user_id, player_id);

-- Transfer rumors indexes
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_created_at ON public.transfer_rumors(created_at DESC);

-- Discussions indexes
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON public.discussions(created_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);

-- =============================================================================
-- OPTIMIZED VIEWS FOR COMPLEX QUERIES
-- =============================================================================

-- Player rankings view (most important for performance)
CREATE OR REPLACE VIEW public.player_rankings AS
SELECT 
    p.id,
    p.name,
    p.position,
    COUNT(v.player_id) as vote_count
FROM public.players p
LEFT JOIN public.votes v ON p.id = v.player_id
GROUP BY p.id, p.name, p.position
ORDER BY vote_count DESC;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check created indexes
SELECT 
    tablename,
    indexname,
    'Index created successfully' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Success message
SELECT '✅ Basic Performance Optimizations Applied Successfully!' as status; 