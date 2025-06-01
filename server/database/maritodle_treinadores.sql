-- Inserir treinadores do CS Marítimo na tabela maritodle_players
-- Evitando duplicados de treinadores que tiveram múltiplas passagens

INSERT INTO maritodle_players (nome, sexo, posicao_principal, altura_cm, papel, idade, nacionalidade, trofeus, ano_entrada, ano_saida) VALUES

-- 1. Manuel Ventura Cajuda de Sousa
('Manuel Ventura', 'Masculino', 'Treinador', 180, 'Treinador', 73, 'Portugal', '{}', 2003, 2004),

-- 2. Mariano Jerónimo Barreto  
('Mariano Barreto', 'Masculino', 'Treinador', NULL, 'Treinador', 68, 'Portugal', '{}', 2004, 2005),

-- 3. Juca (José Maria Juca)
('Juca', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Portugal', '{}', 2005, 2005),

-- 4. João Abel (interino)
('João Abel', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Portugal', '{}', 2005, 2005),

-- 5. Paulo Bonamigo
('Paulo Bonamigo', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Brasil', '{}', 2005, 2006),

-- 6. Ulisses Morais
('Ulisses Morais', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Portugal', '{}', 2006, 2007),

-- 7. Alberto Pazos
('Alberto Pazos', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Portugal', '{}', 2007, 2007),

-- 8. Sebastião Lazaroni
('Sebastião Lazaroni', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Brasil', '{}', 2007, 2008),

-- 9. Lori Sandri
('Lori Sandri', 'Masculino', 'Treinador', NULL, 'Treinador', NULL, 'Brasil', '{}', 2008, 2009),

-- 10. Carlos Carvalhal
('Carlos Carvalhal', 'Masculino', 'Treinador', 178, 'Treinador', 59, 'Portugal', '{}', 2009, 2009),

-- 11. Mitchell van der Gaag
('Mitchell van der Gaag', 'Masculino', 'Treinador', 183, 'Treinador', 54, 'Países Baixos', '{}', 2009, 2010),

-- 12. Pedro Martins
('Pedro Martins', 'Masculino', 'Treinador', 180, 'Treinador', 47, 'Portugal', '{}', 2010, 2014),

-- 13. Leonel Pontes
('Leonel Pontes', 'Masculino', 'Treinador', NULL, 'Treinador', 48, 'Portugal', '{}', 2014, 2015),

-- 14. Ivo Vieira (primeira passagem - usando ano da primeira passagem mais longa)
('Ivo Vieira', 'Masculino', 'Treinador', NULL, 'Treinador', 49, 'Portugal', '{}', 2015, 2016),

-- 15. Nelo Vingada
('Nelo Vingada', 'Masculino', 'Treinador', NULL, 'Treinador', 64, 'Portugal', '{}', 2016, 2016),

-- 16. Paulo César
('Paulo César', 'Masculino', 'Treinador', NULL, 'Treinador', 57, 'Brasil', '{}', 2016, 2016),

-- 17. Daniel Ramos
('Daniel Ramos', 'Masculino', 'Treinador', NULL, 'Treinador', 51, 'Portugal', '{}', 2016, 2018),

-- 18. Cláudio Braga
('Cláudio Braga', 'Masculino', 'Treinador', NULL, 'Treinador', 57, 'Portugal', '{}', 2018, 2018),

-- 19. Petit
('Petit', 'Masculino', 'MDC', 180, 'Treinador', 47, 'Portugal', '{}', 2018, 2019),

-- 20. Nuno Manta Santos
('Nuno Manta Santos', 'Masculino', 'Treinador', NULL, 'Treinador', 53, 'Portugal', '{}', 2019, 2019),

-- 21. José Manuel Gomes (primeira passagem - usando ano da primeira passagem mais longa)
('José Manuel Gomes', 'Masculino', 'Treinador', NULL, 'Treinador', 47, 'Portugal', '{}', 2019, 2020),

-- 22. Lito Vidigal
('Lito Vidigal', 'Masculino', 'DC', 178, 'Treinador', 55, 'Portugal', '{}', 2020, 2020),

-- 23. Milton Mendes
('Milton Mendes', 'Masculino', 'Treinador', NULL, 'Treinador', 61, 'Brasil', '{}', 2020, 2021),

-- 24. Julio Velázquez
('Julio Velázquez', 'Masculino', 'Treinador', NULL, 'Treinador', 39, 'Espanha', '{}', 2021, 2021),

-- 25. Vasco Seabra
('Vasco Seabra', 'Masculino', 'Treinador', NULL, 'Treinador', 36, 'Portugal', '{}', 2021, 2022),

-- 26. João Henriques
('João Henriques', 'Masculino', 'Treinador', NULL, 'Treinador', 44, 'Portugal', '{}', 2022, 2022),

-- 27. Tulipa
('Tulipa', 'Masculino', 'Treinador', 172, 'Treinador', 52, 'Portugal', '{}', 2023, 2023),

-- 28. Fábio Pereira
('Fábio Pereira', 'Masculino', 'Treinador', NULL, 'Treinador', 39, 'Portugal', '{}', 2023, 2024),

-- 29. Silas
('Silas', 'Masculino', 'MDC', 176, 'Treinador', 48, 'Portugal', '{}', 2024, 2024),

-- 30. Rui Duarte
('Rui Duarte', 'Masculino', 'Treinador', 182, 'Treinador', 46, 'Portugal', '{}', 2024, 2025);

-- Verificar quantos treinadores foram inseridos
SELECT COUNT(*) as total_treinadores FROM maritodle_players WHERE papel = 'Treinador';

-- Mostrar todos os treinadores ordenados por ano de entrada
SELECT nome, idade, nacionalidade, ano_entrada, ano_saida 
FROM maritodle_players 
WHERE papel = 'Treinador' 
ORDER BY ano_entrada; 