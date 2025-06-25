import { Request, Response, NextFunction } from 'express';
import { PlayerModel } from '../models/player.model';
import { NotFoundError } from '../utils/errorTypes';

const { syncImages } = require('../../sync-images');

// PERFORMANCE: Simple cache for players data
let playersCache: any = null;
let playersCacheTime = 0;
const PLAYERS_CACHE_DURATION = 30_000; // 30 seconds

export const getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('getAllPlayers');
    console.log('🏃 PLAYERS API: Getting all players...');
    
    const now = Date.now();
    
    // PERFORMANCE: Check cache first
    if (playersCache && (now - playersCacheTime) < PLAYERS_CACHE_DURATION) {
      console.log(`🏃 PERFORMANCE: Serving players from cache (${playersCache.players.length} players)`);
      console.timeEnd('getAllPlayers');
      
      // Set cache headers
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
      res.setHeader('X-Cache-Status', 'HIT');
      
      res.json(playersCache);
      return;
    }
    
    console.log('🏃 PERFORMANCE: Cache miss - fetching players from DB...');
    const result = await PlayerModel.findAll();
    
    // Update cache
    playersCache = result;
    playersCacheTime = now;
    
    console.log(`🏃 PLAYERS API: Loaded ${result.players.length} players, ${result.totalUniqueVoters} unique voters`);
    console.timeEnd('getAllPlayers');
    
    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    res.setHeader('X-Cache-Status', 'MISS');
    
    res.json(result);
  } catch (error) {
    console.error('❌ PLAYERS API Error:', error);
    console.timeEnd('getAllPlayers');
    next(error);
  }
};

export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('getPlayerById');
    const id = parseInt(req.params.id);
    const player = await PlayerModel.findById(id);
    
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    
    // Set cache headers for individual players
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    
    console.timeEnd('getPlayerById');
    res.json(player);
  } catch (error) {
    console.timeEnd('getPlayerById');
    next(error);
  }
};

export const createPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('createPlayer');
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
    
    // PERFORMANCE: Clear players cache when new player is added
    playersCache = null;
    playersCacheTime = 0;
    console.log('🏃 PERFORMANCE: Players cache cleared due to new player creation');
    
    // AUTOMATIC IMAGE SYNC - Copy new image to client
    console.log('🔄 Syncing images to client...');
    try {
      syncImages();
      console.log('✅ Images synced successfully!');
    } catch (syncError) {
      console.error('❌ Failed to sync images:', syncError);
      // Don't fail the request if sync fails
    }
    
    console.timeEnd('createPlayer');
    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    console.timeEnd('createPlayer');
    next(error);
  }
};

export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('updatePlayer');
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
    
    // PERFORMANCE: Clear players cache when player is updated
    playersCache = null;
    playersCacheTime = 0;
    console.log('🏃 PERFORMANCE: Players cache cleared due to player update');
    
    console.timeEnd('updatePlayer');
    res.json(player);
  } catch (error) {
    console.timeEnd('updatePlayer');
    next(error);
  }
};

export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('deletePlayer');
    const id = parseInt(req.params.id);
    const result = await PlayerModel.delete(id);
    
    if (!result) {
      throw new NotFoundError('Player not found');
    }
    
    // PERFORMANCE: Clear players cache when player is deleted
    playersCache = null;
    playersCacheTime = 0;
    console.log('🏃 PERFORMANCE: Players cache cleared due to player deletion');
    
    console.timeEnd('deletePlayer');
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.timeEnd('deletePlayer');
    next(error);
  }
};