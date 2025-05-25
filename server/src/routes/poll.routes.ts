import { Router } from 'express';
import { PollController } from '../controllers/poll.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();
const pollController = new PollController();

// Check if user has voted in poll
router.get('/positions/check', auth, pollController.checkUserVote);

// Submit poll vote
router.post('/positions', auth, pollController.submitVote);

// Get poll results
router.get('/positions/results', pollController.getResults);

export default router; 