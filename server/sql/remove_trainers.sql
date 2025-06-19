-- Script para remover treinadores da tabela maritodle_players
-- Manter apenas jogadores (remover papel "Treinador")

DELETE FROM maritodle_players 
WHERE papel = 'Treinador';

-- Verificar quantos registros restaram após a remoção
SELECT COUNT(*) as total_jogadores_restantes FROM maritodle_players; 