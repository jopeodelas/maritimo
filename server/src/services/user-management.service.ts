import { UserModel, User } from '../models/user.model';
import { BadRequestError, NotFoundError } from '../utils/errorTypes';

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: Date;
}

export class UserManagementService {
  async getAllUsers(): Promise<UserSummary[]> {
    try {
      const users = await UserModel.findAll();
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        is_banned: user.is_banned,
        created_at: user.created_at
      }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async getBannedUsers(): Promise<UserSummary[]> {
    try {
      const users = await UserModel.findBannedUsers();
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        is_banned: user.is_banned,
        created_at: user.created_at
      }));
    } catch (error) {
      console.error('Error fetching banned users:', error);
      throw error;
    }
  }

  async banUser(userId: number, adminId: number): Promise<boolean> {
    try {
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Prevent self-ban
      if (userId === adminId) {
        throw new BadRequestError('Cannot ban yourself');
      }

      // Prevent banning other admins
      if (user.is_admin) {
        throw new BadRequestError('Cannot ban admin users');
      }

      // Check if user is already banned
      if (user.is_banned) {
        throw new BadRequestError('User is already banned');
      }

      const result = await UserModel.banUser(userId);
      if (!result) {
        throw new Error('Failed to ban user');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error banning user:', error);
      throw error;
    }
  }

  async unbanUser(userId: number): Promise<boolean> {
    try {
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user is actually banned
      if (!user.is_banned) {
        throw new BadRequestError('User is not banned');
      }

      const result = await UserModel.unbanUser(userId);
      if (!result) {
        throw new Error('Failed to unban user');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error unbanning user:', error);
      throw error;
    }
  }
} 