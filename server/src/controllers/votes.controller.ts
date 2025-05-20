import { Request, Response, NextFunction } from 'express';
import { VoteModel } from '../models/vote.model';
import { PlayerModel } from '../models/player.model';
import { BadRequestError, NotFoundError } from '../utils/errorTypes';

export const createVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId } = req.body;
    const userId = req.userId;
    
    if (!playerId) {
      throw new BadRequestError('Player ID is required');
    }
    
    // Check if player exists
    const player = await PlayerModel.findById(playerId);
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    
    // Create vote
    const vote = await VoteModel.create(userId, playerId);
    res.status(201).json(vote);
  } catch (error) {
    next(error);
  }
};

export const getUserVotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const votes = await VoteModel.findByUser(userId);
    res.json(votes);
  } catch (error) {
    next(error);
  }
};

export const getVoteCounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voteCounts = await VoteModel.getVoteCounts();
    res.json(voteCounts);
  } catch (error) {
    next(error);
  }
};