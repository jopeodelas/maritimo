"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("../controllers/news.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all news
router.get('/', auth_middleware_1.auth, news_controller_1.getNews);
// Refresh news
router.post('/refresh', auth_middleware_1.auth, news_controller_1.refreshNews);
exports.default = router;
