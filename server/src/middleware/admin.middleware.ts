import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { UnauthorizedError } from '../utils/errorTypes';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First check if user is authenticated (userId should be set by auth middleware)
    if (!req.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Get user from database to check admin status
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check if user is admin
    if (!user.is_admin) {
      throw new UnauthorizedError('Admin access required');
    }

    // Add admin user to request for convenience
    req.user = { id: user.id, is_admin: true };
    next();
  } catch (error) {
    next(error);
  }
}; 