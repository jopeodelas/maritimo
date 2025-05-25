import { Request, Response, NextFunction } from 'express';
import { PollService } from '../services/poll.service';
import { BadRequestError } from '../utils/errorTypes';

export class PollController {
  private pollService: PollService;

  constructor() {
    this.pollService = new PollService();
  }

  checkUserVote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const result = await this.pollService.checkUserVote(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  submitVote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const { positions } = req.body;

      if (!positions || !Array.isArray(positions) || positions.length === 0) {
        throw new BadRequestError('Positions array is required and cannot be empty');
      }

      const result = await this.pollService.submitVote(userId, positions);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await this.pollService.getResults();
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
} 