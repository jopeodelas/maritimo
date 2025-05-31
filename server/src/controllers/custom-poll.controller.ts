import { Request, Response, NextFunction } from 'express';
import { CustomPollService } from '../services/custom-poll.service';
import { BadRequestError } from '../utils/errorTypes';

export class CustomPollController {
  private customPollService: CustomPollService;

  constructor() {
    this.customPollService = new CustomPollService();
  }

  // Admin only - Create a new poll
  createPoll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, options } = req.body;
      const createdBy = req.userId;

      if (!title || !options) {
        throw new BadRequestError('Title and options are required');
      }

      if (!Array.isArray(options)) {
        throw new BadRequestError('Options must be an array');
      }

      const poll = await this.customPollService.createPoll(title, options, createdBy);
      res.status(201).json(poll);
    } catch (error) {
      next(error);
    }
  };

  // Get all active polls with results
  getAllPolls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId; // This will be set by auth middleware
      const polls = await this.customPollService.getAllActivePolls(userId);
      res.json(polls);
    } catch (error) {
      next(error);
    }
  };

  // Get a specific poll by ID
  getPollById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = parseInt(req.params.id);
      const userId = req.userId;

      if (isNaN(pollId)) {
        throw new BadRequestError('Invalid poll ID');
      }

      const poll = await this.customPollService.getPollById(pollId, userId);
      res.json(poll);
    } catch (error) {
      next(error);
    }
  };

  // Vote on a poll
  vote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = parseInt(req.params.id);
      const { optionIndex } = req.body;
      const userId = req.userId;

      if (isNaN(pollId)) {
        throw new BadRequestError('Invalid poll ID');
      }

      if (typeof optionIndex !== 'number' || optionIndex < 0) {
        throw new BadRequestError('Valid option index is required');
      }

      const poll = await this.customPollService.vote(pollId, userId, optionIndex);
      res.json(poll);
    } catch (error) {
      next(error);
    }
  };

  // Admin only - Deactivate a poll
  deactivatePoll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pollId = parseInt(req.params.id);

      if (isNaN(pollId)) {
        throw new BadRequestError('Invalid poll ID');
      }

      const result = await this.customPollService.deactivatePoll(pollId);
      res.json({ success: result });
    } catch (error) {
      next(error);
    }
  };
} 