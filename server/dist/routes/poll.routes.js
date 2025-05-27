"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const poll_controller_1 = require("../controllers/poll.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const pollController = new poll_controller_1.PollController();
// Check if user has voted in poll
router.get('/positions/check', auth_middleware_1.auth, pollController.checkUserVote);
// Submit poll vote
router.post('/positions', auth_middleware_1.auth, pollController.submitVote);
// Get poll results
router.get('/positions/results', pollController.getResults);
exports.default = router;
