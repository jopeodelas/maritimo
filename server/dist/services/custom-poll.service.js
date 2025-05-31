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
exports.CustomPollService = void 0;
const custom_poll_model_1 = require("../models/custom-poll.model");
const errorTypes_1 = require("../utils/errorTypes");
class CustomPollService {
    constructor() {
        // Initialize tables when service is created
        custom_poll_model_1.CustomPollModel.initializeTables().catch(error => {
            console.error('Failed to initialize custom poll tables:', error);
        });
    }
    createPoll(title, options, createdBy) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate input
            if (!title || title.trim().length === 0) {
                throw new errorTypes_1.BadRequestError('Poll title is required');
            }
            if (!options || options.length < 2) {
                throw new errorTypes_1.BadRequestError('Poll must have at least 2 options');
            }
            if (options.length > 10) {
                throw new errorTypes_1.BadRequestError('Poll cannot have more than 10 options');
            }
            // Clean up options (trim and filter empty ones)
            const cleanOptions = options
                .map(option => option.trim())
                .filter(option => option.length > 0);
            if (cleanOptions.length < 2) {
                throw new errorTypes_1.BadRequestError('Poll must have at least 2 valid options');
            }
            try {
                return yield custom_poll_model_1.CustomPollModel.create(title.trim(), cleanOptions, createdBy);
            }
            catch (error) {
                console.error('Error creating poll:', error);
                throw error;
            }
        });
    }
    getAllActivePolls(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield custom_poll_model_1.CustomPollModel.getAllActiveWithResults(userId);
            }
            catch (error) {
                console.error('Error fetching active polls:', error);
                throw error;
            }
        });
    }
    getPollById(pollId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const poll = yield custom_poll_model_1.CustomPollModel.getPollWithResults(pollId, userId);
                if (!poll) {
                    throw new errorTypes_1.NotFoundError('Poll not found');
                }
                return poll;
            }
            catch (error) {
                if (error instanceof errorTypes_1.NotFoundError) {
                    throw error;
                }
                console.error('Error fetching poll:', error);
                throw error;
            }
        });
    }
    vote(pollId, userId, optionIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First check if poll exists
                const poll = yield custom_poll_model_1.CustomPollModel.findById(pollId);
                if (!poll) {
                    throw new errorTypes_1.NotFoundError('Poll not found');
                }
                if (!poll.is_active) {
                    throw new errorTypes_1.BadRequestError('Poll is no longer active');
                }
                // Validate option index
                if (optionIndex < 0 || optionIndex >= poll.options.length) {
                    throw new errorTypes_1.BadRequestError('Invalid option selected');
                }
                // Cast the vote
                yield custom_poll_model_1.CustomPollModel.vote(pollId, userId, optionIndex);
                // Return updated poll with results
                return yield this.getPollById(pollId, userId);
            }
            catch (error) {
                if (error instanceof errorTypes_1.NotFoundError || error instanceof errorTypes_1.BadRequestError) {
                    throw error;
                }
                if (error instanceof Error && error.message.includes('already voted')) {
                    throw new errorTypes_1.BadRequestError('You have already voted on this poll');
                }
                console.error('Error voting on poll:', error);
                throw error;
            }
        });
    }
    deactivatePoll(pollId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield custom_poll_model_1.CustomPollModel.deactivate(pollId);
                if (!result) {
                    throw new errorTypes_1.NotFoundError('Poll not found');
                }
                return result;
            }
            catch (error) {
                if (error instanceof errorTypes_1.NotFoundError) {
                    throw error;
                }
                console.error('Error deactivating poll:', error);
                throw error;
            }
        });
    }
}
exports.CustomPollService = CustomPollService;
