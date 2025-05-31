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
exports.UserModel = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT * FROM users WHERE id = $1', [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static create(username, email, password, googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if email already exists
                const existingUser = yield this.findByEmail(email);
                if (existingUser) {
                    throw new Error('Email already in use');
                }
                // Hash password
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(password, salt);
                // Add google_id if provided
                let result;
                if (googleId) {
                    result = yield db_1.default.query('INSERT INTO users (username, email, password, google_id) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword, googleId]);
                }
                else {
                    result = yield db_1.default.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
                }
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    static updateGoogleId(userId, googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *', [googleId, userId]);
                if (result.rows.length === 0) {
                    throw new Error('User not found');
                }
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    static comparePassword(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, hashedPassword);
        });
    }
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('UserModel.findAll() - Executing query...');
                // First, try with is_banned column
                try {
                    const result = yield db_1.default.query('SELECT id, username, email, is_admin, is_banned, created_at FROM users ORDER BY created_at DESC');
                    console.log('Query result with is_banned:', result.rows.length, 'rows returned');
                    console.log('First row:', result.rows[0]);
                    return result.rows;
                }
                catch (columnError) {
                    // If is_banned column doesn't exist, try without it
                    if (columnError.message && columnError.message.includes('is_banned')) {
                        console.log('is_banned column not found, trying without it...');
                        const result = yield db_1.default.query('SELECT id, username, email, is_admin, false as is_banned, created_at FROM users ORDER BY created_at DESC');
                        console.log('Query result without is_banned:', result.rows.length, 'rows returned');
                        return result.rows;
                    }
                    throw columnError;
                }
            }
            catch (error) {
                console.error('Database error in findAll:', error);
                throw error;
            }
        });
    }
    static findBannedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('SELECT id, username, email, is_admin, is_banned, created_at FROM users WHERE is_banned = true ORDER BY created_at DESC');
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static banUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('UPDATE users SET is_banned = true WHERE id = $1 AND is_admin = false RETURNING *', [userId]);
                return result.rows.length > 0;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static unbanUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query('UPDATE users SET is_banned = false WHERE id = $1 RETURNING *', [userId]);
                return result.rows.length > 0;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.UserModel = UserModel;
