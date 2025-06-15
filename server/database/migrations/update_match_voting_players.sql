-- Atualizar tabela match_voting_players para suportar tanto jogadores regulares como jogadores temporários
ALTER TABLE match_voting_players 
ADD COLUMN IF NOT EXISTS player_type VARCHAR(20) DEFAULT 'regular' CHECK (player_type IN ('regular', 'match'));

ALTER TABLE match_voting_players 
ADD COLUMN IF NOT EXISTS match_player_id INTEGER REFERENCES match_players(id);

-- Comentários
COMMENT ON COLUMN match_voting_players.player_type IS 'Tipo de jogador: regular (da tabela players) ou match (da tabela match_players)';
COMMENT ON COLUMN match_voting_players.match_player_id IS 'ID do jogador na tabela match_players (usado quando player_type = match)'; 