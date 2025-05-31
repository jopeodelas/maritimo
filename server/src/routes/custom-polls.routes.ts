import { Router } from 'express';
import { CustomPollController } from '../controllers/custom-poll.controller';
import { auth } from '../middleware/auth.middleware';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();
const customPollController = new CustomPollController();

// Get all active custom polls (authenticated users)
router.get('/', auth, customPollController.getAllPolls);

// Get specific poll by ID (authenticated users)
router.get('/:id', auth, customPollController.getPollById);

// Vote on a poll (authenticated users)
router.post('/:id/vote', auth, customPollController.vote);

// Admin only routes - Create new poll
router.post('/', auth, adminAuth, customPollController.createPoll);

// Admin only routes - Deactivate poll
router.delete('/:id', auth, adminAuth, customPollController.deactivatePoll);

export default router; 