-- Create missing analytics tables for Supabase
-- Run this script in your Supabase SQL editor

-- Table: analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(255),
    event_data JSONB,
    user_id INTEGER REFERENCES public.users(id),
    user_agent TEXT,
    ip_address VARCHAR(45),
    session_id VARCHAR(255),
    page_url TEXT,
    page_title VARCHAR(500),
    referrer TEXT,
    device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES public.users(id),
    user_agent TEXT,
    ip_address VARCHAR(45),
    device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE
);

-- Table: page_performance
CREATE TABLE IF NOT EXISTS public.page_performance (
    id SERIAL PRIMARY KEY,
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    lcp NUMERIC(10,2), -- Largest Contentful Paint
    fid NUMERIC(10,2), -- First Input Delay
    cls NUMERIC(10,4), -- Cumulative Layout Shift
    ttfb NUMERIC(10,2), -- Time to First Byte
    fcp NUMERIC(10,2), -- First Contentful Paint
    load_time NUMERIC(10,2),
    session_id VARCHAR(255),
    user_id INTEGER REFERENCES public.users(id),
    device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON public.user_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_page_performance_page_url ON public.page_performance(page_url);
CREATE INDEX IF NOT EXISTS idx_page_performance_session_id ON public.page_performance(session_id);
CREATE INDEX IF NOT EXISTS idx_page_performance_created_at ON public.page_performance(created_at);

-- Grant permissions (adjust as needed for your setup)
ALTER TABLE public.analytics_events OWNER TO postgres;
ALTER TABLE public.user_sessions OWNER TO postgres;
ALTER TABLE public.page_performance OWNER TO postgres;

-- Enable Row Level Security if needed
-- ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.page_performance ENABLE ROW LEVEL SECURITY;

-- You might need to create policies for RLS if enabled
-- Example policies (uncomment and adjust as needed):
-- CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_events
--   FOR ALL TO authenticated USING (true);
-- CREATE POLICY "Allow all operations for authenticated users" ON public.user_sessions
--   FOR ALL TO authenticated USING (true);
-- CREATE POLICY "Allow all operations for authenticated users" ON public.page_performance
--   FOR ALL TO authenticated USING (true); 