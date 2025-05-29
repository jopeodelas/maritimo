import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { UnauthorizedError } from '../utils/errorTypes';

interface JwtPayload {
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      userId: number;
      user: { id: number };
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
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
      req.userId = decoded.id;
      req.user = { id: decoded.id };
      console.log('Token verified, user ID:', decoded.id);
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
