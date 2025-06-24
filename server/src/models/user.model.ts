import db from '../config/db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  google_id?: string;  // Adicionado campo google_id
  is_admin: boolean;   // Campo adicionado para admin
  is_banned: boolean;  // Campo adicionado para banir utilizadores
  created_at: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(
    username: string, 
    email: string, 
    password: string, 
    googleId?: string
  ): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Add google_id if provided
      let result;
      if (googleId) {
        result = await db.query(
          'INSERT INTO users (username, email, password, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [username, email, hashedPassword, googleId]
        );
      } else {
        result = await db.query(
          'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
          [username, email, hashedPassword]
        );
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateGoogleId(userId: number, googleId: string): Promise<User> {
    try {
      const result = await db.query(
        'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *',
        [googleId, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async findAll(): Promise<User[]> {
    try {
      console.log('UserModel.findAll() - Executing query...');
      
      // First, try with is_banned column
      try {
        const result = await db.query(
          'SELECT id, username, email, is_admin, is_banned, created_at FROM users ORDER BY created_at DESC'
        );
        console.log('Query result with is_banned:', result.rows.length, 'rows returned');
        console.log('First row:', result.rows[0]);
        return result.rows;
      } catch (columnError: any) {
        // If is_banned column doesn't exist, try without it
        if (columnError.message && columnError.message.includes('is_banned')) {
          console.log('is_banned column not found, trying without it...');
          const result = await db.query(
            'SELECT id, username, email, is_admin, false as is_banned, created_at FROM users ORDER BY created_at DESC'
          );
          console.log('Query result without is_banned:', result.rows.length, 'rows returned');
          return result.rows;
        }
        throw columnError;
      }
    } catch (error) {
      console.error('Database error in findAll:', error);
      throw error;
    }
  }

  static async findBannedUsers(): Promise<User[]> {
    try {
      const result = await db.query(
        'SELECT id, username, email, is_admin, is_banned, created_at FROM users WHERE is_banned = true ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async banUser(userId: number): Promise<boolean> {
    try {
      const result = await db.query(
        'UPDATE users SET is_banned = true WHERE id = $1 AND is_admin = false RETURNING *',
        [userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async unbanUser(userId: number): Promise<boolean> {
    try {
      const result = await db.query(
        'UPDATE users SET is_banned = false WHERE id = $1 RETURNING *',
        [userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}
