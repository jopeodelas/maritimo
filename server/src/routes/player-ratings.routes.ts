import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import * as playerRatingsController from '../controllers/player-ratings.controller';

const router = Router();

// Public routes (require authentication)
router.get('/active-voting', auth, playerRatingsController.getActiveVoting);
router.post('/submit', auth, playerRatingsController.submitPlayerRatings);
router.get('/player/:playerId/average', auth, playerRatingsController.getPlayerAverageRating);
router.get('/match/:matchId/man-of-match-results', auth, playerRatingsController.getManOfTheMatchResults);
router.get('/match/:matchId/has-voted', auth, playerRatingsController.hasUserVoted);
router.get('/match/:matchId/user-ratings', auth, playerRatingsController.getUserRatings);

// Admin routes
router.post('/admin/create-voting', auth, playerRatingsController.createMatchVoting);
router.post('/admin/end-voting', auth, playerRatingsController.endMatchVoting);

// Auto-voting routes (real match data)
router.post('/auto-create-voting', playerRatingsController.createAutoVotingFromRealMatch);
router.get('/recent-matches', playerRatingsController.getRecentMatchesFromAPI);
router.post('/check-new-votings', playerRatingsController.checkAndCreateNewVotings);

// Debug routes
router.get('/debug/find-maritimo-id', playerRatingsController.findMaritimoTeamId);
router.post('/debug/run-migration', playerRatingsController.runMigration);

export default router; 