"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfer_controller_1 = require("../controllers/transfer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/rumors', transfer_controller_1.getTransferRumors);
router.get('/stats', transfer_controller_1.getTransferStats);
// Protected routes (require authentication)
router.post('/refresh', auth_middleware_1.auth, transfer_controller_1.refreshTransferRumors);
router.post('/rumors', auth_middleware_1.auth, transfer_controller_1.addManualTransferRumor);
exports.default = router;
