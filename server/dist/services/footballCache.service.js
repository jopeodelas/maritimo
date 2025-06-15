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
const db_1 = __importDefault(require("../config/db"));
const footballAPI_service_1 = __importDefault(require("./footballAPI.service"));
class FootballCacheService {
    constructor() {
        this.MAX_DAILY_REQUESTS = 90; // Deixar margem dos 100 requests diários
        this.FULL_SYNC_INTERVAL_DAYS = 7; // Full sync a cada 7 dias
        this.CHECK_INTERVAL_HOURS = 12; // Verificar novos jogos a cada 12 horas
    }
    // Verificar se podemos fazer requests hoje
    canMakeAPIRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                const result = yield client.query(`
        SELECT api_requests_today, api_requests_date 
        FROM football_sync_control 
        ORDER BY id DESC LIMIT 1
      `);
                if (result.rows.length === 0)
                    return true;
                const { api_requests_today, api_requests_date } = result.rows[0];
                const today = new Date().toISOString().split('T')[0];
                // Reset contador se é um novo dia
                if (api_requests_date !== today) {
                    yield client.query(`
          UPDATE football_sync_control 
          SET api_requests_today = 0, api_requests_date = CURRENT_DATE
        `);
                    return true;
                }
                return api_requests_today < this.MAX_DAILY_REQUESTS;
            }
            finally {
                client.release();
            }
        });
    }
    // Incrementar contador de requests
    incrementAPIRequestCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                yield client.query(`
        UPDATE football_sync_control 
        SET api_requests_today = api_requests_today + 1,
            api_requests_date = CURRENT_DATE
      `);
            }
            finally {
                client.release();
            }
        });
    }
    // Buscar jogos do cache
    getCachedMatches(limit = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                const result = yield client.query(`
        SELECT fixture_id, home_team, away_team, match_date, status, 
               home_score, away_score, processed
        FROM football_matches_cache 
        WHERE status = 'FT'
        ORDER BY match_date DESC 
        LIMIT $1
      `, [limit]);
                return result.rows;
            }
            finally {
                client.release();
            }
        });
    }
    // Buscar lineup do cache
    getCachedLineup(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                const result = yield client.query(`
        SELECT fixture_id, team_name, player_api_id, player_name, 
               player_position, is_starter, shirt_number
        FROM football_lineups_cache 
        WHERE fixture_id = $1
        ORDER BY is_starter DESC, shirt_number ASC
      `, [fixtureId]);
                return result.rows;
            }
            finally {
                client.release();
            }
        });
    }
    // Verificar se precisa de sincronização
    needsSync() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                const result = yield client.query(`
        SELECT last_full_sync, last_check_sync 
        FROM football_sync_control 
        ORDER BY id DESC LIMIT 1
      `);
                if (result.rows.length === 0) {
                    return { needsFullSync: true, needsCheckSync: true };
                }
                const { last_full_sync, last_check_sync } = result.rows[0];
                const now = new Date();
                // Verificar se precisa de full sync (7 dias)
                const needsFullSync = !last_full_sync ||
                    (now.getTime() - new Date(last_full_sync).getTime()) > (this.FULL_SYNC_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
                // Verificar se precisa de check sync (12 horas)
                const needsCheckSync = !last_check_sync ||
                    (now.getTime() - new Date(last_check_sync).getTime()) > (this.CHECK_INTERVAL_HOURS * 60 * 60 * 1000);
                return { needsFullSync, needsCheckSync };
            }
            finally {
                client.release();
            }
        });
    }
    // Sincronização completa (buscar últimos 20 jogos)
    fullSync() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                console.log('🔄 Starting full sync of Marítimo matches...');
                if (!(yield this.canMakeAPIRequest())) {
                    return { success: false, message: 'Daily API request limit reached', matchesAdded: 0 };
                }
                yield this.incrementAPIRequestCount();
                const matches = yield footballAPI_service_1.default.getRecentMatches(20);
                if (matches.length === 0) {
                    return { success: false, message: 'No matches found from API', matchesAdded: 0 };
                }
                yield client.query('BEGIN');
                let matchesAdded = 0;
                for (const match of matches) {
                    // Verificar se já existe
                    const existingMatch = yield client.query('SELECT fixture_id FROM football_matches_cache WHERE fixture_id = $1', [match.fixture.id]);
                    if (existingMatch.rows.length === 0) {
                        // Adicionar novo jogo
                        yield client.query(`
            INSERT INTO football_matches_cache 
            (fixture_id, home_team, away_team, match_date, status, home_score, away_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
                            match.fixture.id,
                            match.teams.home.name,
                            match.teams.away.name,
                            match.fixture.date,
                            match.fixture.status.short,
                            ((_b = (_a = match.score) === null || _a === void 0 ? void 0 : _a.fulltime) === null || _b === void 0 ? void 0 : _b.home) || null,
                            ((_d = (_c = match.score) === null || _c === void 0 ? void 0 : _c.fulltime) === null || _d === void 0 ? void 0 : _d.away) || null
                        ]);
                        // Buscar e cachear lineup se disponível
                        if (yield this.canMakeAPIRequest()) {
                            yield this.incrementAPIRequestCount();
                            yield this.cacheMatchLineup(match.fixture.id, client);
                        }
                        matchesAdded++;
                    }
                }
                // Atualizar controle de sincronização
                yield client.query(`
        UPDATE football_sync_control 
        SET last_full_sync = CURRENT_TIMESTAMP,
            total_matches_cached = (SELECT COUNT(*) FROM football_matches_cache)
      `);
                yield client.query('COMMIT');
                console.log(`✅ Full sync completed: ${matchesAdded} new matches added`);
                return { success: true, message: `Full sync completed: ${matchesAdded} matches added`, matchesAdded };
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.error('❌ Error in full sync:', error);
                return { success: false, message: 'Error in full sync: ' + error.message, matchesAdded: 0 };
            }
            finally {
                client.release();
            }
        });
    }
    // Verificação rápida de novos jogos
    quickSync() {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                console.log('⚡ Starting quick sync for new matches...');
                if (!(yield this.canMakeAPIRequest())) {
                    return { success: false, message: 'Daily API request limit reached', newMatches: 0 };
                }
                // Buscar último jogo no cache
                const lastCachedResult = yield client.query(`
        SELECT MAX(match_date) as last_match_date 
        FROM football_matches_cache
      `);
                const lastCachedDate = (_a = lastCachedResult.rows[0]) === null || _a === void 0 ? void 0 : _a.last_match_date;
                yield this.incrementAPIRequestCount();
                const recentMatches = yield footballAPI_service_1.default.getRecentMatches(5);
                let newMatches = 0;
                yield client.query('BEGIN');
                for (const match of recentMatches) {
                    const matchDate = new Date(match.fixture.date);
                    // Verificar se é mais recente que o último cached
                    if (!lastCachedDate || matchDate > new Date(lastCachedDate)) {
                        // Verificar se já existe
                        const existingMatch = yield client.query('SELECT fixture_id FROM football_matches_cache WHERE fixture_id = $1', [match.fixture.id]);
                        if (existingMatch.rows.length === 0) {
                            yield client.query(`
              INSERT INTO football_matches_cache 
              (fixture_id, home_team, away_team, match_date, status, home_score, away_score)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                                match.fixture.id,
                                match.teams.home.name,
                                match.teams.away.name,
                                match.fixture.date,
                                match.fixture.status.short,
                                ((_c = (_b = match.score) === null || _b === void 0 ? void 0 : _b.fulltime) === null || _c === void 0 ? void 0 : _c.home) || null,
                                ((_e = (_d = match.score) === null || _d === void 0 ? void 0 : _d.fulltime) === null || _e === void 0 ? void 0 : _e.away) || null
                            ]);
                            // Cachear lineup se disponível
                            if (yield this.canMakeAPIRequest()) {
                                yield this.incrementAPIRequestCount();
                                yield this.cacheMatchLineup(match.fixture.id, client);
                            }
                            newMatches++;
                        }
                    }
                }
                // Atualizar controle
                yield client.query(`
        UPDATE football_sync_control 
        SET last_check_sync = CURRENT_TIMESTAMP,
            total_matches_cached = (SELECT COUNT(*) FROM football_matches_cache)
      `);
                yield client.query('COMMIT');
                console.log(`⚡ Quick sync completed: ${newMatches} new matches found`);
                return { success: true, message: `Quick sync completed: ${newMatches} new matches`, newMatches };
            }
            catch (error) {
                yield client.query('ROLLBACK');
                console.error('❌ Error in quick sync:', error);
                return { success: false, message: 'Error in quick sync: ' + error.message, newMatches: 0 };
            }
            finally {
                client.release();
            }
        });
    }
    // Cachear lineup de um jogo específico
    cacheMatchLineup(fixtureId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lineups = yield footballAPI_service_1.default.getMatchLineup(fixtureId);
                for (const teamLineup of lineups) {
                    // Titular
                    for (const player of teamLineup.startXI) {
                        yield client.query(`
            INSERT INTO football_lineups_cache 
            (fixture_id, team_id, team_name, player_api_id, player_name, player_position, is_starter, shirt_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
          `, [
                            fixtureId,
                            teamLineup.team.id,
                            teamLineup.team.name,
                            player.player.id,
                            player.player.name,
                            player.player.pos,
                            true,
                            player.player.number || null
                        ]);
                    }
                    // Suplentes
                    for (const player of teamLineup.substitutes) {
                        yield client.query(`
            INSERT INTO football_lineups_cache 
            (fixture_id, team_id, team_name, player_api_id, player_name, player_position, is_starter, shirt_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
          `, [
                            fixtureId,
                            teamLineup.team.id,
                            teamLineup.team.name,
                            player.player.id,
                            player.player.name,
                            player.player.pos,
                            false,
                            player.player.number || null
                        ]);
                    }
                }
            }
            catch (error) {
                console.error('Error caching lineup for fixture', fixtureId, error);
            }
        });
    }
    // Buscar último jogo não processado para criar votação
    getLatestUnprocessedMatch() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                const result = yield client.query(`
        SELECT fixture_id, home_team, away_team, match_date, status, 
               home_score, away_score, processed
        FROM football_matches_cache 
        WHERE status = 'FT' AND processed = FALSE
        ORDER BY match_date DESC 
        LIMIT 1
      `);
                return result.rows[0] || null;
            }
            finally {
                client.release();
            }
        });
    }
    // Marcar jogo como processado
    markMatchAsProcessed(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                yield client.query('UPDATE football_matches_cache SET processed = TRUE WHERE fixture_id = $1', [fixtureId]);
            }
            finally {
                client.release();
            }
        });
    }
    // Obter estatísticas do cache
    getCacheStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.connect();
            try {
                const statsResult = yield client.query(`
        SELECT 
          (SELECT COUNT(*) FROM football_matches_cache) as total_matches,
          (SELECT COUNT(*) FROM football_matches_cache WHERE processed = TRUE) as processed_matches
      `);
                const syncResult = yield client.query(`
        SELECT api_requests_today, last_check_sync 
        FROM football_sync_control 
        ORDER BY id DESC LIMIT 1
      `);
                const stats = statsResult.rows[0];
                const sync = syncResult.rows[0];
                return {
                    totalMatches: parseInt(stats.total_matches) || 0,
                    processedMatches: parseInt(stats.processed_matches) || 0,
                    apiRequestsToday: (sync === null || sync === void 0 ? void 0 : sync.api_requests_today) || 0,
                    lastSync: (sync === null || sync === void 0 ? void 0 : sync.last_check_sync) || null
                };
            }
            finally {
                client.release();
            }
        });
    }
}
exports.default = new FootballCacheService();
