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
exports.VoteModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class VoteModel {
    static findByUserAndPlayer(userId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM votes WHERE user_id = $1 AND player_id = $2', [userId, playerId]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM votes WHERE user_id = $1', [userId]);
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static create(userId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if vote already exists
                const existingVote = yield this.findByUserAndPlayer(userId, playerId);
                if (existingVote) {
                    throw new Error('User has already voted for this player');
                }
                const result = yield db_1.default.query('INSERT INTO votes (user_id, player_id) VALUES ($1, $2) RETURNING *', [userId, playerId]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getVoteCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        SELECT player_id, COUNT(*) as count
        FROM votes
        GROUP BY player_id
        ORDER BY count DESC
      `);
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.VoteModel = VoteModel;
