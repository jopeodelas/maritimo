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
                // Get players with vote counts
                const playersResult = yield db_1.default.query(`
        SELECT p.*, COUNT(v.id) as vote_count
        FROM players p
        LEFT JOIN votes v ON p.id = v.player_id
        GROUP BY p.id
        ORDER BY vote_count DESC
      `);
                // Get total unique voters
                const votersResult = yield db_1.default.query(`
        SELECT COUNT(DISTINCT user_id) as total_unique_voters
        FROM votes
      `);
                const totalUniqueVoters = parseInt(((_a = votersResult.rows[0]) === null || _a === void 0 ? void 0 : _a.total_unique_voters) || '0');
                return {
                    players: playersResult.rows,
                    totalUniqueVoters
                };
            }
            catch (error) {
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
                const { name, position, image_url } = player;
                const result = yield db_1.default.query('INSERT INTO players (name, position, image_url) VALUES ($1, $2, $3) RETURNING *', [name, position, image_url]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.PlayerModel = PlayerModel;
