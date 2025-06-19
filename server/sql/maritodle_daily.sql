-- Tabela para armazenar os jogos diários do maritodle
CREATE TABLE IF NOT EXISTS maritodle_daily_games (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    secret_player_id INTEGER NOT NULL,
    secret_player_name VARCHAR(100) NOT NULL,
    total_winners INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as tentativas dos usuários por dia
CREATE TABLE IF NOT EXISTS maritodle_daily_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    game_date DATE NOT NULL,
    attempts INTEGER DEFAULT 0,
    won BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    attempts_data JSONB DEFAULT '[]',
    won_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_date)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_maritodle_daily_games_date ON maritodle_daily_games(date);
CREATE INDEX IF NOT EXISTS idx_maritodle_daily_attempts_user_date ON maritodle_daily_attempts(user_id, game_date);
CREATE INDEX IF NOT EXISTS idx_maritodle_daily_attempts_date ON maritodle_daily_attempts(game_date);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_maritodle_daily_games_updated_at BEFORE UPDATE ON maritodle_daily_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maritodle_daily_attempts_updated_at BEFORE UPDATE ON maritodle_daily_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 