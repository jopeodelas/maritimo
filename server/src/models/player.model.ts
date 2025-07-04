import db from '../config/db';
import { withCache, cacheKeys } from '../utils/cache';

export interface Player {
  id: number;
  name: string;
  position: string;
  image_url: string;
  image_data?: Buffer;
  image_mime?: string;
  created_at: Date;
}

export interface PlayerWithVotes extends Player {
  vote_count: number;
}

export interface PlayersResponse {
  players: PlayerWithVotes[];
  totalUniqueVoters: number;
}

export class PlayerModel {
  static async findAll(): Promise<PlayersResponse> {
    // Use cache for this expensive query (5 minutes TTL)
    return withCache(
      cacheKeys.PLAYER_RANKINGS,
      async () => {
        try {
          console.log('Attempting to fetch players from database...');
          
          // First, check if image_data column exists
          const columnCheckResult = await db.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' 
              AND table_name = 'players'
              AND column_name = 'image_data'
          `);
          
          const hasImageDataColumn = columnCheckResult.rows.length > 0;
          console.log('Has image_data column:', hasImageDataColumn);
          
          let playersQuery: string;
          
          if (hasImageDataColumn) {
            // Modern query with image_data column
            playersQuery = `
              SELECT p.id, p.name, p.position, 
                     CASE 
                       WHEN p.image_data IS NOT NULL 
                       THEN CONCAT('/api/players/', p.id, '/image?v=', EXTRACT(EPOCH FROM p.created_at))
                       WHEN p.image_url IS NOT NULL
                       THEN p.image_url
                       ELSE NULL
                     END AS image_url,
                     p.image_mime, p.created_at, COUNT(v.id) as vote_count
              FROM players p
              LEFT JOIN votes v ON p.id = v.player_id
              GROUP BY p.id, p.name, p.position, p.image_url, p.image_mime, p.created_at, p.image_data
              ORDER BY vote_count DESC
            `;
          } else {
            // Legacy query without image_data column
            playersQuery = `
              SELECT p.id, p.name, p.position, 
                     p.image_url,
                     NULL as image_mime, p.created_at, COUNT(v.id) as vote_count
              FROM players p
              LEFT JOIN votes v ON p.id = v.player_id
              GROUP BY p.id, p.name, p.position, p.image_url, p.created_at
              ORDER BY vote_count DESC
            `;
          }
          
          const playersResult = await db.query(playersQuery);
          console.log('Players query result:', playersResult.rows);

          // Get total unique voters
          const votersResult = await db.query(`
            SELECT COUNT(DISTINCT user_id) as total_unique_voters
            FROM votes
          `);

          console.log('Voters query result:', votersResult.rows);

          const totalUniqueVoters = parseInt(votersResult.rows[0]?.total_unique_voters || '0');

          const response = {
            players: playersResult.rows,
            totalUniqueVoters
          };

          console.log('Final response:', response);

          return response;
        } catch (error) {
          console.error('Error in PlayerModel.findAll:', error);
          throw error;
        }
      },
      300 // Cache for 5 minutes
    );
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
      console.log('=== PLAYER MODEL CREATE ===');
      console.log('Input data:', { 
        name: player.name, 
        position: player.position, 
        image_url: player.image_url,
        hasImageData: !!player.image_data,
        image_mime: player.image_mime
      });
      
      const { name, position, image_url, image_data, image_mime } = player;
      
      // Check if image_data column exists
      const columnCheckResult = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'players'
          AND column_name = 'image_data'
      `);
      
      const hasImageDataColumn = columnCheckResult.rows.length > 0;
      
      let query: string;
      let values: any[];
      
      if (hasImageDataColumn && image_data && image_mime) {
        // Store image in database as BYTEA
        query = 'INSERT INTO players (name, position, image_data, image_mime) VALUES ($1, $2, $3, $4) RETURNING *';
        values = [name, position, image_data, image_mime];
        console.log('Storing image in database as BYTEA');
      } else if (image_url) {
        // Legacy: store image_url for existing images
        query = 'INSERT INTO players (name, position, image_url) VALUES ($1, $2, $3) RETURNING *';
        values = [name, position, image_url];
        console.log('Storing legacy image_url:', image_url);
      } else {
        // No image
        query = 'INSERT INTO players (name, position) VALUES ($1, $2) RETURNING *';
        values = [name, position];
        console.log('Creating player without image');
      }
      
      console.log('Executing SQL query:', query);
      const result = await db.query(query, values);
      
      console.log('Player created with ID:', result.rows[0].id);
      
      // Invalidate cache since player rankings changed
      const { cache } = await import('../utils/cache');
      cache.delete(cacheKeys.PLAYER_RANKINGS);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in PlayerModel.create:', error);
      throw error;
    }
  }

  static async update(id: number, player: Partial<Omit<Player, 'id' | 'created_at'>>): Promise<Player | null> {
    try {
      const { name, position, image_url, image_data, image_mime } = player;
      
      // Check if image_data column exists
      const columnCheckResult = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'players'
          AND column_name = 'image_data'
      `);
      
      const hasImageDataColumn = columnCheckResult.rows.length > 0;
      
      let query: string;
      let values: any[];
      
      if (hasImageDataColumn && image_data && image_mime) {
        // Update with new image in database as BYTEA
        query = 'UPDATE players SET name = COALESCE($1, name), position = COALESCE($2, position), image_data = $3, image_mime = $4 WHERE id = $5 RETURNING *';
        values = [name, position, image_data, image_mime, id];
        console.log('Updating player with new BYTEA image');
      } else if (image_url) {
        // Legacy: update image_url for existing images
        query = 'UPDATE players SET name = COALESCE($1, name), position = COALESCE($2, position), image_url = COALESCE($3, image_url) WHERE id = $4 RETURNING *';
        values = [name, position, image_url, id];
        console.log('Updating player with legacy image_url');
      } else {
        // Update only name and position
        query = 'UPDATE players SET name = COALESCE($1, name), position = COALESCE($2, position) WHERE id = $3 RETURNING *';
        values = [name, position, id];
        console.log('Updating player without image changes');
      }
      
      const result = await db.query(query, values);
      
      // Invalidate cache since player rankings may have changed
      const { cache } = await import('../utils/cache');
      cache.delete(cacheKeys.PLAYER_RANKINGS);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in PlayerModel.update:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      // First delete related votes
      await db.query('DELETE FROM votes WHERE player_id = $1', [id]);
      
      // Then delete the player
      const result = await db.query('DELETE FROM players WHERE id = $1', [id]);
      
      // Invalidate cache since player rankings changed
      const { cache } = await import('../utils/cache');
      cache.delete(cacheKeys.PLAYER_RANKINGS);
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw error;
    }
  }
}