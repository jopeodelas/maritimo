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
exports.getVoteCounts = exports.getUserVotes = exports.createVote = void 0;
const vote_model_1 = require("../models/vote.model");
const player_model_1 = require("../models/player.model");
const errorTypes_1 = require("../utils/errorTypes");
const createVote = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId } = req.body;
        const userId = req.userId;
        if (!playerId) {
            throw new errorTypes_1.BadRequestError('Player ID is required');
        }
        // Check if player exists
        const player = yield player_model_1.PlayerModel.findById(playerId);
        if (!player) {
            throw new errorTypes_1.NotFoundError('Player not found');
        }
        // Create vote
        const vote = yield vote_model_1.VoteModel.create(userId, playerId);
        res.status(201).json(vote);
    }
    catch (error) {
        next(error);
    }
});
exports.createVote = createVote;
const getUserVotes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const votes = yield vote_model_1.VoteModel.findByUser(userId);
        res.json(votes);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserVotes = getUserVotes;
const getVoteCounts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const voteCounts = yield vote_model_1.VoteModel.getVoteCounts();
        res.json(voteCounts);
    }
    catch (error) {
        next(error);
    }
});
exports.getVoteCounts = getVoteCounts;
