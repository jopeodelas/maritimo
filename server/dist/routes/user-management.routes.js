"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_management_controller_1 = require("../controllers/user-management.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const userManagementController = new user_management_controller_1.UserManagementController();
// Test endpoint (no auth required for debugging)
router.get('/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ message: 'User management routes are working!' });
});
// Simple endpoint to test database connection (no auth)
router.get('/test-db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Testing database connection...');
        const { UserModel } = require('../models/user.model');
        const result = yield UserModel.findAll();
        console.log('Database test result:', result.length, 'users found');
        res.json({
            message: 'Database connection working',
            userCount: result.length,
            users: result.map((u) => ({ id: u.id, username: u.username, email: u.email }))
        });
    }
    catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// All user management routes require authentication and admin privileges
router.use(auth_middleware_1.auth);
router.use(admin_middleware_1.adminAuth);
// Get all users
router.get('/users', userManagementController.getAllUsers);
// Get banned users
router.get('/users/banned', userManagementController.getBannedUsers);
// Ban a user
router.post('/users/:userId/ban', userManagementController.banUser);
// Unban a user
router.post('/users/:userId/unban', userManagementController.unbanUser);
exports.default = router;
