const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'maritimo_db',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating tables for player ratings system...');
    
    // Tabela para gerir sessões de votação
    await client.query(`
      CREATE TABLE IF NOT EXISTS match_voting (
          id SERIAL PRIMARY KEY,
          match_id INTEGER,
          home_team VARCHAR(100) NOT NULL,
          away_team VARCHAR(100) NOT NULL,
          match_date DATE NOT NULL,
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ match_voting table created');

    // Índice único para votação ativa
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_voting 
      ON match_voting(is_active) WHERE is_active = true;
    `);
    console.log('✅ unique_active_voting index created');

    // Tabela para jogadores nas votações
    await client.query(`
      CREATE TABLE IF NOT EXISTS match_voting_players (
          id SERIAL PRIMARY KEY,
          match_voting_id INTEGER NOT NULL,
          player_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(match_voting_id, player_id)
      );
    `);
    console.log('✅ match_voting_players table created');

    // Tabela para ratings dos jogadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS player_ratings (
          id SERIAL PRIMARY KEY,
          player_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          match_id INTEGER NOT NULL,
          rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, player_id, match_id)
      );
    `);
    console.log('✅ player_ratings table created');

    // Tabela para votos homem do jogo
    await client.query(`
      CREATE TABLE IF NOT EXISTS man_of_match_votes (
          id SERIAL PRIMARY KEY,
          player_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          match_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, match_id)
      );
    `);
    console.log('✅ man_of_match_votes table created');

    // Inserir dados de exemplo
    const result = await client.query(`
      INSERT INTO match_voting (home_team, away_team, match_date, is_active) 
      VALUES ('CS Marítimo', 'FC Tondela', '2024-01-20', true)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    
    if (result.rows.length > 0) {
      const matchId = result.rows[0].id;
      console.log(`✅ Sample match created with ID: ${matchId}`);
      
      // Adicionar jogadores ao jogo (assumindo que existem jogadores com IDs 1-16)
      for (let playerId = 1; playerId <= 16; playerId++) {
        try {
          await client.query(`
            INSERT INTO match_voting_players (match_voting_id, player_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
          `, [matchId, playerId]);
        } catch (err) {
          console.log(`⚠️  Player ${playerId} may not exist, skipping...`);
        }
      }
      console.log('✅ Sample players added to match');
    } else {
      console.log('ℹ️  Sample match already exists');
    }

    console.log('\n🎉 All tables created successfully!');
    console.log('🚀 Server should now work with player ratings system');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    client.release();
    pool.end();
  }
};

createTables(); 