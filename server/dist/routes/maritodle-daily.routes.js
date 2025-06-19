"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const maritodle_daily_controller_1 = require("../controllers/maritodle-daily.controller");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação a todas as rotas
router.use(auth_middleware_1.auth);
// GET /api/maritodle-daily/nomes - Listar todos os nomes válidos (sem treinadores)
router.get('/nomes', maritodle_daily_controller_1.getNomes);
// GET /api/maritodle-daily/game-state - Obter estado do jogo do dia
router.get('/game-state', maritodle_daily_controller_1.getGameState);
// POST /api/maritodle-daily/palpite - Submeter palpite
router.post('/palpite', maritodle_daily_controller_1.submeterPalpite);
// GET /api/maritodle-daily/stats - Obter estatísticas em tempo real
router.get('/stats', maritodle_daily_controller_1.getStats);
exports.default = router;
