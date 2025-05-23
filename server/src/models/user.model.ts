import db from '../config/db';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  google_id?: string;  // Adicionado campo google_id
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
}
