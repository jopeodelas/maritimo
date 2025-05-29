import db from '../config/db';

export interface Discussion {
  id: number;
  title: string;
  description: string;
  author_id: number;
  author_username: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
  last_activity: string;
}

export class DiscussionModel {
  static async getAll(sort: string = 'newest'): Promise<Discussion[]> {
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

      const result = await db.query(`
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
    } catch (error) {
      throw error;
    }
  }

  static async getById(id: number): Promise<Discussion | null> {
    try {
      const result = await db.query(`
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
    } catch (error) {
      throw error;
    }
  }

  static async create(authorId: number, title: string, description: string): Promise<Discussion> {
    try {
      const result = await db.query(`
        INSERT INTO discussions (title, description, author_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [title, description, authorId]);

      const discussion = result.rows[0];
      
      // Get the full discussion with author info
      return await this.getById(discussion.id) as Discussion;
    } catch (error) {
      throw error;
    }
  }

  static async updateLastActivity(id: number): Promise<void> {
    try {
      await db.query(`
        UPDATE discussions 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [id]);
    } catch (error) {
      throw error;
    }
  }
} 