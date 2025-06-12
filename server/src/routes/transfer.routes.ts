import { Router } from 'express';
import { 
  getTransferRumors, 
  getTransferStats, 
  refreshTransferRumors, 
  addManualTransferRumor,
  getQualityReport,
  cleanDuplicates
} from '../controllers/transfer.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/rumors', getTransferRumors);
router.get('/stats', getTransferStats);
router.post('/refresh', refreshTransferRumors);

// Protected routes (require authentication)
router.post('/rumors', auth, addManualTransferRumor);

// NEW: Quality management routes
router.get('/quality-report', auth, getQualityReport);
router.post('/clean-duplicates', auth, cleanDuplicates);

export default router; 