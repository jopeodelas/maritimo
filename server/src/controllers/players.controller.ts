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
    
    // Debug: Log recent players with image info
    const recentPlayers = result.players.slice(0, 3);
    console.log('🔍 DEBUG: Recent players image info:');
    recentPlayers.forEach(player => {
      console.log(`  - ID ${player.id}: ${player.name}`);
      console.log(`    - image_url: ${player.image_url}`);
      console.log(`    - image_mime: ${player.image_mime}`);
      console.log(`    - image_url type: ${typeof player.image_url}`);
    });
    
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

    // Handle image upload - store in database as BYTEA
    let playerData: any = { name, position };
    
    if (req.file) {
      // Store image buffer directly in database
      playerData.image_data = req.file.buffer;
      playerData.image_mime = req.file.mimetype;
      console.log('Storing image in database:');
      console.log('- Original name:', req.file.originalname);
      console.log('- MIME type:', req.file.mimetype);
      console.log('- Size:', req.file.size, 'bytes');
    } else {
      console.log('No file uploaded!');
      throw new Error('Player image is required');
    }
    
    console.log('Creating player with data:', { 
      name: playerData.name, 
      position: playerData.position,
      hasImageData: !!playerData.image_data,
      imageMime: playerData.image_mime
    });
    
    const player = await PlayerModel.create(playerData);
    console.log('Player created successfully with ID:', player.id);
    
    // Show what the image URL will be when served
    if (playerData.image_data) {
      const imageUrl = `/api/players/${player.id}/image?v=${Math.floor(Date.now() / 1000)}`;
      console.log(`✅ SUCESSO! Imagem carregou para ${player.name}: ${imageUrl}`);
    }
    
    // PERFORMANCE: Clear players cache when new player is added
    playersCache = null;
    playersCacheTime = 0;
    console.log('🏃 PERFORMANCE: Players cache cleared due to new player creation');
    
    // No need for image sync - images are now stored in database
    console.log('✅ Image stored directly in database - no file sync needed');
    
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
    
    // Handle image upload if provided - store in database as BYTEA
    if (req.file) {
      updateData.image_data = req.file.buffer;
      updateData.image_mime = req.file.mimetype;
      console.log('Updated with new image in database:');
      console.log('- MIME type:', req.file.mimetype);
      console.log('- Size:', req.file.size, 'bytes');
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

export const getPlayerImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('getPlayerImage');
    const id = parseInt(req.params.id);
    
    console.log(`🖼️ GET_PLAYER_IMAGE: Request for player ID ${id}`);
    
    if (isNaN(id)) {
      console.log(`❌ Invalid player ID: ${req.params.id}`);
      return res.status(400).json({ message: 'Invalid player ID' });
    }
    
    const player = await PlayerModel.findById(id);
    console.log(`🖼️ Player ${id} found:`, {
      exists: !!player,
      hasImageData: !!(player?.image_data),
      imageMime: player?.image_mime,
      imageDataSize: player?.image_data ? player.image_data.length : 0
    });
    
    if (!player || !player.image_data) {
      console.log(`No image found for player ${id}`);
      console.timeEnd('getPlayerImage');
      return res.status(404).json({ message: 'Player image not found' });
    }
    
    // Set appropriate headers for image serving
    res.setHeader('Content-Type', player.image_mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
    res.setHeader('Content-Length', player.image_data.length);
    
    console.log(`Serving image for player ${id} (${player.image_mime}, ${player.image_data.length} bytes)`);
    console.timeEnd('getPlayerImage');
    
    return res.send(player.image_data);
  } catch (error) {
    console.error('Error serving player image:', error);
    console.timeEnd('getPlayerImage');
    next(error);
  }
};