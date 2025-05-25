import db from '../config/db';

export interface PollVote {
  id: number;
  user_id: number;
  position_id: string;
  created_at: Date;
}

export class PollModel {
  // Initialize the poll_votes table if it doesn't exist
  static async initializeTable(): Promise<void> {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS poll_votes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          position_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      
      await db.query(createTableQuery);
      
      // Create unique constraint to prevent duplicate votes from same user for same position
      const createUniqueIndexQuery = `
        CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_user_position_unique 
        ON poll_votes (user_id, position_id);
      `;
      
      await db.query(createUniqueIndexQuery);
      
      // Create indexes for faster queries
      const createUserIndexQuery = `
        CREATE INDEX IF NOT EXISTS poll_votes_user_id_idx ON poll_votes (user_id);
      `;
      
      const createPositionIndexQuery = `
        CREATE INDEX IF NOT EXISTS poll_votes_position_id_idx ON poll_votes (position_id);
      `;
      
      await db.query(createUserIndexQuery);
      await db.query(createPositionIndexQuery);
      
      console.log('Poll votes table initialized successfully');
    } catch (error) {
      console.error('Error initializing poll votes table:', error);
      throw error;
    }
  }

  static async findByUser(userId: number): Promise<PollVote[]> {
    try {
      const result = await db.query(
        'SELECT * FROM poll_votes WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserAndPosition(userId: number, positionId: string): Promise<PollVote | null> {
    try {
      const result = await db.query(
        'SELECT * FROM poll_votes WHERE user_id = $1 AND position_id = $2',
        [userId, positionId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(userId: number, positionId: string): Promise<PollVote> {
    try {
      // Check if vote already exists
      const existingVote = await this.findByUserAndPosition(userId, positionId);
      if (existingVote) {
        throw new Error('User has already voted for this position');
      }

      const result = await db.query(
        'INSERT INTO poll_votes (user_id, position_id) VALUES ($1, $2) RETURNING *',
        [userId, positionId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async hasUserVoted(userId: number): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT id FROM poll_votes WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getResults(): Promise<{[key: string]: number}> {
    try {
      const result = await db.query(`
        SELECT 
          position_id,
          COUNT(DISTINCT user_id) as vote_count
        FROM poll_votes 
        GROUP BY position_id
      `);

      // Initialize all positions with 0 votes
      const results: {[key: string]: number} = {
        'guarda-redes': 0,
        'defesa-central': 0,
        'laterais': 0,
        'medio-centro': 0,
        'extremos': 0,
        'ponta-de-lanca': 0
      };

      // Update with actual vote counts
      result.rows.forEach((row: any) => {
        results[row.position_id] = parseInt(row.vote_count);
      });

      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getTotalVoters(): Promise<number> {
    try {
      const result = await db.query(`
        SELECT COUNT(DISTINCT user_id) as total_voters
        FROM poll_votes
      `);
      return parseInt(result.rows[0]?.total_voters || '0');
    } catch (error) {
      throw error;
    }
  }
} 