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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollService = void 0;
const poll_model_1 = require("../models/poll.model");
const errorTypes_1 = require("../utils/errorTypes");
class PollService {
    constructor() {
        // Initialize the poll table when service is created
        this.initializeDatabase();
    }
    initializeDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield poll_model_1.PollModel.initializeTable();
            }
            catch (error) {
                console.error('Failed to initialize poll database:', error);
            }
        });
    }
    checkUserVote(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user has already voted
                const hasVoted = yield poll_model_1.PollModel.hasUserVoted(userId);
                if (hasVoted) {
                    // User has voted, return results
                    const results = yield poll_model_1.PollModel.getResults();
                    const totalVotes = yield poll_model_1.PollModel.getTotalVoters();
                    return {
                        hasVoted: true,
                        results,
                        totalVotes
                    };
                }
                return { hasVoted: false };
            }
            catch (error) {
                console.error('Error checking user vote:', error);
                throw error;
            }
        });
    }
    submitVote(userId, positions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user has already voted
                const hasVoted = yield poll_model_1.PollModel.hasUserVoted(userId);
                if (hasVoted) {
                    throw new errorTypes_1.ConflictError('User has already voted in this poll');
                }
                // Insert votes for each selected position
                for (const positionId of positions) {
                    yield poll_model_1.PollModel.create(userId, positionId);
                }
                // Return updated results
                const results = yield poll_model_1.PollModel.getResults();
                const totalVotes = yield poll_model_1.PollModel.getTotalVoters();
                return {
                    results,
                    totalVotes
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getResults() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield poll_model_1.PollModel.getResults();
                const totalVotes = yield poll_model_1.PollModel.getTotalVoters();
                return {
                    results,
                    totalVotes
                };
            }
            catch (error) {
                console.error('Error getting poll results:', error);
                throw error;
            }
        });
    }
}
exports.PollService = PollService;
