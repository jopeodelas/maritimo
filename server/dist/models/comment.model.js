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
exports.CommentModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class CommentModel {
    static getByDiscussionId(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        SELECT 
          c.id,
          c.discussion_id,
          c.author_id,
          u.username as author_username,
          c.content,
          c.created_at,
          c.updated_at
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.discussion_id = $1
        ORDER BY c.created_at ASC
      `, [discussionId]);
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    static create(discussionId, authorId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield db_1.default.query(`
        INSERT INTO comments (discussion_id, author_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [discussionId, authorId, content]);
                const comment = result.rows[0];
                // Get the full comment with author info
                const fullCommentResult = yield db_1.default.query(`
        SELECT 
          c.id,
          c.discussion_id,
          c.author_id,
          u.username as author_username,
          c.content,
          c.created_at,
          c.updated_at
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.id = $1
      `, [comment.id]);
                return fullCommentResult.rows[0];
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
          c.id,
          c.discussion_id,
          c.author_id,
          u.username as author_username,
          c.content,
          c.created_at,
          c.updated_at
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.id = $1
      `, [id]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.CommentModel = CommentModel;
