import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { UnauthorizedError } from '../utils/errorTypes';
import { UserModel } from '../models/user.model';

interface JwtPayload {
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      userId: number;
      user: { id: number; is_admin?: boolean };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Auth middleware - Signed Cookies:', req.signedCookies);
      console.log('Auth middleware - Regular Cookies:', req.cookies);
      
      // Buscar o token nos cookies assinados
      const token = req.signedCookies.token;
      
      if (!token) {
        console.log('No token found in signed cookies');
        throw new UnauthorizedError('No token, authorization denied');
      }
  
      console.log('Token found, verifying...');
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      
      // Check if user exists and is not banned
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      
      if (user.is_banned) {
        throw new UnauthorizedError('User account has been banned');
      }
      
      req.userId = decoded.id;
      req.user = { id: decoded.id, is_admin: user.is_admin };
      console.log('Token verified, user ID:', decoded.id, 'is_admin:', user.is_admin);
      
      // Additional validation to ensure consistency
      if (req.userId !== req.user.id) {
        console.error('⚠️ CRITICAL: userId and user.id mismatch!', {
          userId: req.userId,
          userObjectId: req.user.id
        });
      }
      
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      if (err instanceof jwt.JsonWebTokenError) {
        next(new UnauthorizedError('Invalid token'));
      } else {
        next(err);
      }
    }
  };
