-- Criar tabela para jogadores temporários dos jogos (separada da tabela players principal)
CREATE TABLE IF NOT EXISTS match_players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    image_url TEXT,
    api_player_id INTEGER, -- ID do jogador na API para referência
    api_player_name VARCHAR(255), -- Nome original da API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_match_players_name ON match_players(name);
CREATE INDEX IF NOT EXISTS idx_match_players_api_id ON match_players(api_player_id);

-- Comentários
COMMENT ON TABLE match_players IS 'Tabela para jogadores temporários criados a partir da API para votações de jogos específicos';
COMMENT ON COLUMN match_players.api_player_id IS 'ID do jogador na API Football para referência';
COMMENT ON COLUMN match_players.api_player_name IS 'Nome original do jogador como vem da API'; 