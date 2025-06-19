import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import {
  getNomes,
  getGameState,
  submeterPalpite,
  getStats
} from '../controllers/maritodle-daily.controller';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(auth);

// GET /api/maritodle-daily/nomes - Listar todos os nomes válidos (sem treinadores)
router.get('/nomes', getNomes);

// GET /api/maritodle-daily/game-state - Obter estado do jogo do dia
router.get('/game-state', getGameState);

// POST /api/maritodle-daily/palpite - Submeter palpite
router.post('/palpite', submeterPalpite);

// GET /api/maritodle-daily/stats - Obter estatísticas em tempo real
router.get('/stats', getStats);

export default router; 