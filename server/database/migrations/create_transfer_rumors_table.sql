-- Criar tabela para armazenar rumores de transferências
CREATE TABLE IF NOT EXISTS transfer_rumors (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(255) UNIQUE NOT NULL, -- ID único para evitar duplicatas
    player_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('compra', 'venda', 'renovação')),
    club VARCHAR(255) NOT NULL,
    value VARCHAR(255) DEFAULT 'Valor não revelado',
    status VARCHAR(50) NOT NULL DEFAULT 'rumor' CHECK (status IN ('rumor', 'negociação', 'confirmado')),
    date DATE NOT NULL,
    source VARCHAR(255) NOT NULL,
    reliability INTEGER NOT NULL DEFAULT 3 CHECK (reliability >= 1 AND reliability <= 5),
    description TEXT,
    is_main_team BOOLEAN DEFAULT true,
    category VARCHAR(50) DEFAULT 'senior' CHECK (category IN ('senior', 'youth', 'staff', 'coach', 'other')),
    position VARCHAR(100),
    is_approved BOOLEAN DEFAULT false, -- Para o admin aprovar
    is_deleted BOOLEAN DEFAULT false, -- Soft delete
    created_by INTEGER, -- ID do utilizador que criou (NULL para automático)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key para utilizador (se foi criado manualmente)
    CONSTRAINT fk_transfer_rumors_user FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_unique_id ON transfer_rumors(unique_id);
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_player_name ON transfer_rumors(player_name);
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_status ON transfer_rumors(status);
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_is_approved ON transfer_rumors(is_approved);
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_is_deleted ON transfer_rumors(is_deleted);
CREATE INDEX IF NOT EXISTS idx_transfer_rumors_created_at ON transfer_rumors(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_transfer_rumors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transfer_rumors_updated_at
    BEFORE UPDATE ON transfer_rumors
    FOR EACH ROW
    EXECUTE FUNCTION update_transfer_rumors_updated_at(); 