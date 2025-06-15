-- Tabela para gerir sessões de votação para cada jogo
CREATE TABLE IF NOT EXISTS match_voting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    match_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_active_voting (is_active, id)
);

-- Tabela para associar jogadores às sessões de votação
CREATE TABLE IF NOT EXISTS match_voting_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_voting_id INT NOT NULL,
    player_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_voting_id) REFERENCES match_voting(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match_player (match_voting_id, player_id)
);

-- Tabela para armazenar as avaliações dos jogadores
CREATE TABLE IF NOT EXISTS player_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES match_voting(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_player_rating (user_id, player_id, match_id)
);

-- Tabela para armazenar os votos para "Homem do Jogo"
CREATE TABLE IF NOT EXISTS man_of_match_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES match_voting(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_match_mom_vote (user_id, match_id)
);

-- Índices para melhorar a performance
CREATE INDEX idx_player_ratings_player_id ON player_ratings(player_id);
CREATE INDEX idx_player_ratings_match_id ON player_ratings(match_id);
CREATE INDEX idx_player_ratings_user_id ON player_ratings(user_id);
CREATE INDEX idx_man_of_match_votes_player_id ON man_of_match_votes(player_id);
CREATE INDEX idx_man_of_match_votes_match_id ON man_of_match_votes(match_id);
CREATE INDEX idx_match_voting_is_active ON match_voting(is_active);

-- Inserir dados de exemplo (remover em produção)
-- Assumindo que já existem jogadores na tabela players
INSERT IGNORE INTO match_voting (home_team, away_team, match_date, is_active) 
VALUES ('CS Marítimo', 'SL Benfica', CURDATE(), true);

-- Assumindo que queremos adicionar alguns jogadores ao jogo de exemplo
-- (ajustar os IDs conforme os jogadores existentes na base de dados)
INSERT IGNORE INTO match_voting_players (match_voting_id, player_id)
SELECT 
    (SELECT id FROM match_voting WHERE is_active = true LIMIT 1),
    p.id
FROM players p
WHERE p.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11) -- Ajustar conforme necessário
LIMIT 11; -- 11 jogadores iniciais 