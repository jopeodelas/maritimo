const axios = require('axios');

const RAPIDAPI_KEY = '538457339emsh0e239503b227d35pt4344ejsn888074e2b31c';

async function checkTeamId() {
  try {
    // Verificar ID 214
    console.log('🔍 Checking Team ID 214...');
    const team214 = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: { id: 214 }
    });
    
    if (team214.data.response.length > 0) {
      const team = team214.data.response[0].team;
      console.log(`✅ Team ID 214: ${team.name} - ${team.country} - Founded: ${team.founded}`);
    } else {
      console.log('❌ Team ID 214: Not found');
    }
    
    // Verificar ID 4281
    console.log('\n🔍 Checking Team ID 4281...');
    const team4281 = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: { id: 4281 }
    });
    
    if (team4281.data.response.length > 0) {
      const team = team4281.data.response[0].team;
      console.log(`✅ Team ID 4281: ${team.name} - ${team.country} - Founded: ${team.founded}`);
    } else {
      console.log('❌ Team ID 4281: Not found');
    }
    
    // Buscar por nome
    console.log('\n🔍 Searching for "Maritimo"...');
    const search = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: { search: 'Maritimo' }
    });
    
    console.log(`📊 Found ${search.data.response.length} teams matching "Maritimo":`);
    search.data.response.forEach(teamData => {
      const team = teamData.team;
      console.log(`   - ${team.name} (ID: ${team.id}) - ${team.country} - Founded: ${team.founded}`);
    });
    
    // Verificar jogos recentes do ID 214
    console.log('\n🔍 Checking recent matches for Team ID 214...');
    const matches214 = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: { 
        team: 214,
        last: 3,
        season: 2024
      }
    });
    
    if (matches214.data.response.length > 0) {
      console.log(`🏈 Recent matches for Team ID 214:`);
      matches214.data.response.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name} (${match.fixture.date})`);
      });
    } else {
      console.log('❌ No recent matches found for Team ID 214');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkTeamId(); 