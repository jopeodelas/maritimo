import db from '../config/db';

export interface Player {
  id: number;
  name: string;
  position: string;
  image_url: string;
  created_at: Date;
}

export interface PlayerWithVotes extends Player {
  vote_count: number;
}

export class PlayerModel {
  static async findAll(): Promise<PlayerWithVotes[]> {
    try {
      const result = await db.query(`
        SELECT p.*, COUNT(v.id) as vote_count
        FROM players p
        LEFT JOIN votes v ON p.id = v.player_id
        GROUP BY p.id
        ORDER BY vote_count DESC
      `);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: number): Promise<Player | null> {
    try {
      const result = await db.query(
        'SELECT * FROM players WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(player: Omit<Player, 'id' | 'created_at'>): Promise<Player> {
    try {
      const { name, position, image_url } = player;
      const result = await db.query(
        'INSERT INTO players (name, position, image_url) VALUES ($1, $2, $3) RETURNING *',
        [name, position, image_url]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}