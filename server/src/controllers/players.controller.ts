import { Request, Response, NextFunction } from 'express';
import { PlayerModel } from '../models/player.model';
import { NotFoundError } from '../utils/errorTypes';

export const getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PlayerModel.findAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const player = await PlayerModel.findById(id);
    
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const createPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, position, image_url } = req.body;
    
    if (!name || !position) {
      throw new Error('Name and position are required');
    }
    
    const player = await PlayerModel.create({ name, position, image_url });
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};