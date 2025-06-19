const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123asd!',
  database: 'maritimo_voting',
  port: 5432
});

async function fixVoting() {
  try {
    console.log('🧹 Cleaning wrong voting...');
    
    // Remover a votação errada (Sloboda Novi Grad vs Ljubić Prnjavor)
    await pool.query('DELETE FROM match_voting WHERE home_team = $1 AND away_team = $2', 
      ['Sloboda Novi Grad', 'Ljubić Prnjavor']);
    
    console.log('✅ Wrong voting removed');
    
    // Verificar se ainda há votações ativas
    const activeVotings = await pool.query('SELECT * FROM match_voting WHERE is_active = true');
    console.log(`📊 Active votings remaining: ${activeVotings.rows.length}`);
    
    if (activeVotings.rows.length > 0) {
      activeVotings.rows.forEach(voting => {
        console.log(`   - ${voting.home_team} vs ${voting.away_team} (${voting.match_date})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixVoting(); 