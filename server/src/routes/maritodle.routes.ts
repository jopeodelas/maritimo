import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import {
  getNomes,
  novoJogo,
  submeterPalpite,
  desistir
} from '../controllers/maritodle.controller';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(auth);

// GET /api/maritodle/nomes - Listar todos os nomes válidos
router.get('/nomes', getNomes);

// GET /api/maritodle/novo-jogo - Iniciar novo jogo
router.get('/novo-jogo', novoJogo);

// POST /api/maritodle/palpite - Submeter palpite
router.post('/palpite', submeterPalpite);

// POST /api/maritodle/desistir - Desistir do jogo
router.post('/desistir', desistir);

export default router; 