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