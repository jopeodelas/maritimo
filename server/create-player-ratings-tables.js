const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123asd!',
  database: 'maritimo_voting',
  port: 5432
});

const createTables = async () => {
  try {
    console.log('🔄 Creating player ratings tables...');
    
    // Tabela para votações de partidas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS match_voting (
        id SERIAL PRIMARY KEY,
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        match_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        match_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela para jogadores numa votação
    await pool.query(`
      CREATE TABLE IF NOT EXISTS match_voting_players (
        id SERIAL PRIMARY KEY,
        match_voting_id INTEGER REFERENCES match_voting(id) ON DELETE CASCADE,
        player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
        UNIQUE(match_voting_id, player_id)
      )
    `);
    
    // Tabela para avaliações dos jogadores  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_ratings (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES match_voting(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, user_id, match_id)
      )
    `);
    
    // Tabela para votos de homem do jogo
    await pool.query(`
      CREATE TABLE IF NOT EXISTS man_of_match_votes (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES match_voting(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, match_id)
      )
    `);
    
    console.log('✅ Player ratings tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating player ratings tables:', error);
  } finally {
    await pool.end();
  }
};

createTables(); 