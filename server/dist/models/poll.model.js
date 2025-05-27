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
exports.PollModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class PollModel {
    // Initialize the poll_votes table if it doesn't exist
    static initializeTable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createTableQuery = `
        CREATE TABLE IF NOT EXISTS poll_votes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          position_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
                yield db_1.default.query(createTableQuery);
                // Create unique constraint to prevent duplicate votes from same user for same position
                const createUniqueIndexQuery = `
        CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_user_position_unique 
        ON poll_votes (user_id, position_id);
      `;
                yield db_1.default.query(createUniqueIndexQuery);
                // Create indexes for faster queries
                const createUserIndexQuery = `
        CREATE INDEX IF NOT EXISTS poll_votes_user_id_idx ON poll_votes (user_id);
      `;
                const createPositionIndexQuery = `
        CREATE INDEX IF NOT EXISTS poll_votes_position_id_idx ON poll_votes (position_id);
      `;
                yield db_1.default.query(createUserIndexQuery);
                yield db_1.default.query(createPositionIndexQuery);
                console.log('Poll votes table initialized successfully');
            }
            catch (error) {
                console.error('Error initializing poll votes table:', error);
                throw error;
            }
        });
    }
    static findByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM poll_votes WHERE user_id = $1', [userId]);
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findByUserAndPosition(userId, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM poll_votes WHERE user_id = $1 AND position_id = $2', [userId, positionId]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static create(userId, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if vote already exists
                const existingVote = yield this.findByUserAndPosition(userId, positionId);
                if (existingVote) {
                    throw new Error('User has already voted for this position');
                }
                const result = yield db_1.default.query('INSERT INTO poll_votes (user_id, position_id) VALUES ($1, $2) RETURNING *', [userId, positionId]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    static hasUserVoted(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT id FROM poll_votes WHERE user_id = $1 LIMIT 1', [userId]);
                return result.rows.length > 0;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getResults() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        SELECT 
          position_id,
          COUNT(DISTINCT user_id) as vote_count
        FROM poll_votes 
        GROUP BY position_id
      `);
                // Initialize all positions with 0 votes
                const results = {
                    'guarda-redes': 0,
                    'defesa-central': 0,
                    'laterais': 0,
                    'medio-centro': 0,
                    'extremos': 0,
                    'ponta-de-lanca': 0
                };
                // Update with actual vote counts
                result.rows.forEach((row) => {
                    results[row.position_id] = parseInt(row.vote_count);
                });
                return results;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getTotalVoters() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        SELECT COUNT(DISTINCT user_id) as total_voters
        FROM poll_votes
      `);
                return parseInt(((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.total_voters) || '0');
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.PollModel = PollModel;
