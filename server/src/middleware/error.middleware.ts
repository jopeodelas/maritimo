import { Request, Response, NextFunction } from 'express';
import { AppError, NotFoundError } from '../utils/errorTypes';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Default to 500 server error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};