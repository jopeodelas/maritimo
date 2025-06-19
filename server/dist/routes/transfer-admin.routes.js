"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const transfer_admin_controller_1 = require("../controllers/transfer-admin.controller");
const router = (0, express_1.Router)();
// Todas as rotas necessitam autenticação e privilégios de admin
router.use(auth_middleware_1.auth);
router.use(admin_middleware_1.adminAuth);
// Obter todos os rumores (incluindo não aprovados)
router.get('/rumors', transfer_admin_controller_1.getAllRumorsForAdmin);
// Obter estatísticas para admin
router.get('/stats', transfer_admin_controller_1.getAdminStats);
// Criar novo rumor
router.post('/rumors', transfer_admin_controller_1.createRumor);
// Atualizar rumor existente
router.put('/rumors/:id', transfer_admin_controller_1.updateRumor);
// Remover rumor (soft delete)
router.delete('/rumors/:id', transfer_admin_controller_1.deleteRumor);
// Aprovar rumor
router.post('/rumors/:id/approve', transfer_admin_controller_1.approveRumor);
// Desaprovar rumor
router.post('/rumors/:id/disapprove', transfer_admin_controller_1.disapproveRumor);
// Migrar rumores da memória para a base de dados (executar uma vez)
router.post('/migrate', transfer_admin_controller_1.migrateRumorsFromMemory);
exports.default = router;
