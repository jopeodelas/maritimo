"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const custom_poll_controller_1 = require("../controllers/custom-poll.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const customPollController = new custom_poll_controller_1.CustomPollController();
// Get all active custom polls (authenticated users)
router.get('/', auth_middleware_1.auth, customPollController.getAllPolls);
// Get specific poll by ID (authenticated users)
router.get('/:id', auth_middleware_1.auth, customPollController.getPollById);
// Vote on a poll (authenticated users)
router.post('/:id/vote', auth_middleware_1.auth, customPollController.vote);
// Admin only routes - Create new poll
router.post('/', auth_middleware_1.auth, admin_middleware_1.adminAuth, customPollController.createPoll);
// Admin only routes - Deactivate poll
router.delete('/:id', auth_middleware_1.auth, admin_middleware_1.adminAuth, customPollController.deactivatePoll);
exports.default = router;
