import { Router } from 'express';
import { getAllPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer } from '../controllers/players.controller';
import { auth } from '../middleware/auth.middleware';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();

router.get('/', auth, getAllPlayers);
router.get('/:id', auth, getPlayerById);
router.post('/', auth, adminAuth, createPlayer); // Admin only
router.put('/:id', auth, adminAuth, updatePlayer); // Admin only
router.delete('/:id', auth, adminAuth, deletePlayer); // Admin only

export default router;