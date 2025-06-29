import express from 'express';
import {
  trackEvent,
  trackSession,
  trackPerformance,
  getAnalyticsSummary,
  getUserEvents,
  getPagePerformanceStats,
  endSession
} from '../controllers/analytics.controller';
import { auth } from '../middleware/auth.middleware';
import { adminAuth } from '../middleware/admin.middleware';

const router = express.Router();

// Rotas públicas (para tracking)
router.post('/track/event', trackEvent);
router.post('/track/session', trackSession);
router.post('/track/performance', trackPerformance);
router.post('/track/end-session', endSession);

// Rotas protegidas (apenas para admins)
router.get('/summary', auth, adminAuth, getAnalyticsSummary);
router.get('/user/:userId/events', auth, adminAuth, getUserEvents);
router.get('/performance/stats', auth, adminAuth, getPagePerformanceStats);

export default router; 