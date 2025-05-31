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
exports.UserManagementController = void 0;
const user_management_service_1 = require("../services/user-management.service");
const errorTypes_1 = require("../utils/errorTypes");
class UserManagementController {
    constructor() {
        this.getAllUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('getAllUsers called - Starting user fetch...');
                const users = yield this.userManagementService.getAllUsers();
                console.log('Users fetched successfully:', users.length, 'users found');
                console.log('First user (if any):', users[0]);
                res.json(users);
            }
            catch (error) {
                console.error('Error in getAllUsers:', error);
                res.status(500).json({
                    message: 'Internal server error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        this.getBannedUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userManagementService.getBannedUsers();
                res.json(users);
            }
            catch (error) {
                console.error('Error in getBannedUsers:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        this.banUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                const adminId = req.userId;
                if (isNaN(userId)) {
                    return res.status(400).json({ message: 'Invalid user ID' });
                }
                const result = yield this.userManagementService.banUser(userId, adminId);
                if (result) {
                    res.json({ message: 'User banned successfully' });
                }
                else {
                    res.status(400).json({ message: 'Failed to ban user' });
                }
            }
            catch (error) {
                console.error('Error in banUser:', error);
                if (error instanceof errorTypes_1.BadRequestError) {
                    return res.status(400).json({ message: error.message });
                }
                if (error instanceof errorTypes_1.NotFoundError) {
                    return res.status(404).json({ message: error.message });
                }
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        this.unbanUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                if (isNaN(userId)) {
                    return res.status(400).json({ message: 'Invalid user ID' });
                }
                const result = yield this.userManagementService.unbanUser(userId);
                if (result) {
                    res.json({ message: 'User unbanned successfully' });
                }
                else {
                    res.status(400).json({ message: 'Failed to unban user' });
                }
            }
            catch (error) {
                console.error('Error in unbanUser:', error);
                if (error instanceof errorTypes_1.BadRequestError) {
                    return res.status(400).json({ message: error.message });
                }
                if (error instanceof errorTypes_1.NotFoundError) {
                    return res.status(404).json({ message: error.message });
                }
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        this.userManagementService = new user_management_service_1.UserManagementService();
    }
}
exports.UserManagementController = UserManagementController;
