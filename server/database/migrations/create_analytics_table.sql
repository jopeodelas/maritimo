-- Criar tabela para armazenar eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    
    -- Informações do evento
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_data JSONB,
    
    -- Informações do usuário
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_agent TEXT,
    ip_address INET,
    
    -- Informações da sessão
    session_id VARCHAR(100),
    page_url TEXT,
    page_title VARCHAR(200),
    referrer TEXT,
    
    -- Informações do dispositivo
    device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_resolution VARCHAR(20),
    
    -- Informações geográficas
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events (event_category);

-- Tabela para armazenar sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Informações do usuário
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Informações da sessão
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- em segundos
    
    -- Informações do dispositivo
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Informações geográficas
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Métricas da sessão
    page_views INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE
);

-- Criar índices para sessões
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON user_sessions (start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions (session_id);

-- Tabela para métricas de performance das páginas
CREATE TABLE IF NOT EXISTS page_performance (
    id SERIAL PRIMARY KEY,
    
    -- Informações da página
    page_url TEXT NOT NULL,
    page_title VARCHAR(200),
    
    -- Core Web Vitals
    lcp DECIMAL(10,2), -- Largest Contentful Paint (ms)
    fid DECIMAL(10,2), -- First Input Delay (ms)
    cls DECIMAL(10,3), -- Cumulative Layout Shift
    
    -- Outras métricas
    ttfb DECIMAL(10,2), -- Time to First Byte (ms)
    fcp DECIMAL(10,2),  -- First Contentful Paint (ms)
    load_time DECIMAL(10,2), -- Tempo total de carregamento (ms)
    
    -- Informações do contexto
    session_id VARCHAR(100),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    device_type VARCHAR(20),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_performance_page_url ON page_performance (page_url);
CREATE INDEX IF NOT EXISTS idx_performance_created_at ON page_performance (created_at);
CREATE INDEX IF NOT EXISTS idx_performance_session_id ON page_performance (session_id); 