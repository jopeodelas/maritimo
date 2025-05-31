import db from '../config/db';

export interface CustomPoll {
  id: number;
  title: string;
  options: string[];
  created_by: number;
  created_at: Date;
  is_active: boolean;
}

export interface CustomPollVote {
  id: number;
  poll_id: number;
  user_id: number;
  option_index: number;
  created_at: Date;
}

export interface CustomPollWithResults extends CustomPoll {
  votes: number[];  // Array where index matches option_index and value is vote count
  total_votes: number;
  user_voted_option?: number; // Option index the current user voted for (if any)
}

export class CustomPollModel {
  // Initialize the custom poll tables if they don't exist
  static async initializeTables(): Promise<void> {
    try {
      // Add is_admin column to users table if it doesn't exist
      const addAdminColumnQuery = `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
      `;
      await db.query(addAdminColumnQuery);

      // Create custom_polls table
      const createPollsTableQuery = `
        CREATE TABLE IF NOT EXISTS custom_polls (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          options TEXT[] NOT NULL,
          created_by INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      await db.query(createPollsTableQuery);

      // Create custom_poll_votes table
      const createVotesTableQuery = `
        CREATE TABLE IF NOT EXISTS custom_poll_votes (
          id SERIAL PRIMARY KEY,
          poll_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          option_index INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (poll_id) REFERENCES custom_polls(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      await db.query(createVotesTableQuery);

      // Create unique constraint and indexes
      const createIndexesQuery = `
        CREATE UNIQUE INDEX IF NOT EXISTS custom_poll_votes_user_poll_unique 
        ON custom_poll_votes (user_id, poll_id);
        
        CREATE INDEX IF NOT EXISTS custom_polls_created_by_idx ON custom_polls (created_by);
        CREATE INDEX IF NOT EXISTS custom_poll_votes_poll_id_idx ON custom_poll_votes (poll_id);
        CREATE INDEX IF NOT EXISTS custom_poll_votes_user_id_idx ON custom_poll_votes (user_id);
      `;
      await db.query(createIndexesQuery);

      console.log('Custom polls tables initialized successfully');
    } catch (error) {
      console.error('Error initializing custom polls tables:', error);
      throw error;
    }
  }

  static async create(title: string, options: string[], createdBy: number): Promise<CustomPoll> {
    try {
      const result = await db.query(
        'INSERT INTO custom_polls (title, options, created_by) VALUES ($1, $2, $3) RETURNING *',
        [title, options, createdBy]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: number): Promise<CustomPoll | null> {
    try {
      const result = await db.query(
        'SELECT * FROM custom_polls WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findAllActive(): Promise<CustomPoll[]> {
    try {
      const result = await db.query(
        'SELECT * FROM custom_polls WHERE is_active = true ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async vote(pollId: number, userId: number, optionIndex: number): Promise<CustomPollVote> {
    try {
      // Check if user has already voted
      const existingVote = await this.findUserVote(pollId, userId);
      if (existingVote) {
        throw new Error('User has already voted on this poll');
      }

      const result = await db.query(
        'INSERT INTO custom_poll_votes (poll_id, user_id, option_index) VALUES ($1, $2, $3) RETURNING *',
        [pollId, userId, optionIndex]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findUserVote(pollId: number, userId: number): Promise<CustomPollVote | null> {
    try {
      const result = await db.query(
        'SELECT * FROM custom_poll_votes WHERE poll_id = $1 AND user_id = $2',
        [pollId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getPollResults(pollId: number): Promise<number[]> {
    try {
      // First get the poll to know how many options it has
      const poll = await this.findById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      // Initialize results array with zeros for each option
      const results = new Array(poll.options.length).fill(0);

      // Get vote counts for each option
      const voteResult = await db.query(
        'SELECT option_index, COUNT(*) as vote_count FROM custom_poll_votes WHERE poll_id = $1 GROUP BY option_index',
        [pollId]
      );

      // Fill in the actual vote counts
      voteResult.rows.forEach((row: any) => {
        const optionIndex = parseInt(row.option_index);
        const voteCount = parseInt(row.vote_count);
        if (optionIndex < results.length) {
          results[optionIndex] = voteCount;
        }
      });

      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getPollWithResults(pollId: number, userId?: number): Promise<CustomPollWithResults | null> {
    try {
      const poll = await this.findById(pollId);
      if (!poll) {
        return null;
      }

      const votes = await this.getPollResults(pollId);
      const totalVotes = votes.reduce((sum, count) => sum + count, 0);
      
      let userVotedOption: number | undefined;
      if (userId) {
        const userVote = await this.findUserVote(pollId, userId);
        userVotedOption = userVote?.option_index;
      }

      return {
        ...poll,
        votes,
        total_votes: totalVotes,
        user_voted_option: userVotedOption
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllActiveWithResults(userId?: number): Promise<CustomPollWithResults[]> {
    try {
      const polls = await this.findAllActive();
      
      const pollsWithResults = await Promise.all(
        polls.map(async (poll) => {
          const votes = await this.getPollResults(poll.id);
          const totalVotes = votes.reduce((sum, count) => sum + count, 0);
          
          let userVotedOption: number | undefined;
          if (userId) {
            const userVote = await this.findUserVote(poll.id, userId);
            userVotedOption = userVote?.option_index;
          }

          return {
            ...poll,
            votes,
            total_votes: totalVotes,
            user_voted_option: userVotedOption
          };
        })
      );

      return pollsWithResults;
    } catch (error) {
      throw error;
    }
  }

  static async deactivate(pollId: number): Promise<boolean> {
    try {
      const result = await db.query(
        'UPDATE custom_polls SET is_active = false WHERE id = $1 RETURNING *',
        [pollId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
} 