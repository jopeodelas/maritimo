-- Fix Supabase schema issues
-- Run this AFTER the diagnostic script

-- 1. Set the search_path to include public schema first
ALTER DATABASE postgres SET search_path TO "$user", public;

-- 2. For the current session, also set search_path
SET search_path TO "$user", public;

-- 3. Ensure public schema exists and has proper permissions
CREATE SCHEMA IF NOT EXISTS public;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- 4. Grant necessary permissions on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- 5. Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- 6. If using service_role, grant permissions to it as well
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- 7. Check if critical tables exist and create them if missing
-- This is a safeguard in case the backup didn't restore properly

-- Check users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE NOTICE 'CRITICAL: users table is missing! Please restore the backup properly.';
    END IF;
END$$;

-- Check players table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'players') THEN
        RAISE NOTICE 'CRITICAL: players table is missing! Please restore the backup properly.';
    END IF;
END$$;

-- Check transfer_rumors table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transfer_rumors') THEN
        RAISE NOTICE 'CRITICAL: transfer_rumors table is missing! Please restore the backup properly.';
    END IF;
END$$;

-- 8. Final verification
SELECT 
    'Schema fix completed' as status,
    current_setting('search_path') as current_search_path,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables_in_public_schema; 