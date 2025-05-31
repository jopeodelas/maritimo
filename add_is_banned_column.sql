-- Script SQL para adicionar funcionalidade de banir utilizadores
-- Execute este script na tua base de dados PostgreSQL

-- Adicionar coluna is_banned à tabela users se não existir
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Opcional: Verificar se a coluna foi adicionada com sucesso
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'is_banned';

-- Comentário: Todos os utilizadores existentes terão is_banned = FALSE por defeito 