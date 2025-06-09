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
exports.PlayerModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class PlayerModel {
    static findAll() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Attempting to fetch players from database...');
                // Get players with vote counts
                const playersResult = yield db_1.default.query(`
        SELECT p.*, COUNT(v.id) as vote_count
        FROM players p
        LEFT JOIN votes v ON p.id = v.player_id
        GROUP BY p.id
        ORDER BY vote_count DESC
      `);
                console.log('Players query result:', playersResult.rows);
                // Get total unique voters
                const votersResult = yield db_1.default.query(`
        SELECT COUNT(DISTINCT user_id) as total_unique_voters
        FROM votes
      `);
                console.log('Voters query result:', votersResult.rows);
                const totalUniqueVoters = parseInt(((_a = votersResult.rows[0]) === null || _a === void 0 ? void 0 : _a.total_unique_voters) || '0');
                const response = {
                    players: playersResult.rows,
                    totalUniqueVoters
                };
                console.log('Final response:', response);
                return response;
            }
            catch (error) {
                console.error('Error in PlayerModel.findAll:', error);
                throw error;
            }
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM players WHERE id = $1', [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static create(player) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('=== PLAYER MODEL CREATE ===');
                console.log('Input data:', player);
                const { name, position, image_url } = player;
                console.log('Executing SQL query with values:', [name, position, image_url]);
                const result = yield db_1.default.query('INSERT INTO players (name, position, image_url) VALUES ($1, $2, $3) RETURNING *', [name, position, image_url]);
                console.log('Database query result:', result.rows);
                console.log('Created player:', result.rows[0]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error in PlayerModel.create:', error);
                throw error;
            }
        });
    }
    static update(id, player) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, position, image_url } = player;
                const result = yield db_1.default.query('UPDATE players SET name = COALESCE($1, name), position = COALESCE($2, position), image_url = COALESCE($3, image_url) WHERE id = $4 RETURNING *', [name, position, image_url, id]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static delete(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First delete related votes
                yield db_1.default.query('DELETE FROM votes WHERE player_id = $1', [id]);
                // Then delete the player
                const result = yield db_1.default.query('DELETE FROM players WHERE id = $1', [id]);
                return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.PlayerModel = PlayerModel;
