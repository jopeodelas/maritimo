"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const maritodle_controller_1 = require("../controllers/maritodle.controller");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação a todas as rotas
router.use(auth_middleware_1.auth);
// GET /api/maritodle/nomes - Listar todos os nomes válidos
router.get('/nomes', maritodle_controller_1.getNomes);
// GET /api/maritodle/novo-jogo - Iniciar novo jogo
router.get('/novo-jogo', maritodle_controller_1.novoJogo);
// POST /api/maritodle/palpite - Submeter palpite
router.post('/palpite', maritodle_controller_1.submeterPalpite);
// POST /api/maritodle/desistir - Desistir do jogo
router.post('/desistir', maritodle_controller_1.desistir);
// POST /api/maritodle/insert-trainers - Inserir treinadores
router.post('/insert-trainers', maritodle_controller_1.insertTrainers);
exports.default = router;
