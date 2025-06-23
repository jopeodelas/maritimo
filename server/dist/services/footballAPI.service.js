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
    'API-Football': 214,
    'Football-Data': parseInt(process.env.MARITIMO_FOOTBALL_DATA_ID || '5529') // Exemplo - será configurado
};
// Liga Portugal 2 ID (Segunda Liga)
const LIGA_PORTUGAL_2_ID = 219;
// Removed hardcoded data - using only real API data
class FootballAPIService {
    constructor() {
        this.currentAPIIndex = 0;
        // Mapeamento manual para casos especiais onde API e BD têm nomes diferentes
        this.specialNameMappings = {
            // API name -> BD name (normalized)
            'daniel silva': 'daniel benchimol',
            // Adicionar outros casos especiais conforme necessário
        };
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
                // Procurar CS Marítimo especificamente (Portugal)
                const maritimoTeam = teams.find((teamData) => {
                    const team = teamData.team;
                    return (team.name.toLowerCase().includes('marítimo') ||
                        team.name.toLowerCase().includes('maritimo') ||
                        team.name.toLowerCase().includes('cs marítimo')) &&
                        team.country === 'Portugal' &&
                        team.id === 214; // Garantir que é o CS Marítimo correto
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
                const teamId = MARITIMO_TEAM_IDS['API-Football']; // 214 para CS Marítimo
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
    // Mapeamento para detectar nomes com iniciais diferentes
    detectInitialMatch(apiName, dbPlayers) {
        const normalizedAPI = this.normalizePlayerName(apiName);
        const parts = normalizedAPI.split(' ');
        if (parts.length >= 2) {
            const firstPart = parts[0];
            const lastName = parts[parts.length - 1];
            // Se o primeiro é uma inicial (1 char)
            if (firstPart.length === 1) {
                // Procurar jogador que comece com esta inicial e tenha o mesmo apelido
                for (const player of dbPlayers) {
                    const normalizedDB = this.normalizePlayerName(player.name);
                    const dbParts = normalizedDB.split(' ');
                    if (dbParts.length >= 2) {
                        const dbFirstName = dbParts[0];
                        const dbLastName = dbParts[dbParts.length - 1];
                        // Verificar se inicial coincide e apelido é igual
                        if (dbFirstName.startsWith(firstPart) && dbLastName === lastName) {
                            return player;
                        }
                    }
                }
                // Se não encontrou, tentar caso onde a inicial pode ser de nome do meio
                // Ex: "E. Peña Zauner" pode ser só "Peña Zauner" na BD
                if (parts.length >= 3) {
                    const possibleFirstName = parts[1]; // "pena" em "e pena zauner"
                    for (const player of dbPlayers) {
                        const normalizedDB = this.normalizePlayerName(player.name);
                        const dbParts = normalizedDB.split(' ');
                        if (dbParts.length >= 2) {
                            const dbFirstName = dbParts[0];
                            const dbLastName = dbParts[dbParts.length - 1];
                            // Verificar se nome e apelido coincidem (ignorando a inicial)
                            if (dbFirstName === possibleFirstName && dbLastName === lastName) {
                                return player;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    // Encontrar e associar jogadores reais com a base de dados
    findAndMatchPlayers(apiPlayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            const matchedPlayerIds = [];
            const playerTypes = [];
            try {
                console.log(`🔍 Matching ${apiPlayers.length} players from API with database...`);
                // Buscar todos os jogadores da BD para usar na detecção de iniciais
                const allDBPlayers = yield client.query('SELECT id, name, position FROM players');
                for (const apiPlayer of apiPlayers) {
                    let playerName = this.normalizePlayerName(apiPlayer.player.name);
                    // Verificar mapeamento manual primeiro
                    if (this.specialNameMappings[playerName]) {
                        playerName = this.specialNameMappings[playerName];
                        console.log(`🔄 Using special mapping: "${apiPlayer.player.name}" -> "${playerName}"`);
                    }
                    // Primeiro, buscar jogador na tabela players principal com matching melhorado
                    console.log(`🔍 Searching for: "${apiPlayer.player.name}" -> normalized: "${playerName}"`);
                    // Verificar se playerName não está vazio
                    if (!playerName || playerName.trim() === '') {
                        console.log(`   ⚠️  Empty player name, skipping matching`);
                        continue;
                    }
                    // 1. Busca exata primeiro
                    let regularPlayerResult = yield client.query(`
          SELECT id, name, position, 
                 'exact' as match_type,
                 1 as priority
          FROM players 
          WHERE LOWER(TRIM(name)) = $1::text
        `, [playerName.toLowerCase()]);
                    // 2. Se não encontrar exato, busca por nome completo similar (sem similarity por ora)
                    if (regularPlayerResult.rows.length === 0) {
                        regularPlayerResult = yield client.query(`
            SELECT id, name, position,
                   'full_similar' as match_type,
                   2 as priority
            FROM players 
            WHERE LOWER(TRIM(name)) ILIKE $1::text
            ORDER BY LENGTH(name) ASC
            LIMIT 1
          `, [
                            `%${playerName.toLowerCase()}%`
                        ]);
                    }
                    // 3. Se ainda não encontrar, busca por nomes individuais (detectar iniciais)
                    if (regularPlayerResult.rows.length === 0) {
                        const nameParts = playerName.split(' ').filter(part => part.length > 0);
                        if (nameParts.length >= 2) {
                            const firstName = nameParts[0];
                            const lastName = nameParts[nameParts.length - 1];
                            // Detectar se é uma inicial (1 caractere)
                            if (firstName.length === 1 && lastName.length > 2) {
                                // Buscar por apelido apenas (para casos como "N. Madsen" -> "Noah Madsen")
                                console.log(`   🔍 Detected initial "${firstName}.", searching by surname "${lastName}"`);
                                regularPlayerResult = yield client.query(`
                SELECT id, name, position,
                       'surname_match' as match_type,
                       3 as priority
                FROM players 
                WHERE LOWER(TRIM(name)) ILIKE $1::text
                AND LOWER(TRIM(name)) ILIKE $2::text
          LIMIT 1
        `, [
                                    `${firstName}%`,
                                    `%${lastName}%` // Contém o apelido
                                ]);
                                // Se não encontrar, tentar apenas por apelido
                                if (regularPlayerResult.rows.length === 0) {
                                    regularPlayerResult = yield client.query(`
                  SELECT id, name, position,
                         'surname_only' as match_type,
                         4 as priority
                  FROM players 
                  WHERE LOWER(TRIM(name)) ILIKE $1::text
                  LIMIT 1
                `, [`%${lastName}%`]);
                                }
                            }
                            else if (firstName.length >= 3) {
                                // Busca normal por ambos os nomes (para nomes completos)
                                regularPlayerResult = yield client.query(`
                SELECT id, name, position,
                       'both_names' as match_type,
                       3 as priority
                FROM players 
                WHERE LOWER(TRIM(name)) ILIKE $1::text 
                AND LOWER(TRIM(name)) ILIKE $2::text
                LIMIT 1
              `, [
                                    `%${firstName}%`,
                                    `%${lastName}%`
                                ]);
                            }
                        }
                    }
                    console.log(`   Query results: ${regularPlayerResult.rows.length} matches`);
                    if (regularPlayerResult.rows.length > 0) {
                        const match = regularPlayerResult.rows[0];
                        console.log(`   Best match: "${match.name}" (${match.match_type}, priority: ${match.priority})`);
                    }
                    if (regularPlayerResult.rows.length > 0) {
                        // Jogador encontrado na tabela principal
                        const dbPlayer = regularPlayerResult.rows[0];
                        matchedPlayerIds.push(dbPlayer.id);
                        playerTypes.push('regular');
                        console.log(`✅ Matched regular player: ${apiPlayer.player.name} -> ${dbPlayer.name} (ID: ${dbPlayer.id})`);
                    }
                    else {
                        // 4. Tentar detecção automática de iniciais
                        const initialMatch = this.detectInitialMatch(apiPlayer.player.name, allDBPlayers.rows);
                        if (initialMatch) {
                            matchedPlayerIds.push(initialMatch.id);
                            playerTypes.push('regular');
                            console.log(`✅ Matched player by initial: ${apiPlayer.player.name} -> ${initialMatch.name} (ID: ${initialMatch.id})`);
                            continue;
                        }
                        // 5. Se não encontrar nada, criar temporário
                        // Verificar se já existe na tabela match_players
                        const matchPlayerResult = yield client.query(`
            SELECT id, name, position 
            FROM match_players 
            WHERE api_player_id = $1::integer OR LOWER(TRIM(name)) ILIKE $2::text
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
            .normalize('NFD') // Separar caracteres base dos acentos
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^\w\s]/g, '') // Remove símbolos restantes
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
                // Buscar eventos para identificar substituições
                const eventsData = yield this.makeAPIRequest(`/fixtures/events`, {
                    fixture: lastMatch.fixture.id
                });
                // Identificar jogadores que efetivamente jogaram
                const playersWhoPlayed = new Set();
                // Adicionar todos os titulares (Starting XI)
                maritimoLineup.startXI.forEach((item) => {
                    playersWhoPlayed.add(item.player.name);
                });
                // Se temos dados de eventos, adicionar suplentes que entraram
                if (eventsData.response && eventsData.response.length > 0) {
                    const maritimoEvents = eventsData.response.filter((event) => event.team.id === MARITIMO_TEAM_IDS['API-Football']);
                    const substitutions = maritimoEvents.filter((event) => event.type === 'subst');
                    console.log(`🔄 Found ${substitutions.length} substitutions made by Marítimo`);
                    substitutions.forEach((sub) => {
                        // Adicionar jogador que entrou
                        if (sub.assist && sub.assist.name) {
                            playersWhoPlayed.add(sub.assist.name);
                            console.log(`   ${sub.time.elapsed}' IN: ${sub.assist.name}`);
                        }
                    });
                }
                // Filtrar apenas jogadores que efetivamente jogaram
                const startingXI = maritimoLineup.startXI.filter((item) => playersWhoPlayed.has(item.player.name));
                const substitutesWhoPlayed = maritimoLineup.substitutes.filter((item) => playersWhoPlayed.has(item.player.name));
                // Combinar apenas jogadores que efetivamente jogaram
                const allPlayers = [
                    ...startingXI,
                    ...substitutesWhoPlayed
                ];
                console.log(`⚽ Found ${allPlayers.length} players who actually played (${startingXI.length} starters + ${substitutesWhoPlayed.length} subs)`);
                console.log(`📊 Total squad: ${maritimoLineup.startXI.length + maritimoLineup.substitutes.length}, but only ${allPlayers.length} played`);
                // Associar jogadores com a base de dados OU criar temporários
                const matchResult = yield this.findAndMatchPlayers(allPlayers);
                const { playerIds: matchedPlayerIds, playerTypes } = matchResult;
                if (matchedPlayerIds.length === 0) {
                    return { success: false, message: 'Nenhum jogador foi processado' };
                }
                yield client.query('BEGIN');
                // VERIFICAR se já existe uma votação para este jogo específico
                const existingVotingCheck = yield client.query('SELECT id, is_active FROM match_voting WHERE match_id = $1 ORDER BY created_at DESC LIMIT 1', [lastMatch.fixture.id]);
                if (existingVotingCheck.rows.length > 0) {
                    const existingVoting = existingVotingCheck.rows[0];
                    if (existingVoting.is_active) {
                        // Já existe uma votação ativa para este jogo
                        console.log(`✅ Voting already exists and is active for match ${lastMatch.fixture.id}`);
                        yield client.query('ROLLBACK');
                        return {
                            success: true,
                            message: `Votação já existe para ${lastMatch.teams.home.name} vs ${lastMatch.teams.away.name}`,
                            matchInfo: {
                                homeTeam: lastMatch.teams.home.name,
                                awayTeam: lastMatch.teams.away.name,
                                matchDate: new Date(lastMatch.fixture.date).toISOString().split('T')[0],
                                fixtureId: lastMatch.fixture.id,
                                existingVotingId: existingVoting.id
                            }
                        };
                    }
                    else {
                        // Existe uma votação inativa para este jogo - reactivar em vez de criar nova
                        console.log(`🔄 Reactivating existing voting for match ${lastMatch.fixture.id}`);
                        // Desativar outras votações ativas
                        yield client.query('UPDATE match_voting SET is_active = false WHERE is_active = true');
                        // Reativar a votação existente para este jogo
                        yield client.query('UPDATE match_voting SET is_active = true WHERE id = $1', [existingVoting.id]);
                        yield client.query('COMMIT');
                        return {
                            success: true,
                            message: `Votação reativada para ${lastMatch.teams.home.name} vs ${lastMatch.teams.away.name}`,
                            matchInfo: {
                                homeTeam: lastMatch.teams.home.name,
                                awayTeam: lastMatch.teams.away.name,
                                matchDate: new Date(lastMatch.fixture.date).toISOString().split('T')[0],
                                fixtureId: lastMatch.fixture.id,
                                reactivatedVotingId: existingVoting.id
                            }
                        };
                    }
                }
                // Se não existe nenhuma votação para este jogo, criar uma nova
                console.log(`🆕 Creating new voting for match ${lastMatch.fixture.id}`);
                // Desativar votações ativas (de outros jogos)
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
