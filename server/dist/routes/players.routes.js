"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const players_controller_1 = require("../controllers/players.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.auth, players_controller_1.getAllPlayers);
router.get('/:id', auth_middleware_1.auth, players_controller_1.getPlayerById);
router.post('/', auth_middleware_1.auth, admin_middleware_1.adminAuth, upload_middleware_1.uploadPlayerImage, players_controller_1.createPlayer); // Admin only
router.put('/:id', auth_middleware_1.auth, admin_middleware_1.adminAuth, upload_middleware_1.uploadPlayerImage, players_controller_1.updatePlayer); // Admin only
router.delete('/:id', auth_middleware_1.auth, admin_middleware_1.adminAuth, players_controller_1.deletePlayer); // Admin only
exports.default = router;
