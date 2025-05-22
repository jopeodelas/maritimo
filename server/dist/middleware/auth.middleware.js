"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const errorTypes_1 = require("../utils/errorTypes");
const auth = (req, res, next) => {
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
        req.userId = decoded.id;
        console.log('Token verified, user ID:', decoded.id);
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
};
exports.auth = auth;
