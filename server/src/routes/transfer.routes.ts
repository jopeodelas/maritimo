import { Router } from 'express';
import { 
  getTransferRumors, 
  getTransferStats, 
  refreshTransferRumors, 
  addManualTransferRumor 
} from '../controllers/transfer.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/rumors', getTransferRumors);
router.get('/stats', getTransferStats);

// Protected routes (require authentication)
router.post('/refresh', auth, refreshTransferRumors);
router.post('/rumors', auth, addManualTransferRumor);

export default router; 