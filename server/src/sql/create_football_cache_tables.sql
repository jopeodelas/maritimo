-- Tabela para cache dos jogos do CS Marítimo
CREATE TABLE IF NOT EXISTS football_matches_cache (
    id SERIAL PRIMARY KEY,
    fixture_id INTEGER UNIQUE NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    season INTEGER,
    league_name VARCHAR(100),
    venue VARCHAR(100),
    referee VARCHAR(100),
    home_score INTEGER,
    away_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    api_source VARCHAR(50) DEFAULT 'API-Football',
    processed BOOLEAN DEFAULT FALSE
);

-- Tabela para cache dos lineups dos jogos
CREATE TABLE IF NOT EXISTS football_lineups_cache (
    id SERIAL PRIMARY KEY,
    fixture_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    player_api_id INTEGER NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    player_position VARCHAR(10),
    is_starter BOOLEAN NOT NULL DEFAULT TRUE,
    shirt_number INTEGER,
    substitution_in INTEGER,
    substitution_out INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fixture_id) REFERENCES football_matches_cache(fixture_id) ON DELETE CASCADE
);

-- Tabela para controle de sincronização
CREATE TABLE IF NOT EXISTS football_sync_control (
    id SERIAL PRIMARY KEY,
    last_full_sync TIMESTAMP,
    last_check_sync TIMESTAMP,
    total_matches_cached INTEGER DEFAULT 0,
    api_requests_today INTEGER DEFAULT 0,
    api_requests_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir registro inicial de controle se não existir
INSERT INTO football_sync_control (last_full_sync, total_matches_cached)
SELECT NULL, 0
WHERE NOT EXISTS (SELECT 1 FROM football_sync_control);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_football_matches_date ON football_matches_cache(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_football_matches_fixture ON football_matches_cache(fixture_id);
CREATE INDEX IF NOT EXISTS idx_football_matches_processed ON football_matches_cache(processed);
CREATE INDEX IF NOT EXISTS idx_football_lineups_fixture ON football_lineups_cache(fixture_id);
CREATE INDEX IF NOT EXISTS idx_football_lineups_player ON football_lineups_cache(player_api_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela de controle
CREATE TRIGGER update_football_sync_control_updated_at 
    BEFORE UPDATE ON football_sync_control 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 