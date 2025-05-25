import { PollModel } from '../models/poll.model';
import { ConflictError } from '../utils/errorTypes';

export class PollService {
  constructor() {
    // Initialize the poll table when service is created
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await PollModel.initializeTable();
    } catch (error) {
      console.error('Failed to initialize poll database:', error);
    }
  }

  async checkUserVote(userId: number) {
    try {
      // Check if user has already voted
      const hasVoted = await PollModel.hasUserVoted(userId);
      
      if (hasVoted) {
        // User has voted, return results
        const results = await PollModel.getResults();
        const totalVotes = await PollModel.getTotalVoters();
        return {
          hasVoted: true,
          results,
          totalVotes
        };
      }

      return { hasVoted: false };
    } catch (error) {
      console.error('Error checking user vote:', error);
      throw error;
    }
  }

  async submitVote(userId: number, positions: string[]) {
    try {
      // Check if user has already voted
      const hasVoted = await PollModel.hasUserVoted(userId);
      
      if (hasVoted) {
        throw new ConflictError('User has already voted in this poll');
      }

      // Insert votes for each selected position
      for (const positionId of positions) {
        await PollModel.create(userId, positionId);
      }

      // Return updated results
      const results = await PollModel.getResults();
      const totalVotes = await PollModel.getTotalVoters();
      
      return {
        results,
        totalVotes
      };
    } catch (error) {
      throw error;
    }
  }

  async getResults() {
    try {
      const results = await PollModel.getResults();
      const totalVotes = await PollModel.getTotalVoters();

      return {
        results,
        totalVotes
      };
    } catch (error) {
      console.error('Error getting poll results:', error);
      throw error;
    }
  }
} 