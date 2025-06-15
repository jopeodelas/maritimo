import api from './api';
import type { 
  MatchVoting, 
  PlayerRating, 
  ManOfTheMatchVote, 
  PlayerAverageRating, 
  ManOfTheMatchResult 
} from '../types';

// Get active voting session
export const getActiveVoting = async (): Promise<MatchVoting | null> => {
  try {
    const response = await api.get('/player-ratings/active-voting');
    return response.data;
  } catch (error) {
    console.error('Error fetching active voting:', error);
    return null;
  }
};

// Submit player ratings
export const submitPlayerRatings = async (ratings: {
  match_id: number;
  ratings: { player_id: number; rating: number }[];
  man_of_match_player_id: number;
}): Promise<boolean> => {
  try {
    await api.post('/player-ratings/submit', ratings);
    return true;
  } catch (error) {
    console.error('Error submitting player ratings:', error);
    return false;
  }
};

// Get player average rating
export const getPlayerAverageRating = async (playerId: number): Promise<PlayerAverageRating | null> => {
  try {
    const response = await api.get(`/player-ratings/player/${playerId}/average`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player average rating:', error);
    return null;
  }
};

// Get man of the match results
export const getManOfTheMatchResults = async (matchId: number): Promise<ManOfTheMatchResult[]> => {
  try {
    const response = await api.get(`/player-ratings/match/${matchId}/man-of-match-results`);
    return response.data;
  } catch (error) {
    console.error('Error fetching man of the match results:', error);
    return [];
  }
};

// Check if user has already voted for this match
export const hasUserVoted = async (matchId: number): Promise<boolean> => {
  try {
    const response = await api.get(`/player-ratings/match/${matchId}/has-voted`);
    return response.data.hasVoted;
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    return false;
  }
};

// Get user's ratings for a match (if they have voted)
export const getUserRatings = async (matchId: number): Promise<{ ratings: PlayerRating[]; manOfMatchVote: ManOfTheMatchVote | null }> => {
  try {
    const response = await api.get(`/player-ratings/match/${matchId}/user-ratings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return { ratings: [], manOfMatchVote: null };
  }
}; 