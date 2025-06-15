const axios = require('axios');

const RAPIDAPI_KEY = '538457339emsh0e239503b227d35pt4344ejsn888074e2b31c';

async function testMaritimoSearch() {
  try {
    console.log('🔍 Testing CS Marítimo search...');
    
    // Teste 1: Buscar por "Maritimo"
    console.log('\n--- Test 1: Search "Maritimo" ---');
    const search1 = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: {
        search: 'Maritimo'
      }
    });
    
    console.log('Teams found:', search1.data.response.length);
    search1.data.response.forEach(teamData => {
      const team = teamData.team;
      console.log(`   - ${team.name} (ID: ${team.id}) - ${team.country} - Founded: ${team.founded}`);
    });
    
    // Teste 2: Buscar por "CS Maritimo"
    console.log('\n--- Test 2: Search "CS Maritimo" ---');
    const search2 = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: {
        search: 'CS Maritimo'
      }
    });
    
    console.log('Teams found:', search2.data.response.length);
    search2.data.response.forEach(teamData => {
      const team = teamData.team;
      console.log(`   - ${team.name} (ID: ${team.id}) - ${team.country} - Founded: ${team.founded}`);
    });
    
    // Teste 3: Buscar equipas portuguesas
    console.log('\n--- Test 3: Portuguese teams ---');
    const search3 = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      },
      params: {
        country: 'Portugal'
      }
    });
    
    console.log('Portuguese teams found:', search3.data.response.length);
    const maritimoTeams = search3.data.response.filter(teamData => {
      const team = teamData.team;
      return team.name.toLowerCase().includes('maritimo') || 
             team.name.toLowerCase().includes('marítimo');
    });
    
    console.log('Marítimo teams found:', maritimoTeams.length);
    maritimoTeams.forEach(teamData => {
      const team = teamData.team;
      console.log(`   ✅ ${team.name} (ID: ${team.id}) - Founded: ${team.founded}`);
    });
    
    // Teste 4: Teste com ID específico 4281
    console.log('\n--- Test 4: Test specific ID 4281 ---');
    try {
      const teamTest = await axios.get('https://api-football-v1.p.rapidapi.com/v3/teams', {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        },
        params: {
          id: 4281
        }
      });
      
      if (teamTest.data.response.length > 0) {
        const team = teamTest.data.response[0].team;
        console.log(`   Team ID 4281: ${team.name} - ${team.country}`);
      } else {
        console.log('   Team ID 4281: Not found');
      }
    } catch (error) {
      console.log('   Team ID 4281: Error -', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing search:', error.response?.data || error.message);
  }
}

testMaritimoSearch(); 