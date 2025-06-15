"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const playerRatingsController = __importStar(require("../controllers/player-ratings.controller"));
const router = (0, express_1.Router)();
// Public routes (require authentication)
router.get('/active-voting', auth_middleware_1.auth, playerRatingsController.getActiveVoting);
router.post('/submit', auth_middleware_1.auth, playerRatingsController.submitPlayerRatings);
router.get('/player/:playerId/average', auth_middleware_1.auth, playerRatingsController.getPlayerAverageRating);
router.get('/match/:matchId/man-of-match-results', auth_middleware_1.auth, playerRatingsController.getManOfTheMatchResults);
router.get('/match/:matchId/has-voted', auth_middleware_1.auth, playerRatingsController.hasUserVoted);
router.get('/match/:matchId/user-ratings', auth_middleware_1.auth, playerRatingsController.getUserRatings);
// Admin routes
router.post('/admin/create-voting', auth_middleware_1.auth, playerRatingsController.createMatchVoting);
router.post('/admin/end-voting', auth_middleware_1.auth, playerRatingsController.endMatchVoting);
// Auto-voting routes (real match data)
router.post('/auto-create-voting', playerRatingsController.createAutoVotingFromRealMatch);
router.get('/recent-matches', playerRatingsController.getRecentMatchesFromAPI);
router.post('/check-new-votings', playerRatingsController.checkAndCreateNewVotings);
// Debug routes
router.get('/debug/find-maritimo-id', playerRatingsController.findMaritimoTeamId);
exports.default = router;
