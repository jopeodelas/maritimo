-- 🚀 Database Performance Optimizations
-- This script creates indexes and optimizations for your application queries
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. INDEXES FOR FREQUENTLY QUERIED TABLES
-- =============================================================================

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_banned ON public.users(is_banned);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Players table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_name ON public.players(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_position ON public.players(position);

-- Votes table indexes (heavily used in player rankings)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_player_id ON public.votes(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_user_player ON public.votes(user_id, player_id);

-- Transfer rumors indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transfer_rumors_created_at ON public.transfer_rumors(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transfer_rumors_is_deleted ON public.transfer_rumors(is_deleted);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transfer_rumors_unique_id ON public.transfer_rumors(unique_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transfer_rumors_active ON public.transfer_rumors(is_deleted, created_at DESC);

-- Discussions table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_author_id ON public.discussions(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_created_at ON public.discussions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_updated_at ON public.discussions(updated_at DESC);

-- Comments table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_discussion_id ON public.comments(discussion_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);

-- Poll votes indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poll_votes_position_id ON public.poll_votes(position_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poll_votes_user_position ON public.poll_votes(user_id, position_id);

-- Custom polls indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_polls_is_active ON public.custom_polls(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_polls_created_at ON public.custom_polls(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_polls_active_created ON public.custom_polls(is_active, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_polls_created_by ON public.custom_polls(created_by);

-- Custom poll votes indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_poll_votes_poll_id ON public.custom_poll_votes(poll_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_poll_votes_user_id ON public.custom_poll_votes(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_poll_votes_poll_user ON public.custom_poll_votes(poll_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_poll_votes_option_index ON public.custom_poll_votes(poll_id, option_index);

-- Player ratings indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_ratings_user_id ON public.player_ratings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_ratings_match_id ON public.player_ratings(match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_ratings_player_id ON public.player_ratings(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_ratings_user_match ON public.player_ratings(user_id, match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_ratings_player_type ON public.player_ratings(player_type);

-- Man of match votes indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_man_of_match_votes_user_id ON public.man_of_match_votes(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_man_of_match_votes_match_id ON public.man_of_match_votes(match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_man_of_match_votes_player_id ON public.man_of_match_votes(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_man_of_match_votes_user_match ON public.man_of_match_votes(user_id, match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_man_of_match_votes_created_at ON public.man_of_match_votes(created_at DESC);

-- =============================================================================
-- 2. MARITODLE GAME INDEXES
-- =============================================================================

-- Maritodle daily games
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_daily_games_date ON public.maritodle_daily_games(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_daily_games_secret_player ON public.maritodle_daily_games(secret_player_id);

-- Maritodle players
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_players_papel ON public.maritodle_players(papel);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_players_nome ON public.maritodle_players(nome);

-- Maritodle daily attempts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_daily_attempts_user_id ON public.maritodle_daily_attempts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_daily_attempts_game_date ON public.maritodle_daily_attempts(game_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_daily_attempts_user_date ON public.maritodle_daily_attempts(user_id, game_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maritodle_daily_attempts_won_at ON public.maritodle_daily_attempts(won_at ASC);

-- =============================================================================
-- 3. FOOTBALL CACHE INDEXES
-- =============================================================================

-- Football matches cache
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_football_matches_cache_fixture_id ON public.football_matches_cache(fixture_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_football_matches_cache_match_date ON public.football_matches_cache(match_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_football_matches_cache_processed ON public.football_matches_cache(processed);

-- Football lineups cache
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_football_lineups_cache_fixture_id ON public.football_lineups_cache(fixture_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_football_lineups_cache_is_starter ON public.football_lineups_cache(is_starter DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_football_lineups_cache_shirt_number ON public.football_lineups_cache(shirt_number ASC);

-- Match voting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_voting_match_id ON public.match_voting(match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_voting_is_active ON public.match_voting(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_voting_created_at ON public.match_voting(created_at DESC);

-- Match voting players
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_voting_players_match_voting_id ON public.match_voting_players(match_voting_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_voting_players_player_id ON public.match_voting_players(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_voting_players_player_type ON public.match_voting_players(player_type);

-- Match players
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_players_name ON public.match_players(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_players_api_player_id ON public.match_players(api_player_id);

-- =============================================================================
-- 4. ANALYTICS INDEXES
-- =============================================================================

-- Analytics events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- User sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at DESC);

-- Page performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_performance_page_url ON public.page_performance(page_url);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_performance_load_time ON public.page_performance(load_time DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_performance_created_at ON public.page_performance(created_at DESC);

-- =============================================================================
-- 5. COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================================================

-- Player voting statistics (for leaderboards)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_player_count ON public.votes(player_id) 
WHERE player_id IS NOT NULL;

-- Active discussions with comment counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_comments_count ON public.discussions(created_at DESC) 
WHERE author_id IS NOT NULL;

-- Transfer rumors active feed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transfer_rumors_feed ON public.transfer_rumors(is_deleted, created_at DESC) 
WHERE is_deleted = false;

-- Custom polls active with votes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_polls_voting ON public.custom_polls(is_active, created_at DESC) 
WHERE is_active = true;

-- =============================================================================
-- 6. QUERY OPTIMIZATION VIEWS (Optional)
-- =============================================================================

-- Optimized player rankings view
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

-- Optimized discussion feed view
CREATE OR REPLACE VIEW public.discussion_feed AS
SELECT 
    d.id,
    d.title,
    d.description,
    d.created_at,
    d.updated_at,
    u.username as author_name,
    COUNT(c.id) as comment_count
FROM public.discussions d
LEFT JOIN public.users u ON d.author_id = u.id
LEFT JOIN public.comments c ON d.id = c.discussion_id
GROUP BY d.id, d.title, d.description, d.created_at, d.updated_at, u.username
ORDER BY d.created_at DESC;

-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

-- Check created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check table sizes and index usage
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Success message
SELECT '✅ Database Performance Optimizations Applied Successfully!' as status; 