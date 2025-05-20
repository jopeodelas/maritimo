import { Router } from 'express';
import { createVote, getUserVotes, getVoteCounts } from '../controllers/votes.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', auth, createVote);
router.get('/user', auth, getUserVotes);
router.get('/counts', auth, getVoteCounts);

export default router;