-- Diagnostic script for Supabase schema issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check what schemas exist
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast');

-- 2. Check current search_path
SHOW search_path;

-- 3. Check what tables exist in public schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4. Check if critical tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as users_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'players') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as players_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transfer_rumors') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as transfer_rumors_table;

-- 5. Check table permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'players', 'transfer_rumors')
ORDER BY table_name;

-- 6. If tables exist, test a simple query
-- (Comment out if tables don't exist)
-- SELECT COUNT(*) as user_count FROM public.users;
-- SELECT COUNT(*) as player_count FROM public.players;
-- SELECT COUNT(*) as transfer_rumors_count FROM public.transfer_rumors; 