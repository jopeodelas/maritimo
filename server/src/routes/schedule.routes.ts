import { Router } from 'express';
import * as scheduleController from '../controllers/schedule.controller';

const router = Router();

// GET /api/fixtures/season/:season
router.get('/season/:season', scheduleController.getSeasonSchedule);

export default router; 