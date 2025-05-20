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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const config_1 = __importDefault(require("../config"));
const errorTypes_1 = require("../utils/errorTypes");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            throw new errorTypes_1.BadRequestError('Please provide all required fields');
        }
        // Password validation
        if (password.length < 6) {
            throw new errorTypes_1.BadRequestError('Password must be at least 6 characters');
        }
        const user = yield user_model_1.UserModel.create(username, email, password);
        // Create JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.default.jwtSecret, {
            expiresIn: config_1.default.jwtExpiry
        });
        // Set JWT as HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: config_1.default.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        // Send response without password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorTypes_1.BadRequestError('Please provide email and password');
        }
        // Check if user exists
        const user = yield user_model_1.UserModel.findByEmail(email);
        if (!user) {
            throw new errorTypes_1.UnauthorizedError('Invalid credentials');
        }
        // Check if password is correct
        const isMatch = yield user_model_1.UserModel.comparePassword(password, user.password);
        if (!isMatch) {
            throw new errorTypes_1.UnauthorizedError('Invalid credentials');
        }
        // Create JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.default.jwtSecret, { expiresIn: config_1.default.jwtExpiry });
        // Set JWT as HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: config_1.default.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        // Send response without password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json(userWithoutPassword);
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.UserModel.findById(req.userId);
        if (!user) {
            throw new errorTypes_1.UnauthorizedError('User not found');
        }
        // Send response without password
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json(userWithoutPassword);
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
