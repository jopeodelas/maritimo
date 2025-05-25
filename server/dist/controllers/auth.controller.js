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
exports.getCurrentUser = exports.logout = exports.handleGoogleCallback = exports.getGoogleAuthUrl = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = require("../models/user.model");
const config_1 = __importDefault(require("../config"));
const errorTypes_1 = require("../utils/errorTypes");
// Initialize Google OAuth client
const googleClient = new google_auth_library_1.OAuth2Client(config_1.default.googleClientId, config_1.default.googleClientSecret, config_1.default.googleRedirectUri);
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
            maxAge: 24 * 60 * 60 * 1000,
            signed: true // Adicione esta opção para assinar o cookie
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
            maxAge: 24 * 60 * 60 * 1000,
            signed: true // Adicione esta opção para assinar o cookie
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
const getGoogleAuthUrl = (req, res, next) => {
    try {
        const { state } = req.query;
        if (!state) {
            throw new errorTypes_1.BadRequestError('State parameter is required');
        }
        const url = googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            state: state,
            prompt: 'consent' // Forces to ask for consent every time for better user experience
        });
        res.json({ url });
    }
    catch (error) {
        next(error);
    }
};
exports.getGoogleAuthUrl = getGoogleAuthUrl;
const handleGoogleCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Google callback received - Method:', req.method);
        console.log('Query params:', req.query);
        console.log('Body:', req.body);
        // Extrair o código tanto da query (GET) quanto do body (POST)
        const code = req.method === 'GET' ? req.query.code : req.body.code;
        if (!code) {
            console.log('No authorization code found');
            throw new errorTypes_1.BadRequestError('Authorization code is required');
        }
        console.log('Authorization code received, exchanging for tokens...');
        // Exchange code for tokens
        try {
            const { tokens } = yield googleClient.getToken(code);
            console.log('Tokens received:', tokens ? 'Success' : 'Failed');
            const idToken = tokens.id_token;
            if (!idToken) {
                console.log('No ID token found in response');
                throw new errorTypes_1.UnauthorizedError('Failed to retrieve user information from Google');
            }
            // Verify and decode the token
            console.log('Verifying ID token...');
            const ticket = yield googleClient.verifyIdToken({
                idToken,
                audience: config_1.default.googleClientId
            });
            const payload = ticket.getPayload();
            console.log('ID token verified, payload:', payload ? 'Success' : 'Failed');
            if (!payload || !payload.email) {
                console.log('Invalid payload or missing email');
                throw new errorTypes_1.UnauthorizedError('Invalid Google account information');
            }
            const { email, name, sub: googleId } = payload;
            console.log('User info from Google:', { email, name, googleId: (googleId === null || googleId === void 0 ? void 0 : googleId.substring(0, 5)) + '...' });
            // Check if user already exists
            let user = yield user_model_1.UserModel.findByEmail(email);
            console.log('User exists in database:', user ? 'Yes' : 'No');
            if (!user) {
                // Create new user if doesn't exist
                // Generate a random secure password for Google users
                const randomPassword = Math.random().toString(36).slice(-12);
                console.log('Creating new user...');
                user = yield user_model_1.UserModel.create(name || email.split('@')[0], // Use name or part of email as username
                email, randomPassword, googleId);
                console.log('New user created with ID:', user.id);
            }
            else if (!user.google_id) {
                // Update existing user with Google ID if they don't have one
                console.log('Updating existing user with Google ID...');
                user = yield user_model_1.UserModel.updateGoogleId(user.id, googleId);
                console.log('User updated with Google ID');
            }
            // Create JWT
            console.log('Creating JWT token...');
            const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.default.jwtSecret, { expiresIn: config_1.default.jwtExpiry });
            // Set JWT as HttpOnly cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: config_1.default.nodeEnv === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                signed: true // Adicione esta opção para assinar o cookie
            });
            // Para requisições GET, redirecionar para a página principal após autenticação bem-sucedida
            if (req.method === 'GET') {
                console.log('Redirecting to main page...');
                return res.redirect(config_1.default.clientUrl + '/main');
            }
            // Para requisições POST, enviar a resposta JSON como antes
            console.log('Sending JSON response with user data...');
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            return res.json(userWithoutPassword);
        }
        catch (tokenError) {
            console.error('Error exchanging code for tokens:', tokenError);
            throw tokenError;
        }
    }
    catch (error) {
        console.error('Google callback error:', error);
        // Para requisições GET, redirecionar para a página de login com mensagem de erro
        if (req.method === 'GET') {
            console.log('Redirecting to login page with error...');
            return res.redirect(config_1.default.clientUrl + '/login?error=google_auth_failed');
        }
        next(error);
    }
});
exports.handleGoogleCallback = handleGoogleCallback;
const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: config_1.default.nodeEnv === 'production',
        sameSite: 'strict',
        signed: true
    });
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
