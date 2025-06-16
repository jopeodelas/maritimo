const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

// Configuração da base de dados
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'maritimo_voting',
  password: process.env.DB_PASSWORD || '123asd!',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('🔄 Executando migração da tabela transfer_rumors...');
    
    // Ler o ficheiro SQL de migração
    const migrationPath = path.join(__dirname, '../database/migrations/create_transfer_rumors_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar a migração
    await pool.query(migrationSQL);
    
    console.log('✅ Migração executada com sucesso!');
    console.log('📝 Tabela transfer_rumors criada com todas as colunas e índices necessários.');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Migração concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}

module.exports = { runMigration }; 