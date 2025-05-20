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
        const token = req.cookies.token;
        if (!token) {
            throw new errorTypes_1.UnauthorizedError('No token, authorization denied');
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.userId = decoded.id;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorTypes_1.UnauthorizedError('Invalid token'));
        }
        else {
            next(err);
        }
    }
};
exports.auth = auth;
