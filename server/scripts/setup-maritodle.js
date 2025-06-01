const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Usar as configurações do projeto
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'maritimo_db',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function setupMaritodlePlayers() {
  try {
    console.log('Configurando tabela maritodle_players...');
    console.log(`Conectando à base de dados: ${process.env.DB_NAME || 'maritimo_db'}`);
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'sql', 'maritodle_players.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await pool.query(sql);
    console.log('✅ Tabela maritodle_players criada com sucesso!');
    
    // Verificar quantos jogadores foram inseridos
    const result = await pool.query('SELECT COUNT(*) FROM maritodle_players');
    console.log(`✅ Total de jogadores inseridos: ${result.rows[0].count}`);
    
    // Mostrar alguns exemplos
    const examples = await pool.query('SELECT nome, posicao_principal, nacionalidade FROM maritodle_players LIMIT 5');
    console.log('\n📋 Exemplos de jogadores inseridos:');
    examples.rows.forEach(player => {
      console.log(`  - ${player.nome} (${player.posicao_principal}, ${player.nacionalidade})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar tabela:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
  } finally {
    await pool.end();
  }
}

setupMaritodlePlayers(); 