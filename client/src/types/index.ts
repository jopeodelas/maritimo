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
  }
  
  export interface Vote {
    id: number;
    player_id: number;
    user_id: number;
    created_at: string;
  }