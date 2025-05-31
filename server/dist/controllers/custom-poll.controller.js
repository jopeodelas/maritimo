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
exports.CustomPollController = void 0;
const custom_poll_service_1 = require("../services/custom-poll.service");
const errorTypes_1 = require("../utils/errorTypes");
class CustomPollController {
    constructor() {
        // Admin only - Create a new poll
        this.createPoll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, options } = req.body;
                const createdBy = req.userId;
                if (!title || !options) {
                    throw new errorTypes_1.BadRequestError('Title and options are required');
                }
                if (!Array.isArray(options)) {
                    throw new errorTypes_1.BadRequestError('Options must be an array');
                }
                const poll = yield this.customPollService.createPoll(title, options, createdBy);
                res.status(201).json(poll);
            }
            catch (error) {
                next(error);
            }
        });
        // Get all active polls with results
        this.getAllPolls = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId; // This will be set by auth middleware
                const polls = yield this.customPollService.getAllActivePolls(userId);
                res.json(polls);
            }
            catch (error) {
                next(error);
            }
        });
        // Get a specific poll by ID
        this.getPollById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pollId = parseInt(req.params.id);
                const userId = req.userId;
                if (isNaN(pollId)) {
                    throw new errorTypes_1.BadRequestError('Invalid poll ID');
                }
                const poll = yield this.customPollService.getPollById(pollId, userId);
                res.json(poll);
            }
            catch (error) {
                next(error);
            }
        });
        // Vote on a poll
        this.vote = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pollId = parseInt(req.params.id);
                const { optionIndex } = req.body;
                const userId = req.userId;
                if (isNaN(pollId)) {
                    throw new errorTypes_1.BadRequestError('Invalid poll ID');
                }
                if (typeof optionIndex !== 'number' || optionIndex < 0) {
                    throw new errorTypes_1.BadRequestError('Valid option index is required');
                }
                const poll = yield this.customPollService.vote(pollId, userId, optionIndex);
                res.json(poll);
            }
            catch (error) {
                next(error);
            }
        });
        // Admin only - Deactivate a poll
        this.deactivatePoll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pollId = parseInt(req.params.id);
                if (isNaN(pollId)) {
                    throw new errorTypes_1.BadRequestError('Invalid poll ID');
                }
                const result = yield this.customPollService.deactivatePoll(pollId);
                res.json({ success: result });
            }
            catch (error) {
                next(error);
            }
        });
        this.customPollService = new custom_poll_service_1.CustomPollService();
    }
}
exports.CustomPollController = CustomPollController;
