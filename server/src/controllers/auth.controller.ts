import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import config from '../config';
import { BadRequestError, UnauthorizedError } from '../utils/errorTypes';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new BadRequestError('Please provide all required fields');
    }

    // Password validation
    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    const user = await UserModel.create(username, email, password);

    // Create JWT
    const token = jwt.sign({ id: user.id }, config.jwtSecret as string, {
      expiresIn: config.jwtExpiry as string
    } as jwt.SignOptions);

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Send response without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if password is correct
    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id },
      config.jwtSecret as string,
      { expiresIn: config.jwtExpiry as string } as jwt.SignOptions
    );

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Send response without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    // Send response without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};