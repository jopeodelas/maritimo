require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: '123asd!',
  port: process.env.DB_PORT,
});

async function fixRealDates() {
  try {
    console.log('🔧 Corrigindo datas com as datas reais das notícias...');
    
    // Datas REAIS conforme indicado pelo utilizador
    const realDates = {
      'Vítor Matos': '2025-06-13', // Data real: 13/06/2025
      'Vitor Matos': '2025-06-13', // Variação do nome
      'Patrick Fernandes': '2025-06-15' // Data real: 15/06/2025
    };
    
    // Buscar todos os rumores existentes
    const result = await pool.query('SELECT id, player_name, date FROM transfer_rumors WHERE is_deleted = false');
    console.log(`📊 Encontrados ${result.rows.length} rumores na base de dados`);
    
    for (const rumor of result.rows) {
      console.log(`📅 Rumor atual: ${rumor.player_name} - Data: ${rumor.date}`);
      
      // Verificar se temos uma data real para este jogador
      const realDate = realDates[rumor.player_name];
      
      if (realDate) {
        console.log(`🔧 Corrigindo ${rumor.player_name}: ${rumor.date} -> ${realDate}`);
        
        await pool.query(
          'UPDATE transfer_rumors SET date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [realDate, rumor.id]
        );
        
        console.log(`✅ ${rumor.player_name} corrigido com sucesso!`);
      } else {
        console.log(`⚠️ Sem data real definida para ${rumor.player_name}`);
      }
    }
    
    console.log('🎉 Correção de datas concluída!');
    
    // Verificar o resultado
    const updatedResult = await pool.query('SELECT player_name, date FROM transfer_rumors WHERE is_deleted = false ORDER BY date DESC');
    console.log('\n📋 Rumores após correção:');
    for (const rumor of updatedResult.rows) {
      console.log(`  - ${rumor.player_name}: ${rumor.date}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir datas:', error);
  } finally {
    await pool.end();
  }
}

// Executar o script
fixRealDates(); 