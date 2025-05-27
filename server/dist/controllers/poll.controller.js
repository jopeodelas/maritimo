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
exports.PollController = void 0;
const poll_service_1 = require("../services/poll.service");
const errorTypes_1 = require("../utils/errorTypes");
class PollController {
    constructor() {
        this.checkUserVote = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const result = yield this.pollService.checkUserVote(userId);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.submitVote = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { positions } = req.body;
                if (!positions || !Array.isArray(positions) || positions.length === 0) {
                    throw new errorTypes_1.BadRequestError('Positions array is required and cannot be empty');
                }
                const result = yield this.pollService.submitVote(userId, positions);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.getResults = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.pollService.getResults();
                res.json(results);
            }
            catch (error) {
                next(error);
            }
        });
        this.pollService = new poll_service_1.PollService();
    }
}
exports.PollController = PollController;
