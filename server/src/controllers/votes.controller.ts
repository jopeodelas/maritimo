import { Request, Response, NextFunction } from 'express';
import { VoteModel } from '../models/vote.model';
import { PlayerModel } from '../models/player.model';
import { BadRequestError, NotFoundError } from '../utils/errorTypes';

// PERFORMANCE: Simple cache for user votes
let userVotesCache = new Map<number, any>();
let userVotesCacheTime = new Map<number, number>();
const USER_VOTES_CACHE_DURATION = 15_000; // 15 seconds

export const createVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('createVote');
    const { playerId } = req.body;
    const userId = req.userId;

    console.log(`🗳️ VOTE API: User ${userId} voting for player ${playerId}`);

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

    // PERFORMANCE: Clear user's votes cache when they vote
    userVotesCache.delete(userId);
    userVotesCacheTime.delete(userId);
    console.log(`🗳️ PERFORMANCE: Cleared vote cache for user ${userId}`);

    console.timeEnd('createVote');
    res.status(201).json(vote);
  } catch (error) {
    console.error('❌ VOTE API Error:', error);
    console.timeEnd('createVote');
    next(error);
  }
};

export const getUserVotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('getUserVotes');
    const userId = req.userId;

    const now = Date.now();
    
    // PERFORMANCE: Check cache first
    if (userVotesCache.has(userId) && userVotesCacheTime.has(userId)) {
      const cacheTime = userVotesCacheTime.get(userId)!;
      if ((now - cacheTime) < USER_VOTES_CACHE_DURATION) {
        const cachedVotes = userVotesCache.get(userId);
        console.log(`🗳️ PERFORMANCE: Serving user votes from cache (${cachedVotes.length} votes)`);
        console.timeEnd('getUserVotes');
        
        // Set cache headers
        res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
        res.setHeader('X-Cache-Status', 'HIT');
        
        res.json(cachedVotes);
        return;
      }
    }

    console.log(`🗳️ PERFORMANCE: Cache miss - fetching votes for user ${userId}`);
    const votes = await VoteModel.findByUser(userId);
    
    // Update cache
    userVotesCache.set(userId, votes);
    userVotesCacheTime.set(userId, now);
    
    console.log(`🗳️ VOTE API: User ${userId} has ${votes.length} votes`);
    console.timeEnd('getUserVotes');
    
    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.setHeader('X-Cache-Status', 'MISS');
    
    res.json(votes);
  } catch (error) {
    console.error('❌ USER VOTES API Error:', error);
    console.timeEnd('getUserVotes');
    next(error);
  }
};

export const getVoteCounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.time('getVoteCounts');
    
    // PERFORMANCE: Cache vote counts for a short time
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    
    const voteCounts = await VoteModel.getVoteCounts();
    console.log(`🗳️ VOTE COUNTS API: Retrieved ${voteCounts.length} vote counts`);
    
    console.timeEnd('getVoteCounts');
    res.json(voteCounts);
  } catch (error) {
    console.error('❌ VOTE COUNTS API Error:', error);
    console.timeEnd('getVoteCounts');
    next(error);
  }
};

