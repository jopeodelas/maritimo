"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const players_controller_1 = require("../controllers/players.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.auth, players_controller_1.getAllPlayers);
router.get('/:id', auth_middleware_1.auth, players_controller_1.getPlayerById);
router.post('/', auth_middleware_1.auth, players_controller_1.createPlayer); // This could be restricted to admins in a real app
exports.default = router;
