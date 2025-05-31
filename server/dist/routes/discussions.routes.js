"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discussions_controller_1 = require("../controllers/discussions.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all discussions with optional sorting
router.get('/', discussions_controller_1.getDiscussions);
// Create a new discussion (requires authentication)
router.post('/', auth_middleware_1.auth, discussions_controller_1.createDiscussion);
// Get comments for a specific discussion
router.get('/:id/comments', discussions_controller_1.getDiscussionComments);
// Add a comment to a discussion (requires authentication)
router.post('/:id/comments', auth_middleware_1.auth, discussions_controller_1.addComment);
// Delete a discussion (requires authentication and ownership)
router.delete('/:id', auth_middleware_1.auth, discussions_controller_1.deleteDiscussion);
exports.default = router;
