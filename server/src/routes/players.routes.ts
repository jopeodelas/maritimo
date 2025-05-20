import { Router } from 'express';
import { getAllPlayers, getPlayerById, createPlayer } from '../controllers/players.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', auth, getAllPlayers);
router.get('/:id', auth, getPlayerById);
router.post('/', auth, createPlayer); // This could be restricted to admins in a real app

export default router;