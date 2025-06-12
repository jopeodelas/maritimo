"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfer_controller_1 = require("../controllers/transfer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/rumors', transfer_controller_1.getTransferRumors);
router.get('/stats', transfer_controller_1.getTransferStats);
router.post('/refresh', transfer_controller_1.refreshTransferRumors);
// Protected routes (require authentication)
router.post('/rumors', auth_middleware_1.auth, transfer_controller_1.addManualTransferRumor);
// NEW: Quality management routes
router.get('/quality-report', auth_middleware_1.auth, transfer_controller_1.getQualityReport);
router.post('/clean-duplicates', auth_middleware_1.auth, transfer_controller_1.cleanDuplicates);
exports.default = router;
