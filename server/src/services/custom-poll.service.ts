import { CustomPollModel, CustomPoll, CustomPollWithResults } from '../models/custom-poll.model';
import { BadRequestError, NotFoundError } from '../utils/errorTypes';

export class CustomPollService {
  constructor() {
    // Initialize tables when service is created
    CustomPollModel.initializeTables().catch(error => {
      console.error('Failed to initialize custom poll tables:', error);
    });
  }

  async createPoll(title: string, options: string[], createdBy: number): Promise<CustomPoll> {
    // Validate input
    if (!title || title.trim().length === 0) {
      throw new BadRequestError('Poll title is required');
    }

    if (!options || options.length < 2) {
      throw new BadRequestError('Poll must have at least 2 options');
    }

    if (options.length > 10) {
      throw new BadRequestError('Poll cannot have more than 10 options');
    }

    // Clean up options (trim and filter empty ones)
    const cleanOptions = options
      .map(option => option.trim())
      .filter(option => option.length > 0);

    if (cleanOptions.length < 2) {
      throw new BadRequestError('Poll must have at least 2 valid options');
    }

    try {
      return await CustomPollModel.create(title.trim(), cleanOptions, createdBy);
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  async getAllActivePolls(userId?: number): Promise<CustomPollWithResults[]> {
    try {
      return await CustomPollModel.getAllActiveWithResults(userId);
    } catch (error) {
      console.error('Error fetching active polls:', error);
      throw error;
    }
  }

  async getPollById(pollId: number, userId?: number): Promise<CustomPollWithResults> {
    try {
      const poll = await CustomPollModel.getPollWithResults(pollId, userId);
      if (!poll) {
        throw new NotFoundError('Poll not found');
      }
      return poll;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error fetching poll:', error);
      throw error;
    }
  }

  async vote(pollId: number, userId: number, optionIndex: number): Promise<CustomPollWithResults> {
    try {
      // First check if poll exists
      const poll = await CustomPollModel.findById(pollId);
      if (!poll) {
        throw new NotFoundError('Poll not found');
      }

      if (!poll.is_active) {
        throw new BadRequestError('Poll is no longer active');
      }

      // Validate option index
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new BadRequestError('Invalid option selected');
      }

      // Cast the vote
      await CustomPollModel.vote(pollId, userId, optionIndex);

      // Return updated poll with results
      return await this.getPollById(pollId, userId);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('already voted')) {
        throw new BadRequestError('You have already voted on this poll');
      }
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  async deactivatePoll(pollId: number): Promise<boolean> {
    try {
      const result = await CustomPollModel.deactivate(pollId);
      if (!result) {
        throw new NotFoundError('Poll not found');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error deactivating poll:', error);
      throw error;
    }
  }
} 