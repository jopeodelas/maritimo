const { Pool } = require('pg');

// Configurações da base de dados do projeto
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123asd!',
  database: 'maritimo_voting',
  port: 5432
});

async function debugAndFixVoting() {
  try {
    console.log('🔍 Debugging voting system...');
    console.log(`Database: maritimo_voting`);
    
    // 1. Verificar todas as votações ativas
    console.log('\n📊 Checking active votings...');
    const activeVotings = await pool.query('SELECT * FROM match_voting WHERE is_active = true ORDER BY created_at DESC');
    console.log(`Found ${activeVotings.rows.length} active voting(s):`);
    
    for (const voting of activeVotings.rows) {
      console.log(`   - ID ${voting.id}: ${voting.home_team} vs ${voting.away_team} (${voting.match_date}) - Match ID: ${voting.match_id}`);
    }
    
    // 2. Verificar todas as votações (ativas e inativas)
    console.log('\n📊 Checking all votings...');
    const allVotings = await pool.query('SELECT * FROM match_voting ORDER BY created_at DESC LIMIT 10');
    console.log(`Last ${allVotings.rows.length} votings:`);
    
    for (const voting of allVotings.rows) {
      console.log(`   - ID ${voting.id}: ${voting.home_team} vs ${voting.away_team} (${voting.match_date}) - Active: ${voting.is_active} - Match ID: ${voting.match_id}`);
    }
    
    // 3. Procurar e remover votações suspeitas
    console.log('\n🧹 Cleaning suspicious votings...');
    
    // Remover votações com nomes de equipas que não sejam do Marítimo
    const suspiciousTeams = ['Sloboda Novi Grad', 'Ljubić Prnjavor', 'Levski Sofia'];
    for (const team of suspiciousTeams) {
      const result = await pool.query(
        'DELETE FROM match_voting WHERE home_team = $1 OR away_team = $1',
        [team]
      );
      if (result.rowCount > 0) {
        console.log(`   ✅ Removed ${result.rowCount} voting(s) involving ${team}`);
      }
    }
    
    // 4. Verificar se temos votações do Marítimo
    console.log('\n⚽ Checking for Marítimo votings...');
    const maritimoVotings = await pool.query(
      `SELECT * FROM match_voting 
       WHERE home_team ILIKE '%maritimo%' OR away_team ILIKE '%maritimo%' 
       ORDER BY created_at DESC LIMIT 5`
    );
    
    console.log(`Found ${maritimoVotings.rows.length} Marítimo voting(s):`);
    for (const voting of maritimoVotings.rows) {
      console.log(`   - ID ${voting.id}: ${voting.home_team} vs ${voting.away_team} (${voting.match_date}) - Active: ${voting.is_active}`);
    }
    
    // 5. Se não há votações ativas do Marítimo, vamos ativar a mais recente
    const activeMaritimo = await pool.query(
      `SELECT * FROM match_voting 
       WHERE (home_team ILIKE '%maritimo%' OR away_team ILIKE '%maritimo%') 
       AND is_active = true`
    );
    
    if (activeMaritimo.rows.length === 0 && maritimoVotings.rows.length > 0) {
      console.log('\n🔄 No active Marítimo voting found, activating most recent...');
      
      // Desativar todas as votações
      await pool.query('UPDATE match_voting SET is_active = false WHERE is_active = true');
      
      // Ativar a votação mais recente do Marítimo
      const mostRecent = maritimoVotings.rows[0];
      await pool.query('UPDATE match_voting SET is_active = true WHERE id = $1', [mostRecent.id]);
      
      console.log(`   ✅ Activated voting: ${mostRecent.home_team} vs ${mostRecent.away_team}`);
    }
    
    // 6. Verificar estado final
    console.log('\n🎯 Final state:');
    const finalActive = await pool.query('SELECT * FROM match_voting WHERE is_active = true');
    if (finalActive.rows.length > 0) {
      const active = finalActive.rows[0];
      console.log(`   ✅ Active voting: ${active.home_team} vs ${active.away_team} (${active.match_date})`);
    } else {
      console.log('   ❌ No active voting found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

debugAndFixVoting(); 