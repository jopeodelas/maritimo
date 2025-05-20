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
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      throw new UnauthorizedError('No token, authorization denied');
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(err);
    }
  }
};