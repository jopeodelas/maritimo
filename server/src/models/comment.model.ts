import db from '../config/db';

export interface Comment {
  id: number;
  discussion_id: number;
  author_id: number;
  author_username: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export class CommentModel {
  static async getByDiscussionId(discussionId: number): Promise<Comment[]> {
    try {
      const result = await db.query(`
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
    } catch (error) {
      throw error;
    }
  }

  static async create(discussionId: number, authorId: number, content: string): Promise<Comment> {
    try {
      const result = await db.query(`
        INSERT INTO comments (discussion_id, author_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [discussionId, authorId, content]);

      const comment = result.rows[0];
      
      // Get the full comment with author info
      const fullCommentResult = await db.query(`
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
    } catch (error) {
      throw error;
    }
  }

  static async getById(id: number): Promise<Comment | null> {
    try {
      const result = await db.query(`
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
    } catch (error) {
      throw error;
    }
  }
} 