import axios from 'axios';
import pool from '../config/db';
import footballCacheService from './footballCache.service';

// Interface para dados dos jogos da API
interface APIFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  score?: {
    fulltime?: {
      home: number | null;
      away: number | null;
    };
  };
  lineups?: {
    team: {
      id: number;
      name: string;
    };
    startXI: {
      player: {
        id: number;
        name: string;
        pos: string;
        number?: number;
      };
    }[];
    substitutes: {
      player: {
        id: number;
        name: string;
        pos: string;
        number?: number;
      };
    }[];
  }[];
}

// Configuração das APIs (múltiplas opções para redundância)
const API_CONFIGS = [
  {
    name: 'API-Football',
    baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'demo_key',
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  },
  {
    name: 'Football-Data',
    baseURL: 'https://api.football-data.org/v4',
    headers: {
      'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN || 'demo_token'
    }
  }
];

// ID do CS Marítimo nas diferentes APIs
const MARITIMO_TEAM_IDS = {
  'API-Football': parseInt(process.env.MARITIMO_API_FOOTBALL_ID || '214'), // CS Marítimo real ID correto
  'Football-Data': parseInt(process.env.MARITIMO_FOOTBALL_DATA_ID || '5529') // Exemplo - será configurado
};

// Liga Portugal 2 ID (Segunda Liga)
const LIGA_PORTUGAL_2_ID = 219;

// Removed hardcoded data - using only real API data

class FootballAPIService {
  private currentAPIIndex = 0;

  private getCurrentAPI() {
    return API_CONFIGS[this.currentAPIIndex];
  }

  // Buscar o ID correto do CS Marítimo usando o tutorial
  async findMaritimoTeamId(): Promise<number | null> {
    try {
      console.log('🔍 Searching for CS Marítimo team ID using search parameter...');
      
      const data = await this.makeAPIRequest('/teams', {
        search: 'Maritimo'
      });

      const teams = data.response || [];
      console.log(`📊 Found ${teams.length} teams matching "Maritimo":`);
      
      teams.forEach((teamData: any) => {
        const team = teamData.team;
        console.log(`   - ${team.name} (ID: ${team.id}) - ${team.country} - Liga: ${teamData.venue?.name || 'N/A'}`);
      });

      // Procurar CS Marítimo especificamente
      const maritimoTeam = teams.find((teamData: any) => {
        const team = teamData.team;
        return team.name.toLowerCase().includes('marítimo') || 
               team.name.toLowerCase().includes('maritimo') ||
               team.name.toLowerCase().includes('cs marítimo');
      });

      if (maritimoTeam) {
        console.log(`✅ Found CS Marítimo: ${maritimoTeam.team.name} (ID: ${maritimoTeam.team.id})`);
        return maritimoTeam.team.id;
      }

      console.log('❌ CS Marítimo not found in search results');
      return null;
    } catch (error) {
      console.error('Error searching for CS Marítimo:', error);
      return null;
    }
  }

  private async makeAPIRequest(endpoint: string, params: any = {}): Promise<any> {
    const api = this.getCurrentAPI();
    
    try {
      console.log(`🔍 Fetching from ${api.name}: ${endpoint}`);
      
      const response = await axios.get(`${api.baseURL}${endpoint}`, {
        headers: api.headers,
        params,
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error with ${api.name}:`, error.message);
      
      // Tentar próxima API se disponível
      if (this.currentAPIIndex < API_CONFIGS.length - 1) {
        this.currentAPIIndex++;
        console.log(`🔄 Switching to ${this.getCurrentAPI().name}`);
        return this.makeAPIRequest(endpoint, params);
      }
      
      throw error;
    }
  }

  // Buscar jogos recentes do CS Marítimo
  async getRecentMatches(limit: number = 5): Promise<APIFixture[]> {
    try {
      if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'demo_key') {
        throw new Error('API key não configurada. Configure RAPIDAPI_KEY nas variáveis de ambiente.');
      }

      const teamId = MARITIMO_TEAM_IDS['API-Football']; // 4281 para CS Marítimo
      
      console.log(`🔍 Attempting to fetch recent matches for CS Marítimo (Team ID: ${teamId})`);
      
      const data = await this.makeAPIRequest('/fixtures', {
        team: teamId,
        last: limit,
        status: 'FT', // Apenas jogos terminados
        season: 2024 // Temporada atual
      });

      const matches = data.response || [];
      
      if (matches.length > 0) {
        console.log(`📊 ✅ API Working! Found ${matches.length} recent matches for CS Marítimo`);
        
        // Log dos jogos encontrados para debug
        matches.forEach((match: APIFixture, index: number) => {
          console.log(`🏈 Match ${index + 1}: ${match.teams.home.name} vs ${match.teams.away.name} (${match.fixture.date})`);
        });

        return matches;
      } else {
        throw new Error('Nenhum jogo encontrado na API para o CS Marítimo');
      }
    } catch (error: any) {
      console.error('Error fetching recent matches:', error.message);
      throw error;
    }
  }

  // Buscar lineup de um jogo específico
  async getMatchLineup(fixtureId: number): Promise<any> {
    try {
      if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'demo_key') {
        throw new Error('API key não configurada. Configure RAPIDAPI_KEY nas variáveis de ambiente.');
      }
      
      console.log(`🔍 Attempting to fetch lineup for fixture ${fixtureId} from API`);
      
      const data = await this.makeAPIRequest(`/fixtures/lineups`, {
        fixture: fixtureId
      });

      const lineups = data.response || [];
      
      if (lineups.length > 0) {
        console.log(`✅ API lineup found for fixture ${fixtureId} with ${lineups.length} team(s)`);
        return lineups;
      } else {
        throw new Error(`Nenhum lineup encontrado na API para o jogo ${fixtureId}`);
      }
    } catch (error: any) {
      console.error(`Error fetching match lineup for fixture ${fixtureId}:`, error.message);
      throw error;
    }
  }

  // Encontrar e associar jogadores reais com a base de dados
  async findAndMatchPlayers(apiPlayers: any[]): Promise<number[]> {
    const client = await pool.connect();
    const matchedPlayerIds: number[] = [];

    try {
      console.log(`🔍 Matching ${apiPlayers.length} players from API with database...`);

      for (const apiPlayer of apiPlayers) {
        const playerName = this.normalizePlayerName(apiPlayer.player.name);
        
        // Buscar jogador na base de dados por nome similar
        const result = await client.query(`
          SELECT id, name, position 
          FROM players 
          WHERE LOWER(TRIM(name)) ILIKE $1 
          OR LOWER(TRIM(name)) ILIKE $2
          OR LOWER(TRIM(name)) ILIKE $3
          LIMIT 1
        `, [
          `%${playerName.toLowerCase()}%`,
          `%${playerName.split(' ')[0].toLowerCase()}%`, // Primeiro nome
          `%${playerName.split(' ').pop()?.toLowerCase()}%` // Último nome
        ]);

        if (result.rows.length > 0) {
          const dbPlayer = result.rows[0];
          matchedPlayerIds.push(dbPlayer.id);
          console.log(`✅ Matched: ${apiPlayer.player.name} -> ${dbPlayer.name} (ID: ${dbPlayer.id})`);
        } else {
          // Criar jogador temporário se não existir
          console.log(`➕ Creating temporary player: ${apiPlayer.player.name}`);
          
          const positionMap: { [key: string]: string } = {
            'G': 'Guarda-redes',
            'D': 'Defesa', 
            'M': 'Médio',
            'A': 'Atacante'
          };
          
          const position = positionMap[apiPlayer.player.pos] || 'Jogador';
          
          const insertResult = await client.query(`
            INSERT INTO players (name, position, image_url)
            VALUES ($1, $2, $3)
            RETURNING id
          `, [
            apiPlayer.player.name,
            position,
            null // Sem imagem por enquanto
          ]);
          
          const newPlayerId = insertResult.rows[0].id;
          matchedPlayerIds.push(newPlayerId);
          console.log(`✅ Created temporary player: ${apiPlayer.player.name} (ID: ${newPlayerId})`);
        }
      }

      console.log(`🎯 Successfully processed ${matchedPlayerIds.length}/${apiPlayers.length} players`);
      return matchedPlayerIds;

    } catch (error) {
      console.error('Error matching/creating players:', error);
      return [];
    } finally {
      client.release();
    }
  }

  // Normalizar nomes de jogadores para melhor matching
  private normalizePlayerName(name: string): string {
    return name
      .replace(/[^\w\s]/g, '') // Remove símbolos
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim()
      .toLowerCase();
  }

  // Criar votação automática baseada no último jogo real
  async createAutoVotingFromRealMatch(): Promise<{ success: boolean; message: string; matchInfo?: any }> {
    const client = await pool.connect();

    try {
      console.log('🚀 Starting automatic voting creation from real match data...');

      // Buscar último jogo do Marítimo
      const recentMatches = await this.getRecentMatches(1);
      
      if (recentMatches.length === 0) {
        return { success: false, message: 'Nenhum jogo recente encontrado' };
      }

      const lastMatch = recentMatches[0];
      console.log(`📅 Last match: ${lastMatch.teams.home.name} vs ${lastMatch.teams.away.name}`);

      // Buscar lineup do jogo
      const lineups = await this.getMatchLineup(lastMatch.fixture.id);
      
      if (lineups.length === 0) {
        return { success: false, message: 'Lineup não encontrado para o último jogo' };
      }

      // Encontrar lineup do Marítimo
      console.log(`👥 Available lineups for match ${lastMatch.fixture.id}:`);
      lineups.forEach((lineup: any, index: number) => {
        console.log(`   ${index + 1}. ${lineup.team.name} (ID: ${lineup.team.id})`);
      });

      const maritimoLineup = lineups.find((lineup: any) => 
        lineup.team.id === MARITIMO_TEAM_IDS['API-Football'] || // Buscar por ID primeiro
        lineup.team.name.toLowerCase().includes('marítimo') ||
        lineup.team.name.toLowerCase().includes('maritimo') ||
        lineup.team.name.toLowerCase().includes('cs marítimo') ||
        lineup.team.name.toLowerCase().includes('cs maritimo')
      );

      if (!maritimoLineup) {
        console.log('❌ CS Marítimo lineup not found in available lineups');
        return { success: false, message: 'Lineup do Marítimo não encontrado' };
      }

      console.log(`✅ Found CS Marítimo lineup: ${maritimoLineup.team.name} (ID: ${maritimoLineup.team.id})`);

      // Combinar titulares e suplentes
      const allPlayers = [
        ...maritimoLineup.startXI,
        ...maritimoLineup.substitutes
      ];

      console.log(`👥 Found ${allPlayers.length} players in the match`);

      // Associar jogadores com a base de dados OU criar temporários
      const matchedPlayerIds = await this.findAndMatchPlayers(allPlayers);

      if (matchedPlayerIds.length === 0) {
        return { success: false, message: 'Nenhum jogador foi processado' };
      }

      await client.query('BEGIN');

      // Desativar votações ativas
      await client.query('UPDATE match_voting SET is_active = false WHERE is_active = true');

      // Criar nova votação
      const homeTeam = lastMatch.teams.home.name;
      const awayTeam = lastMatch.teams.away.name;
      const matchDate = new Date(lastMatch.fixture.date).toISOString().split('T')[0];

      const votingResult = await client.query(`
        INSERT INTO match_voting (home_team, away_team, match_date, is_active, match_id)
        VALUES ($1, $2, $3, true, $4)
        RETURNING id
      `, [homeTeam, awayTeam, matchDate, lastMatch.fixture.id]);

      const votingId = votingResult.rows[0].id;

      // Adicionar jogadores à votação
      for (const playerId of matchedPlayerIds) {
        await client.query(`
          INSERT INTO match_voting_players (match_voting_id, player_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [votingId, playerId]);
      }

      await client.query('COMMIT');

      const matchInfo = {
        homeTeam,
        awayTeam,
        matchDate,
        playersCount: matchedPlayerIds.length,
        fixtureId: lastMatch.fixture.id
      };

      console.log('🎉 Automatic voting created successfully!');
      
      return {
        success: true,
        message: `Votação criada automaticamente: ${homeTeam} vs ${awayTeam} com ${matchedPlayerIds.length} jogadores`,
        matchInfo
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating auto voting from real match:', error);
      return {
        success: false,
        message: 'Erro ao criar votação automática: ' + (error as any).message
      };
    } finally {
      client.release();
    }
  }

  // Verificar se há novos jogos e criar votações automaticamente
  async checkAndCreateNewVotings(): Promise<void> {
    try {
      console.log('🔄 Checking for new matches that need voting...');

      const client = await pool.connect();

      // Verificar último jogo com votação
      const lastVotingResult = await client.query(`
        SELECT match_id, match_date 
        FROM match_voting 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      client.release();

      const recentMatches = await this.getRecentMatches(3);
      
      for (const match of recentMatches) {
        const hasVoting = lastVotingResult.rows.some(
          (voting: any) => voting.match_id === match.fixture.id
        );

        if (!hasVoting) {
          console.log(`🆕 New match found without voting: ${match.teams.home.name} vs ${match.teams.away.name}`);
          await this.createAutoVotingFromRealMatch();
          break; // Criar apenas uma votação de cada vez
        }
      }

    } catch (error) {
      console.error('Error checking for new votings:', error);
    }
  }
}

export default new FootballAPIService(); 