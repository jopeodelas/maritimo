export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface Player {
    id: number;
    name: string;
    position: string;
    image_url: string;
    vote_count: number;
    player_type?: 'regular' | 'match';
  }
  
  export interface Vote {
    id: number;
    player_id: number;
    user_id: number;
    created_at: string;
  }

  export interface Discussion {
    id: number;
    title: string;
    description: string;
    author_id: number;
    author_username: string;
    created_at: string;
    updated_at: string;
    comment_count: number;
    last_activity: string;
  }

  export interface Comment {
    id: number;
    discussion_id: number;
    author_id: number;
    author_username: string;
    content: string;
    created_at: string;
    updated_at: string;
  }

  // New types for player ratings system
  export interface PlayerRating {
    id: number;
    player_id: number;
    user_id: number;
    match_id: number;
    rating: number;
    created_at: string;
  }

  export interface MatchVoting {
    id: number;
    match_id: number;
    home_team: string;
    away_team: string;
    match_date: string;
    is_active: boolean;
    players: Player[];
    created_at: string;
    matchDetails?: {
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
      homeLogo: string;
      awayLogo: string;
      matchDate: string;
      status: string;
    };
  }

  export interface ManOfTheMatchVote {
    id: number;
    player_id: number;
    user_id: number;
    match_id: number;
    created_at: string;
  }

  export interface PlayerAverageRating {
    player_id: number;
    player_name: string;
    average_rating: number;
    total_ratings: number;
  }

  export interface ManOfTheMatchResult {
    player_id: number;
    player_name: string;
    vote_count: number;
    percentage: number;
  }