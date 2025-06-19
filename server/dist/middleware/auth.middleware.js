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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const errorTypes_1 = require("../utils/errorTypes");
const user_model_1 = require("../models/user.model");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Auth middleware - Signed Cookies:', req.signedCookies);
        console.log('Auth middleware - Regular Cookies:', req.cookies);
        // Buscar o token nos cookies assinados
        const token = req.signedCookies.token;
        if (!token) {
            console.log('No token found in signed cookies');
            throw new errorTypes_1.UnauthorizedError('No token, authorization denied');
        }
        console.log('Token found, verifying...');
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        // Check if user exists and is not banned
        const user = yield user_model_1.UserModel.findById(decoded.id);
        if (!user) {
            throw new errorTypes_1.UnauthorizedError('User not found');
        }
        if (user.is_banned) {
            throw new errorTypes_1.UnauthorizedError('User account has been banned');
        }
        req.userId = decoded.id;
        req.user = { id: decoded.id, is_admin: user.is_admin };
        console.log('Token verified, user ID:', decoded.id, 'is_admin:', user.is_admin);
        // Additional validation to ensure consistency
        if (req.userId !== req.user.id) {
            console.error('⚠️ CRITICAL: userId and user.id mismatch!', {
                userId: req.userId,
                userObjectId: req.user.id
            });
        }
        next();
    }
    catch (err) {
        console.error('Auth middleware error:', err);
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorTypes_1.UnauthorizedError('Invalid token'));
        }
        else {
            next(err);
        }
    }
});
exports.auth = auth;
