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
exports.CustomPollModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class CustomPollModel {
    // Initialize the custom poll tables if they don't exist
    static initializeTables() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Add is_admin column to users table if it doesn't exist
                const addAdminColumnQuery = `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
      `;
                yield db_1.default.query(addAdminColumnQuery);
                // Create custom_polls table
                const createPollsTableQuery = `
        CREATE TABLE IF NOT EXISTS custom_polls (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          options TEXT[] NOT NULL,
          created_by INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
                yield db_1.default.query(createPollsTableQuery);
                // Create custom_poll_votes table
                const createVotesTableQuery = `
        CREATE TABLE IF NOT EXISTS custom_poll_votes (
          id SERIAL PRIMARY KEY,
          poll_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          option_index INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (poll_id) REFERENCES custom_polls(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
                yield db_1.default.query(createVotesTableQuery);
                // Create unique constraint and indexes
                const createIndexesQuery = `
        CREATE UNIQUE INDEX IF NOT EXISTS custom_poll_votes_user_poll_unique 
        ON custom_poll_votes (user_id, poll_id);
        
        CREATE INDEX IF NOT EXISTS custom_polls_created_by_idx ON custom_polls (created_by);
        CREATE INDEX IF NOT EXISTS custom_poll_votes_poll_id_idx ON custom_poll_votes (poll_id);
        CREATE INDEX IF NOT EXISTS custom_poll_votes_user_id_idx ON custom_poll_votes (user_id);
      `;
                yield db_1.default.query(createIndexesQuery);
                console.log('Custom polls tables initialized successfully');
            }
            catch (error) {
                console.error('Error initializing custom polls tables:', error);
                throw error;
            }
        });
    }
    static create(title, options, createdBy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('INSERT INTO custom_polls (title, options, created_by) VALUES ($1, $2, $3) RETURNING *', [title, options, createdBy]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM custom_polls WHERE id = $1', [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findAllActive() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM custom_polls WHERE is_active = true ORDER BY created_at DESC');
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static vote(pollId, userId, optionIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user has already voted
                const existingVote = yield this.findUserVote(pollId, userId);
                if (existingVote) {
                    throw new Error('User has already voted on this poll');
                }
                const result = yield db_1.default.query('INSERT INTO custom_poll_votes (poll_id, user_id, option_index) VALUES ($1, $2, $3) RETURNING *', [pollId, userId, optionIndex]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findUserVote(pollId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM custom_poll_votes WHERE poll_id = $1 AND user_id = $2', [pollId, userId]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getPollResults(pollId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First get the poll to know how many options it has
                const poll = yield this.findById(pollId);
                if (!poll) {
                    throw new Error('Poll not found');
                }
                // Initialize results array with zeros for each option
                const results = new Array(poll.options.length).fill(0);
                // Get vote counts for each option
                const voteResult = yield db_1.default.query('SELECT option_index, COUNT(*) as vote_count FROM custom_poll_votes WHERE poll_id = $1 GROUP BY option_index', [pollId]);
                // Fill in the actual vote counts
                voteResult.rows.forEach((row) => {
                    const optionIndex = parseInt(row.option_index);
                    const voteCount = parseInt(row.vote_count);
                    if (optionIndex < results.length) {
                        results[optionIndex] = voteCount;
                    }
                });
                return results;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getPollWithResults(pollId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const poll = yield this.findById(pollId);
                if (!poll) {
                    return null;
                }
                const votes = yield this.getPollResults(pollId);
                const totalVotes = votes.reduce((sum, count) => sum + count, 0);
                let userVotedOption;
                if (userId) {
                    const userVote = yield this.findUserVote(pollId, userId);
                    userVotedOption = userVote === null || userVote === void 0 ? void 0 : userVote.option_index;
                }
                return Object.assign(Object.assign({}, poll), { votes, total_votes: totalVotes, user_voted_option: userVotedOption });
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getAllActiveWithResults(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const polls = yield this.findAllActive();
                const pollsWithResults = yield Promise.all(polls.map((poll) => __awaiter(this, void 0, void 0, function* () {
                    const votes = yield this.getPollResults(poll.id);
                    const totalVotes = votes.reduce((sum, count) => sum + count, 0);
                    let userVotedOption;
                    if (userId) {
                        const userVote = yield this.findUserVote(poll.id, userId);
                        userVotedOption = userVote === null || userVote === void 0 ? void 0 : userVote.option_index;
                    }
                    return Object.assign(Object.assign({}, poll), { votes, total_votes: totalVotes, user_voted_option: userVotedOption });
                })));
                return pollsWithResults;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static deactivate(pollId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('UPDATE custom_polls SET is_active = false WHERE id = $1 RETURNING *', [pollId]);
                return result.rows.length > 0;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.CustomPollModel = CustomPollModel;
