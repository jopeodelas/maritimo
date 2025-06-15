-- Atualizar tabela player_ratings para suportar tanto jogadores regulares como jogadores temporários
ALTER TABLE player_ratings 
ADD COLUMN IF NOT EXISTS player_type VARCHAR(20) DEFAULT 'regular' CHECK (player_type IN ('regular', 'match'));

ALTER TABLE player_ratings 
ADD COLUMN IF NOT EXISTS match_player_id INTEGER REFERENCES match_players(id);

-- Atualizar tabela man_of_match_votes para suportar tanto jogadores regulares como jogadores temporários
ALTER TABLE man_of_match_votes 
ADD COLUMN IF NOT EXISTS player_type VARCHAR(20) DEFAULT 'regular' CHECK (player_type IN ('regular', 'match'));

ALTER TABLE man_of_match_votes 
ADD COLUMN IF NOT EXISTS match_player_id INTEGER REFERENCES match_players(id);

-- Comentários
COMMENT ON COLUMN player_ratings.player_type IS 'Tipo de jogador: regular (da tabela players) ou match (da tabela match_players)';
COMMENT ON COLUMN player_ratings.match_player_id IS 'ID do jogador na tabela match_players (usado quando player_type = match)';

COMMENT ON COLUMN man_of_match_votes.player_type IS 'Tipo de jogador: regular (da tabela players) ou match (da tabela match_players)';
COMMENT ON COLUMN man_of_match_votes.match_player_id IS 'ID do jogador na tabela match_players (usado quando player_type = match)'; 