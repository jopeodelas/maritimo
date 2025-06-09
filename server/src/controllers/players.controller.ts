import { Request, Response, NextFunction } from 'express';
import { PlayerModel } from '../models/player.model';
import { NotFoundError } from '../utils/errorTypes';

const { syncImages } = require('../../sync-images');

export const getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== GET ALL PLAYERS DEBUG ===');
    const result = await PlayerModel.findAll();
    
    console.log('Players returned from database:');
    result.players.forEach(player => {
      console.log(`- ${player.name}: image_url = "${player.image_url}"`);
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error in getAllPlayers:', error);
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
    console.log('=== CREATE PLAYER REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { name, position } = req.body;
    
    if (!name || !position) {
      console.log('Missing required fields:', { name, position });
      throw new Error('Name and position are required');
    }

    // Handle image upload
    let image_url = '';
    if (req.file) {
      // Store just the filename, not the full path
      image_url = req.file.filename;
      console.log('Uploaded file details:');
      console.log('- Filename:', req.file.filename);
      console.log('- Original name:', req.file.originalname);
      console.log('- Path:', req.file.path);
      console.log('- Size:', req.file.size);
      console.log('- Saving image_url as:', image_url);
    } else {
      console.log('No file uploaded!');
      throw new Error('Player image is required');
    }
    
    console.log('Creating player with data:', { name, position, image_url });
    const player = await PlayerModel.create({ name, position, image_url });
    console.log('Player created successfully:', player);
    
    // AUTOMATIC IMAGE SYNC - Copy new image to client
    console.log('🔄 Syncing images to client...');
    try {
      syncImages();
      console.log('✅ Images synced successfully!');
    } catch (syncError) {
      console.error('❌ Failed to sync images:', syncError);
      // Don't fail the request if sync fails
    }
    
    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    next(error);
  }
};

export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { name, position } = req.body;
    
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (position) updateData.position = position;
    
    // Handle image upload if provided
    if (req.file) {
      updateData.image_url = req.file.filename;
      console.log('Updated with new image:', req.file.filename);
    }
    
    const player = await PlayerModel.update(id, updateData);
    
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await PlayerModel.delete(id);
    
    if (!result) {
      throw new NotFoundError('Player not found');
    }
    
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    next(error);
  }
};