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
exports.adminAuth = void 0;
const user_model_1 = require("../models/user.model");
const errorTypes_1 = require("../utils/errorTypes");
const adminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if user is authenticated (userId should be set by auth middleware)
        if (!req.userId) {
            throw new errorTypes_1.UnauthorizedError('Authentication required');
        }
        // Get user from database to check admin status
        const user = yield user_model_1.UserModel.findById(req.userId);
        if (!user) {
            throw new errorTypes_1.UnauthorizedError('User not found');
        }
        // Check if user is admin
        if (!user.is_admin) {
            throw new errorTypes_1.UnauthorizedError('Admin access required');
        }
        // Add admin user to request for convenience
        req.user = { id: user.id, is_admin: true };
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.adminAuth = adminAuth;
