import { Router } from 'express';
import { getAllPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer, getPlayerImage } from '../controllers/players.controller';
import { auth } from '../middleware/auth.middleware';
import { adminAuth } from '../middleware/admin.middleware';
import { uploadPlayerImage } from '../middleware/upload.middleware';

const router = Router();

router.get('/', auth, getAllPlayers);
router.get('/:id/image', getPlayerImage); // Public route for serving images - must be before /:id route
router.get('/:id', auth, getPlayerById);
router.post('/', auth, adminAuth, uploadPlayerImage, createPlayer); // Admin only
router.put('/:id', auth, adminAuth, uploadPlayerImage, updatePlayer); // Admin only
router.delete('/:id', auth, adminAuth, deletePlayer); // Admin only

export default router;