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
exports.DiscussionModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class DiscussionModel {
    static getAll(sort = 'newest') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let orderBy = 'ORDER BY d.created_at DESC';
                switch (sort) {
                    case 'oldest':
                        orderBy = 'ORDER BY d.created_at ASC';
                        break;
                    case 'popular':
                        orderBy = 'ORDER BY comment_count DESC, d.created_at DESC';
                        break;
                    default:
                        orderBy = 'ORDER BY d.updated_at DESC';
                }
                const result = yield db_1.default.query(`
        SELECT 
          d.id,
          d.title,
          d.description,
          d.author_id,
          u.username as author_username,
          d.created_at,
          d.updated_at,
          COALESCE(comment_counts.count, 0) as comment_count,
          COALESCE(d.updated_at, d.created_at) as last_activity
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        LEFT JOIN (
          SELECT discussion_id, COUNT(*) as count
          FROM comments
          GROUP BY discussion_id
        ) comment_counts ON d.id = comment_counts.discussion_id
        ${orderBy}
      `);
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        SELECT 
          d.id,
          d.title,
          d.description,
          d.author_id,
          u.username as author_username,
          d.created_at,
          d.updated_at,
          COALESCE(comment_counts.count, 0) as comment_count,
          COALESCE(d.updated_at, d.created_at) as last_activity
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        LEFT JOIN (
          SELECT discussion_id, COUNT(*) as count
          FROM comments
          GROUP BY discussion_id
        ) comment_counts ON d.id = comment_counts.discussion_id
        WHERE d.id = $1
      `, [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static create(authorId, title, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        INSERT INTO discussions (title, description, author_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [title, description, authorId]);
                const discussion = result.rows[0];
                // Get the full discussion with author info
                return yield this.getById(discussion.id);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static updateLastActivity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.default.query(`
        UPDATE discussions 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [id]);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.DiscussionModel = DiscussionModel;
