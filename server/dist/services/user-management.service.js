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
exports.UserManagementService = void 0;
const user_model_1 = require("../models/user.model");
const errorTypes_1 = require("../utils/errorTypes");
class UserManagementService {
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield user_model_1.UserModel.findAll();
                return users.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_admin: user.is_admin,
                    is_banned: user.is_banned,
                    created_at: user.created_at
                }));
            }
            catch (error) {
                console.error('Error fetching all users:', error);
                throw error;
            }
        });
    }
    getBannedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield user_model_1.UserModel.findBannedUsers();
                return users.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_admin: user.is_admin,
                    is_banned: user.is_banned,
                    created_at: user.created_at
                }));
            }
            catch (error) {
                console.error('Error fetching banned users:', error);
                throw error;
            }
        });
    }
    banUser(userId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists
                const user = yield user_model_1.UserModel.findById(userId);
                if (!user) {
                    throw new errorTypes_1.NotFoundError('User not found');
                }
                // Prevent self-ban
                if (userId === adminId) {
                    throw new errorTypes_1.BadRequestError('Cannot ban yourself');
                }
                // Prevent banning other admins
                if (user.is_admin) {
                    throw new errorTypes_1.BadRequestError('Cannot ban admin users');
                }
                // Check if user is already banned
                if (user.is_banned) {
                    throw new errorTypes_1.BadRequestError('User is already banned');
                }
                const result = yield user_model_1.UserModel.banUser(userId);
                if (!result) {
                    throw new Error('Failed to ban user');
                }
                return result;
            }
            catch (error) {
                if (error instanceof errorTypes_1.NotFoundError || error instanceof errorTypes_1.BadRequestError) {
                    throw error;
                }
                console.error('Error banning user:', error);
                throw error;
            }
        });
    }
    unbanUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists
                const user = yield user_model_1.UserModel.findById(userId);
                if (!user) {
                    throw new errorTypes_1.NotFoundError('User not found');
                }
                // Check if user is actually banned
                if (!user.is_banned) {
                    throw new errorTypes_1.BadRequestError('User is not banned');
                }
                const result = yield user_model_1.UserModel.unbanUser(userId);
                if (!result) {
                    throw new Error('Failed to unban user');
                }
                return result;
            }
            catch (error) {
                if (error instanceof errorTypes_1.NotFoundError || error instanceof errorTypes_1.BadRequestError) {
                    throw error;
                }
                console.error('Error unbanning user:', error);
                throw error;
            }
        });
    }
}
exports.UserManagementService = UserManagementService;
