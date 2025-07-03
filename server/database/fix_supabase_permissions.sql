-- Fix Supabase permissions for analytics tables
-- Run this AFTER creating the analytics tables

-- Disable RLS for analytics tables (for server-side operations)
ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_performance DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, create permissive policies:
-- ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.page_performance ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations for service role" ON public.analytics_events
--   FOR ALL TO service_role USING (true);
-- CREATE POLICY "Allow all operations for service role" ON public.user_sessions
--   FOR ALL TO service_role USING (true);
-- CREATE POLICY "Allow all operations for service role" ON public.page_performance
--   FOR ALL TO service_role USING (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.analytics_events TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.page_performance TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.user_sessions_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.page_performance_id_seq TO authenticated; 