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

async function setupMaritodleDaily() {
  try {
    console.log('🎮 Configurando sistema diário do Maritodle...');
    console.log(`Conectando à base de dados: ${process.env.DB_NAME || 'maritimo_db'}`);
    
    // 1. Criar tabelas do sistema diário
    console.log('📋 Criando tabelas do sistema diário...');
    const dailyTablesSQL = fs.readFileSync(path.join(__dirname, '..', 'sql', 'maritodle_daily.sql'), 'utf8');
    await pool.query(dailyTablesSQL);
    console.log('✅ Tabelas do sistema diário criadas com sucesso!');
    
    // 2. Remover treinadores
    console.log('🧹 Removendo treinadores da base de dados...');
    const removeTrainersSQL = fs.readFileSync(path.join(__dirname, '..', 'sql', 'remove_trainers.sql'), 'utf8');
    await pool.query(removeTrainersSQL);
    console.log('✅ Treinadores removidos com sucesso!');
    
    // 3. Verificar jogadores restantes
    const playersResult = await pool.query('SELECT COUNT(*) FROM maritodle_players WHERE papel != $1', ['Treinador']);
    console.log(`✅ Total de jogadores disponíveis: ${playersResult.rows[0].count}`);
    
    // 4. Criar primeiro jogo do dia se não existir
    const today = new Date().toISOString().split('T')[0];
    const existingGame = await pool.query('SELECT * FROM maritodle_daily_games WHERE date = $1', [today]);
    
    if (existingGame.rows.length === 0) {
      console.log('🎯 Criando primeiro jogo do dia...');
      
      // Escolher jogador aleatório
      const randomPlayer = await pool.query(
        'SELECT * FROM maritodle_players WHERE papel != $1 ORDER BY RANDOM() LIMIT 1',
        ['Treinador']
      );
      
      if (randomPlayer.rows.length > 0) {
        const secretPlayer = randomPlayer.rows[0];
        
        await pool.query(
          `INSERT INTO maritodle_daily_games (date, secret_player_id, secret_player_name, total_winners)
           VALUES ($1, $2, $3, 0)`,
          [today, secretPlayer.id, secretPlayer.nome]
        );
        
        console.log(`✅ Primeiro jogo criado para hoje: ${secretPlayer.nome}`);
      } else {
        console.log('❌ Nenhum jogador encontrado para criar o jogo');
      }
    } else {
      console.log(`✅ Jogo de hoje já existe: ${existingGame.rows[0].secret_player_name}`);
    }
    
    // 5. Mostrar estatísticas
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users_played,
        COUNT(DISTINCT CASE WHEN won = true THEN user_id END) as total_winners,
        AVG(attempts) as avg_attempts
      FROM maritodle_daily_attempts 
      WHERE game_date = $1
    `, [today]);
    
    if (statsResult.rows[0].total_users_played > 0) {
      console.log('\n📊 Estatísticas de hoje:');
      console.log(`  - Usuários que jogaram: ${statsResult.rows[0].total_users_played}`);
      console.log(`  - Usuários que venceram: ${statsResult.rows[0].total_winners}`);
      console.log(`  - Média de tentativas: ${parseFloat(statsResult.rows[0].avg_attempts || 0).toFixed(1)}`);
    }
    
    console.log('\n🎉 Sistema diário do Maritodle configurado com sucesso!');
    console.log('');
    console.log('🔧 Funcionalidades implementadas:');
    console.log('  ✅ Jogo diário que reinicia às 23:00 (hora de Portugal)');
    console.log('  ✅ Contador de pessoas que descobriram (tempo real)');
    console.log('  ✅ Mostra o jogador de ontem');
    console.log('  ✅ Informação sobre jogadores das últimas 10 épocas');
    console.log('  ✅ Remoção de treinadores da base de dados');
    console.log('  ✅ Persistência de dados dos jogadores');
    console.log('  ✅ Interface atualizada para sistema diário');
    console.log('');
    console.log('🌐 Aceda ao novo sistema em: /maritodle-daily');
    
  } catch (error) {
    console.error('❌ Erro ao configurar sistema diário:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
  } finally {
    await pool.end();
  }
}

setupMaritodleDaily(); 