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
class MaritodleDailyService {
    // Obter ou criar o jogo do dia
    getTodaysGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            // Verificar se já existe jogo para hoje
            const existingGame = yield db_1.default.query('SELECT * FROM maritodle_daily_games WHERE date = $1', [today]);
            if (existingGame.rows.length > 0) {
                return existingGame.rows[0];
            }
            // Se não existe, criar novo jogo
            return yield this.createTodaysGame(today);
        });
    }
    // Criar o jogo do dia
    createTodaysGame(date) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obter um jogador aleatório (excluindo treinadores)
            const playersResult = yield db_1.default.query('SELECT * FROM maritodle_players WHERE papel != $1 ORDER BY RANDOM() LIMIT 1', ['Treinador']);
            if (playersResult.rows.length === 0) {
                throw new Error('Nenhum jogador encontrado para o jogo diário');
            }
            const secretPlayer = playersResult.rows[0];
            // Inserir novo jogo
            const newGame = yield db_1.default.query(`INSERT INTO maritodle_daily_games (date, secret_player_id, secret_player_name, total_winners)
       VALUES ($1, $2, $3, 0)
       RETURNING *`, [date, secretPlayer.id, secretPlayer.nome]);
            console.log(`🎮 Novo jogo diário criado para ${date}: ${secretPlayer.nome}`);
            return newGame.rows[0];
        });
    }
    // Obter tentativa do usuário para hoje
    getUserTodaysAttempt(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date().toISOString().split('T')[0];
            const result = yield db_1.default.query('SELECT * FROM maritodle_daily_attempts WHERE user_id = $1 AND game_date = $2', [userId, today]);
            return result.rows.length > 0 ? result.rows[0] : null;
        });
    }
    // Criar ou atualizar tentativa do usuário
    updateUserAttempt(userId, attemptData) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date().toISOString().split('T')[0];
            // Verificar se já existe
            const existing = yield this.getUserTodaysAttempt(userId);
            if (existing) {
                // Atualizar existente
                const updated = yield db_1.default.query(`UPDATE maritodle_daily_attempts 
         SET attempts = $1, won = $2, completed = $3, attempts_data = $4, won_at = $5
         WHERE user_id = $6 AND game_date = $7
         RETURNING *`, [
                    attemptData.attempts,
                    attemptData.won,
                    attemptData.completed,
                    JSON.stringify(attemptData.attempts_data),
                    attemptData.won ? new Date() : null,
                    userId,
                    today
                ]);
                // Se o usuário ganhou pela primeira vez hoje, incrementar contador
                if (attemptData.won && !existing.won) {
                    yield this.incrementWinnerCount(today);
                }
                return updated.rows[0];
            }
            else {
                // Criar novo
                const newAttempt = yield db_1.default.query(`INSERT INTO maritodle_daily_attempts (user_id, game_date, attempts, won, completed, attempts_data, won_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [
                    userId,
                    today,
                    attemptData.attempts,
                    attemptData.won,
                    attemptData.completed,
                    JSON.stringify(attemptData.attempts_data),
                    attemptData.won ? new Date() : null
                ]);
                // Se o usuário ganhou, incrementar contador
                if (attemptData.won) {
                    yield this.incrementWinnerCount(today);
                }
                return newAttempt.rows[0];
            }
        });
    }
    // Incrementar contador de vencedores
    incrementWinnerCount(date) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.query('UPDATE maritodle_daily_games SET total_winners = total_winners + 1 WHERE date = $1', [date]);
        });
    }
    // Obter jogo de ontem
    getYesterdaysGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const result = yield db_1.default.query('SELECT * FROM maritodle_daily_games WHERE date = $1', [yesterdayStr]);
            return result.rows.length > 0 ? result.rows[0] : null;
        });
    }
    // Obter jogadores (apenas jogadores, sem treinadores)
    getPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query('SELECT * FROM maritodle_players WHERE papel != $1 ORDER BY nome', ['Treinador']);
            return result.rows;
        });
    }
    // Obter jogador por ID
    getPlayerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query('SELECT * FROM maritodle_players WHERE id = $1', [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        });
    }
    // Verificar se usuário já jogou hoje
    hasUserPlayedToday(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempt = yield this.getUserTodaysAttempt(userId);
            return attempt !== null && attempt.completed;
        });
    }
    // Obter estatísticas do dia
    getTodaysStats() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date().toISOString().split('T')[0];
            const gameResult = yield db_1.default.query('SELECT total_winners FROM maritodle_daily_games WHERE date = $1', [today]);
            const playersResult = yield db_1.default.query('SELECT COUNT(*) as total FROM maritodle_daily_attempts WHERE game_date = $1', [today]);
            return {
                totalWinners: ((_a = gameResult.rows[0]) === null || _a === void 0 ? void 0 : _a.total_winners) || 0,
                totalPlayers: parseInt(((_b = playersResult.rows[0]) === null || _b === void 0 ? void 0 : _b.total) || '0')
            };
        });
    }
    // Gerar novo jogo para o próximo dia (executado às 23:00)
    generateNextDayGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            // Verificar se já existe jogo para amanhã
            const existingGame = yield db_1.default.query('SELECT * FROM maritodle_daily_games WHERE date = $1', [tomorrowStr]);
            if (existingGame.rows.length === 0) {
                yield this.createTodaysGame(tomorrowStr);
                console.log(`🌅 Jogo de amanhã gerado: ${tomorrowStr}`);
            }
        });
    }
}
exports.default = new MaritodleDailyService();
