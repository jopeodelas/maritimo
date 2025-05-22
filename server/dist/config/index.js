"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'jwt_default_secret_dev_only',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    cookieSecret: process.env.COOKIE_SECRET || 'cookie_default_secret_dev_only',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    // Google OAuth credentials
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
};
