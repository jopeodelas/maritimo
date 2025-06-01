-- Tabela específica para o jogo Maritodle
CREATE TABLE IF NOT EXISTS maritodle_players (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    sexo VARCHAR(20) NOT NULL,
    posicao_principal VARCHAR(10) NOT NULL,
    altura_cm INTEGER NOT NULL,
    papel VARCHAR(20) NOT NULL,
    idade INTEGER NOT NULL,
    nacionalidade VARCHAR(50) NOT NULL,
    trofeus TEXT[] DEFAULT '{}',
    ano_entrada INTEGER NOT NULL,
    ano_saida INTEGER NOT NULL, -- 9999 para jogadores atuais
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir todos os jogadores fornecidos
INSERT INTO maritodle_players (nome, sexo, posicao_principal, altura_cm, papel, idade, nacionalidade, trofeus, ano_entrada, ano_saida) VALUES
('Samu Silva', 'Masculino', 'GK', 193, 'Jogador', 25, 'Portugal', '{}', 2023, 9999),
('Kimiss Zavala', 'Masculino', 'GK', 186, 'Jogador', 21, 'Moçambique', '{}', 2022, 9999),
('Junior Almeida', 'Masculino', 'DC', 189, 'Jogador', 25, 'Brasil', '{}', 2024, 9999),
('Afonso Freitas', 'Masculino', 'DC', 184, 'Jogador', 23, 'Portugal', '{}', 2025, 9999),
('Rodrigo Borges', 'Masculino', 'DC', 185, 'Jogador', 26, 'Portugal', '{}', 2024, 9999),
('Romain Correia', 'Masculino', 'DC', 187, 'Jogador', 25, 'Portugal', '{}', 2024, 9999),
('Noah Madsen', 'Masculino', 'DC', 191, 'Jogador', 23, 'Dinamarca', '{}', 2024, 9999),
('Pedro Silva', 'Masculino', 'MCO', 177, 'Jogador', 23, 'Portugal', '{}', 2024, 9999),
('Ibrahima Guirassy', 'Masculino', 'MDC', 190, 'Jogador', 26, 'França', '{}', 2024, 9999),
('Carlos Daniel', 'Masculino', 'MC', 175, 'Jogador', 26, 'Portugal', '{}', 2023, 9999),
('Vladan Danilović', 'Masculino', 'MDC', 183, 'Jogador', 25, 'Bósnia e Herzegovina', '{}', 2024, 9999),
('Michel Costa', 'Masculino', 'MC', 165, 'Jogador', 23, 'Brasil', '{}', 2025, 9999),
('Rodrigo Andrade', 'Masculino', 'ME', 175, 'Jogador', 26, 'Portugal', '{}', 2024, 9999),
('Fábio Blanco', 'Masculino', 'ED', 179, 'Jogador', 21, 'Espanha', '{}', 2025, 9999),
('Preslav Borukov', 'Masculino', 'PL', 189, 'Jogador', 25, 'Bulgária', '{}', 2024, 9999),
('Alexandre Guedes', 'Masculino', 'PL', 185, 'Jogador', 31, 'Portugal', '{}', 2025, 9999),
('Patrick Fernandes', 'Masculino', 'PL', 190, 'Jogador', 31, 'Cabo Verde', '{}', 2024, 9999),
('Martim Tavares', 'Masculino', 'PL', 183, 'Jogador', 21, 'Portugal', '{}', 2024, 9999),
('Nachon Nsingi', 'Masculino', 'PL', 176, 'Jogador', 24, 'Bélgica', '{}', 2025, 9999),
('Daniel Benchimol', 'Masculino', 'ED', 162, 'Jogador', 22, 'Portugal', '{}', 2023, 9999),
('Enrique Peña Zauner', 'Masculino', 'ED', 177, 'Jogador', 25, 'Venezuela', '{}', 2025, 9999),
('Fábio China', 'Masculino', 'LB', 179, 'Jogador', 32, 'Portugal', '{}', 2016, 9999),
('Igor Julião', 'Masculino', 'RB', 173, 'Jogador', 30, 'Brasil', '{}', 2023, 9999),
('Tomás Domingos', 'Masculino', 'RB', 175, 'Jogador', 26, 'Portugal', '{}', 2023, 9999),
('Francisco França', 'Masculino', 'MDC', 186, 'Jogador', 23, 'Portugal', '{}', 2024, 9999),
('Gonçalo Tabuaço', 'Masculino', 'GK', 189, 'Jogador', 24, 'Portugal', '{}', 2024, 9999);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_maritodle_players_nome ON maritodle_players(nome);
CREATE INDEX IF NOT EXISTS idx_maritodle_players_posicao ON maritodle_players(posicao_principal);
CREATE INDEX IF NOT EXISTS idx_maritodle_players_nacionalidade ON maritodle_players(nacionalidade); 