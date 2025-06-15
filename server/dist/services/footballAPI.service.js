"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../config/db"));
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
    'API-Football': parseInt(process.env.MARITIMO_API_FOOTBALL_ID || '214'),
    'Football-Data': parseInt(process.env.MARITIMO_FOOTBALL_DATA_ID || '5529') // Exemplo - será configurado
};
// Liga Portugal 2 ID (Segunda Liga)
const LIGA_PORTUGAL_2_ID = 219;
// Removed hardcoded data - using only real API data
class FootballAPIService {
    constructor() {
        this.currentAPIIndex = 0;
    }
    getCurrentAPI() {
        return API_CONFIGS[this.currentAPIIndex];
    }
    // Buscar o ID correto do CS Marítimo usando o tutorial
    findMaritimoTeamId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Searching for CS Marítimo team ID using search parameter...');
                const data = yield this.makeAPIRequest('/teams', {
                    search: 'Maritimo'
                });
                const teams = data.response || [];
                console.log(`📊 Found ${teams.length} teams matching "Maritimo":`);
                teams.forEach((teamData) => {
                    var _a;
                    const team = teamData.team;
                    console.log(`   - ${team.name} (ID: ${team.id}) - ${team.country} - Liga: ${((_a = teamData.venue) === null || _a === void 0 ? void 0 : _a.name) || 'N/A'}`);
                });
                // Procurar CS Marítimo especificamente
                const maritimoTeam = teams.find((teamData) => {
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
            }
            catch (error) {
                console.error('Error searching for CS Marítimo:', error);
                return null;
            }
        });
    }
    makeAPIRequest(endpoint, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = this.getCurrentAPI();
            try {
                console.log(`🔍 Fetching from ${api.name}: ${endpoint}`);
                const response = yield axios_1.default.get(`${api.baseURL}${endpoint}`, {
                    headers: api.headers,
                    params,
                    timeout: 10000
                });
                return response.data;
            }
            catch (error) {
                console.error(`❌ Error with ${api.name}:`, error.message);
                // Tentar próxima API se disponível
                if (this.currentAPIIndex < API_CONFIGS.length - 1) {
                    this.currentAPIIndex++;
                    console.log(`🔄 Switching to ${this.getCurrentAPI().name}`);
                    return this.makeAPIRequest(endpoint, params);
                }
                throw error;
            }
        });
    }
    // Buscar jogos recentes do CS Marítimo
    getRecentMatches(limit = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'demo_key') {
                    throw new Error('API key não configurada. Configure RAPIDAPI_KEY nas variáveis de ambiente.');
                }
                const teamId = MARITIMO_TEAM_IDS['API-Football']; // 4281 para CS Marítimo
                console.log(`🔍 Attempting to fetch recent matches for CS Marítimo (Team ID: ${teamId})`);
                const data = yield this.makeAPIRequest('/fixtures', {
                    team: teamId,
                    last: limit,
                    status: 'FT',
                    season: 2024 // Temporada atual
                });
                const matches = data.response || [];
                if (matches.length > 0) {
                    console.log(`📊 ✅ API Working! Found ${matches.length} recent matches for CS Marítimo`);
                    // Log dos jogos encontrados para debug
                    matches.forEach((match, index) => {
                        console.log(`🏈 Match ${index + 1}: ${match.teams.home.name} vs ${match.teams.away.name} (${match.fixture.date})`);
                    });
                    return matches;
                }
                else {
                    throw new Error('Nenhum jogo encontrado na API para o CS Marítimo');
                }
            }
            catch (error) {
                console.error('Error fetching recent matches:', error.message);
                throw error;
            }
        });
    }
    // Buscar lineup de um jogo específico
    getMatchLineup(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'demo_key') {
                    throw new Error('API key não configurada. Configure RAPIDAPI_KEY nas variáveis de ambiente.');
                }
                console.log(`🔍 Attempting to fetch lineup for fixture ${fixtureId} from API`);
                const data = yield this.makeAPIRequest(`/fixtures/lineups`, {
                    fixture: fixtureId
                });
                const lineups = data.response || [];
                if (lineups.length > 0) {
                    console.log(`✅ API lineup found for fixture ${fixtureId} with ${lineups.length} team(s)`);
                    return lineups;
                }
                else {
                    throw new Error(`Nenhum lineup encontrado na API para o jogo ${fixtureId}`);
                }
            }
            catch (error) {
                console.error(`Error fetching match lineup for fixture ${fixtureId}:`, error.message);
                throw error;
            }
        });
    }
    // Encontrar e associar jogadores reais com a base de dados
    findAndMatchPlayers(apiPlayers) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            const matchedPlayerIds = [];
            const playerTypes = [];
            try {
                console.log(`🔍 Matching ${apiPlayers.length} players from API with database...`);
                for (const apiPlayer of apiPlayers) {
                    const playerName = this.normalizePlayerName(apiPlayer.player.name);
                    // Primeiro, buscar jogador na tabela players principal
                    const regularPlayerResult = yield client.query(`
          SELECT id, name, position 
          FROM players 
          WHERE LOWER(TRIM(name)) ILIKE $1 
          OR LOWER(TRIM(name)) ILIKE $2
          OR LOWER(TRIM(name)) ILIKE $3
          LIMIT 1
        `, [
                        `%${playerName.toLowerCase()}%`,
                        `%${playerName.split(' ')[0].toLowerCase()}%`,
                        `%${(_a = playerName.split(' ').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()}%` // Último nome
                    ]);
                    if (regularPlayerResult.rows.length > 0) {
                        // Jogador encontrado na tabela principal
                        const dbPlayer = regularPlayerResult.rows[0];
                        matchedPlayerIds.push(dbPlayer.id);
                        playerTypes.push('regular');
                        console.log(`✅ Matched regular player: ${apiPlayer.player.name} -> ${dbPlayer.name} (ID: ${dbPlayer.id})`);
                    }
                    else {
                        // Verificar se já existe na tabela match_players
                        const matchPlayerResult = yield client.query(`
            SELECT id, name, position 
            FROM match_players 
            WHERE api_player_id = $1 OR LOWER(TRIM(name)) ILIKE $2
            LIMIT 1
          `, [
                            apiPlayer.player.id,
                            `%${playerName.toLowerCase()}%`
                        ]);
                        if (matchPlayerResult.rows.length > 0) {
                            // Jogador já existe na tabela match_players
                            const matchPlayer = matchPlayerResult.rows[0];
                            matchedPlayerIds.push(matchPlayer.id);
                            playerTypes.push('match');
                            console.log(`✅ Found existing match player: ${apiPlayer.player.name} -> ${matchPlayer.name} (ID: ${matchPlayer.id})`);
                        }
                        else {
                            // Criar novo jogador temporário na tabela match_players
                            console.log(`➕ Creating temporary match player: ${apiPlayer.player.name}`);
                            const positionMap = {
                                'G': 'Guarda-redes',
                                'D': 'Defesa',
                                'M': 'Médio',
                                'A': 'Atacante'
                            };
                            const position = positionMap[apiPlayer.player.pos] || 'Jogador';
                            const insertResult = yield client.query(`
              INSERT INTO match_players (name, position, image_url, api_player_id, api_player_name)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING id
            `, [
                                apiPlayer.player.name,
                                position,
                                null,
                                apiPlayer.player.id,
                                apiPlayer.player.name
                            ]);
                            const newPlayerId = insertResult.rows[0].id;
                            matchedPlayerIds.push(newPlayerId);
                            playerTypes.push('match');
                            console.log(`✅ Created temporary match player: ${apiPlayer.player.name} (ID: ${newPlayerId})`);
                        }
                    }
                }
                console.log(`🎯 Successfully processed ${matchedPlayerIds.length}/${apiPlayers.length} players`);
                console.log(`📊 Regular players: ${playerTypes.filter(t => t === 'regular').length}, Match players: ${playerTypes.filter(t => t === 'match').length}`);
                return { playerIds: matchedPlayerIds, playerTypes };
            }
            catch (error) {
                console.error('Error matching/creating players:', error);
                return { playerIds: [], playerTypes: [] };
            }
            finally {
                client.release();
            }
        });
    }
    // Normalizar nomes de jogadores para melhor matching
    normalizePlayerName(name) {
        return name
            .replace(/[^\w\s]/g, '') // Remove símbolos
            .replace(/\s+/g, ' ') // Normaliza espaços
            .trim()
            .toLowerCase();
    }
    // Criar votação automática baseada no último jogo real
    createAutoVotingFromRealMatch() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                console.log('🚀 Starting automatic voting creation from real match data...');
                // Buscar último jogo do Marítimo
                const recentMatches = yield this.getRecentMatches(1);
                if (recentMatches.length === 0) {
                    return { success: false, message: 'Nenhum jogo recente encontrado' };
                }
                const lastMatch = recentMatches[0];
                console.log(`📅 Last match: ${lastMatch.teams.home.name} vs ${lastMatch.teams.away.name}`);
                // Buscar lineup do jogo
                const lineups = yield this.getMatchLineup(lastMatch.fixture.id);
                if (lineups.length === 0) {
                    return { success: false, message: 'Lineup não encontrado para o último jogo' };
                }
                // Encontrar lineup do Marítimo
                console.log(`👥 Available lineups for match ${lastMatch.fixture.id}:`);
                lineups.forEach((lineup, index) => {
                    console.log(`   ${index + 1}. ${lineup.team.name} (ID: ${lineup.team.id})`);
                });
                const maritimoLineup = lineups.find((lineup) => lineup.team.id === MARITIMO_TEAM_IDS['API-Football'] || // Buscar por ID primeiro
                    lineup.team.name.toLowerCase().includes('marítimo') ||
                    lineup.team.name.toLowerCase().includes('maritimo') ||
                    lineup.team.name.toLowerCase().includes('cs marítimo') ||
                    lineup.team.name.toLowerCase().includes('cs maritimo'));
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
                const matchResult = yield this.findAndMatchPlayers(allPlayers);
                const { playerIds: matchedPlayerIds, playerTypes } = matchResult;
                if (matchedPlayerIds.length === 0) {
                    return { success: false, message: 'Nenhum jogador foi processado' };
                }
                yield client.query('BEGIN');
                // Desativar votações ativas
                yield client.query('UPDATE match_voting SET is_active = false WHERE is_active = true');
                // Criar nova votação
                const homeTeam = lastMatch.teams.home.name;
                const awayTeam = lastMatch.teams.away.name;
                const matchDate = new Date(lastMatch.fixture.date).toISOString().split('T')[0];
                const votingResult = yield client.query(`
        INSERT INTO match_voting (home_team, away_team, match_date, is_active, match_id)
        VALUES ($1, $2, $3, true, $4)
        RETURNING id
      `, [homeTeam, awayTeam, matchDate, lastMatch.fixture.id]);
                const votingId = votingResult.rows[0].id;
                // Adicionar jogadores à votação
                for (let i = 0; i < matchedPlayerIds.length; i++) {
                    const playerId = matchedPlayerIds[i];
                    const playerType = playerTypes[i];
                    if (playerType === 'regular') {
                        yield client.query(`
            INSERT INTO match_voting_players (match_voting_id, player_id, player_type)
            VALUES ($1, $2, 'regular')
            ON CONFLICT DO NOTHING
          `, [votingId, playerId]);
                    }
                    else {
                        yield client.query(`
            INSERT INTO match_voting_players (match_voting_id, match_player_id, player_type)
            VALUES ($1, $2, 'match')
            ON CONFLICT DO NOTHING
          `, [votingId, playerId]);
                    }
                }
                yield client.query('COMMIT');
                const matchInfo = {
                    homeTeam,
                    awayTeam,
                    matchDate,
                    playersCount: matchedPlayerIds.length,
                    regularPlayersCount: playerTypes.filter(t => t === 'regular').length,
                    matchPlayersCount: playerTypes.filter(t => t === 'match').length,
                    fixtureId: lastMatch.fixture.id
                };
                console.log('🎉 Automatic voting created successfully!');
                return {
                    success: true,
                    message: `Votação criada automaticamente: ${homeTeam} vs ${awayTeam} com ${matchedPlayerIds.length} jogadores`,
                    matchInfo
                };
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.error('Error creating auto voting from real match:', error);
                return {
                    success: false,
                    message: 'Erro ao criar votação automática: ' + error.message
                };
            }
            finally {
                client.release();
            }
        });
    }
    // Verificar se há novos jogos e criar votações automaticamente
    checkAndCreateNewVotings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔄 Checking for new matches that need voting...');
                const client = yield db_1.default.connect();
                // Verificar último jogo com votação
                const lastVotingResult = yield client.query(`
        SELECT match_id, match_date 
        FROM match_voting 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
                client.release();
                const recentMatches = yield this.getRecentMatches(3);
                for (const match of recentMatches) {
                    const hasVoting = lastVotingResult.rows.some((voting) => voting.match_id === match.fixture.id);
                    if (!hasVoting) {
                        console.log(`🆕 New match found without voting: ${match.teams.home.name} vs ${match.teams.away.name}`);
                        yield this.createAutoVotingFromRealMatch();
                        break; // Criar apenas uma votação de cada vez
                    }
                }
            }
            catch (error) {
                console.error('Error checking for new votings:', error);
            }
        });
    }
}
exports.default = new FootballAPIService();
