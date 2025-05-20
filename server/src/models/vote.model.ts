import db from '../config/db';

export interface Vote {
  id: number;
  user_id: number;
  player_id: number;
  created_at: Date;
}

export class VoteModel {
  static async findByUserAndPlayer(userId: number, playerId: number): Promise<Vote | null> {
    try {
      const result = await db.query(
        'SELECT * FROM votes WHERE user_id = $1 AND player_id = $2',
        [userId, playerId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUser(userId: number): Promise<Vote[]> {
    try {
      const result = await db.query(
        'SELECT * FROM votes WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(userId: number, playerId: number): Promise<Vote> {
    try {
      // Check if vote already exists
      const existingVote = await this.findByUserAndPlayer(userId, playerId);
      if (existingVote) {
        throw new Error('User has already voted for this player');
      }

      const result = await db.query(
        'INSERT INTO votes (user_id, player_id) VALUES ($1, $2) RETURNING *',
        [userId, playerId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getVoteCounts(): Promise<{ player_id: number; count: number }[]> {
    try {
      const result = await db.query(`
        SELECT player_id, COUNT(*) as count
        FROM votes
        GROUP BY player_id
        ORDER BY count DESC
      `);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}