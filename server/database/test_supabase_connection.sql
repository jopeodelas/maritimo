-- Test script to verify Supabase connection and schema fixes
-- Run this AFTER the diagnostic and fix scripts

-- 1. Test basic connection
SELECT 'Database connection OK' as status, current_database() as database_name;

-- 2. Test schema path
SELECT 'Search path: ' || current_setting('search_path') as search_path_info;

-- 3. Test critical tables existence
SELECT 
    COUNT(*) as total_tables,
    COUNT(CASE WHEN table_name = 'users' THEN 1 END) as users_exists,
    COUNT(CASE WHEN table_name = 'players' THEN 1 END) as players_exists,
    COUNT(CASE WHEN table_name = 'transfer_rumors' THEN 1 END) as transfer_rumors_exists
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 4. Test simple queries (uncomment if tables exist)
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as player_count FROM players;
-- SELECT COUNT(*) as transfer_count FROM transfer_rumors;

-- 5. Test analytics tables
SELECT 
    COUNT(CASE WHEN table_name = 'analytics_events' THEN 1 END) as analytics_events_exists,
    COUNT(CASE WHEN table_name = 'user_sessions' THEN 1 END) as user_sessions_exists,
    COUNT(CASE WHEN table_name = 'page_performance' THEN 1 END) as page_performance_exists
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 6. List all tables to verify everything is there
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 7. Final summary
SELECT 
    'Test completed' as status,
    current_timestamp as test_time,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_public_tables; 