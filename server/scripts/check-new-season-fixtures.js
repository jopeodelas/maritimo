require('dotenv').config();
const axios = require('axios');

const MARITIMO_TEAM_ID = 214;
const SEASON = 2024;

// Função para formatar o status do jogo
function formatMatchStatus(status) {
  const statusMap = {
    'TBD': '🕒 A definir',
    'NS': '⏳ Não iniciado',
    'LIVE': '⚽ Em andamento',
    'HT': '🏃‍♂️ Intervalo',
    'FT': '✅ Terminado',
    'PST': '⏸️ Adiado',
    'CANC': '❌ Cancelado',
    'ABD': '⛔ Abandonado',
    'AWD': '🏆 Decidido',
    'WO': '🚫 W.O.',
    'PEN': '🎯 Pênaltis'
  };

  return statusMap[status] || status;
}

async function checkNewSeasonFixtures() {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY não está configurada no arquivo .env');
    }

    const api = axios.create({
      baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    });

    // 1. Listar todas as ligas de Portugal
    console.log('🔍 Buscando ligas de Portugal...');
    const leaguesResponse = await api.get('/leagues', {
      params: {
        country: 'Portugal',
        season: SEASON
      }
    });

    console.log('\nLigas encontradas em Portugal:');
    leaguesResponse.data.response.forEach(l => {
      console.log(`- ${l.league.name} (ID: ${l.league.id})`);
    });

    // Encontrar a Liga Portugal 2
    const league = leaguesResponse.data.response.find(l => 
      l.league.name.toLowerCase().includes('liga portugal 2') || 
      l.league.name.toLowerCase().includes('segunda liga') ||
      l.league.name.toLowerCase().includes('liga 2')
    );

    if (!league) {
      throw new Error('Liga Portugal 2 não encontrada');
    }

    const LIGA_PORTUGAL_2_ID = league.league.id;

    console.log(`\n✅ Liga encontrada: ${league.league.name} (ID: ${LIGA_PORTUGAL_2_ID})`);
    console.log(`
📊 Detalhes da Liga:
Nome: ${league.league.name}
País: ${league.country.name}
Temporada: ${league.seasons[0].year}
Status: ${league.seasons[0].current ? 'Atual' : 'Não atual'}
Início: ${new Date(league.seasons[0].start).toLocaleDateString('pt-PT')}
Fim: ${new Date(league.seasons[0].end).toLocaleDateString('pt-PT')}
    `);

    // 2. Buscar jogos do Marítimo
    console.log('\n🔍 Buscando jogos do Marítimo...');
    
    // Primeiro a temporada atual
    const currentSeasonResponse = await api.get('/fixtures', {
      params: {
        season: SEASON,
        league: LIGA_PORTUGAL_2_ID,
        team: MARITIMO_TEAM_ID
      }
    });

    const currentSeasonMatches = currentSeasonResponse.data.response || [];
    
    if (currentSeasonMatches.length > 0) {
      console.log(`\n✅ Found ${currentSeasonMatches.length} matches for Marítimo in season ${SEASON}/${SEASON+1}:`);
      
      // Agrupar jogos por status
      const matchesByStatus = currentSeasonMatches.reduce((acc, match) => {
        const status = match.fixture.status.short;
        if (!acc[status]) acc[status] = [];
        acc[status].push(match);
        return acc;
      }, {});

      // Mostrar resumo por status
      console.log('\n📊 Resumo por status:');
      Object.entries(matchesByStatus).forEach(([status, matches]) => {
        console.log(`${formatMatchStatus(status)}: ${matches.length} jogo(s)`);
      });

      // Mostrar todos os jogos ordenados por data
      console.log('\n📅 Todos os jogos:');
      currentSeasonMatches
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
        .forEach(match => {
          const date = new Date(match.fixture.date);
          console.log(`
🏟️ ${match.teams.home.name} vs ${match.teams.away.name}
📅 ${date.toLocaleDateString('pt-PT')} ${date.toLocaleTimeString('pt-PT')}
📍 Status: ${formatMatchStatus(match.fixture.status.short)}
🆔 Fixture ID: ${match.fixture.id}${match.score?.fulltime ? `
⚽ Placar: ${match.score.fulltime.home ?? '?'} x ${match.score.fulltime.away ?? '?'}` : ''}
          `);
        });
    } else {
      console.log(`❌ No matches found for Marítimo in season ${SEASON}/${SEASON+1}`);
    }

    // Tentar a próxima temporada
    console.log('\n🔄 Verificando próxima temporada...');
    const nextSeasonResponse = await api.get('/fixtures', {
      params: {
        season: SEASON + 1,
        league: LIGA_PORTUGAL_2_ID,
        team: MARITIMO_TEAM_ID
      }
    });

    const nextSeasonMatches = nextSeasonResponse.data.response || [];
    if (nextSeasonMatches.length > 0) {
      console.log(`\n✅ Found ${nextSeasonMatches.length} matches for season ${SEASON+1}/${SEASON+2}:`);
      
      nextSeasonMatches
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
        .forEach(match => {
          const date = new Date(match.fixture.date);
          console.log(`
🏟️ ${match.teams.home.name} vs ${match.teams.away.name}
📅 ${date.toLocaleDateString('pt-PT')} ${date.toLocaleTimeString('pt-PT')}
📍 Status: ${formatMatchStatus(match.fixture.status.short)}
🆔 Fixture ID: ${match.fixture.id}${match.score?.fulltime ? `
⚽ Placar: ${match.score.fulltime.home ?? '?'} x ${match.score.fulltime.away ?? '?'}` : ''}
          `);
        });
    } else {
      console.log(`❌ No matches available yet for season ${SEASON+1}/${SEASON+2}`);
    }

  } catch (error) {
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
      if (error.response.data.errors?.requests) {
        console.log('⚠️ API Request Limit Info:', error.response.data.errors.requests);
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkNewSeasonFixtures(); 