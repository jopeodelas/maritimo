"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.get('/me', auth_middleware_1.auth, auth_controller_1.getCurrentUser);
// Google OAuth routes
router.get('/google/url', auth_controller_1.getGoogleAuthUrl);
router.get('/google/callback', auth_controller_1.handleGoogleCallback);
router.post('/google/callback', auth_controller_1.handleGoogleCallback);
exports.default = router;
