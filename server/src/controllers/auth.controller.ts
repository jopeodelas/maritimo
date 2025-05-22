import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/user.model';
import config from '../config';
import { BadRequestError, UnauthorizedError } from '../utils/errorTypes';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

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

export const getGoogleAuthUrl = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state } = req.query;
    
    if (!state) {
      throw new BadRequestError('State parameter is required');
    }
    
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state: state as string,
      prompt: 'consent' // Forces to ask for consent every time for better user experience
    });
    
    res.json({ url });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      throw new BadRequestError('Authorization code is required');
    }
    
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code as string);
    const idToken = tokens.id_token;
    
    if (!idToken) {
      throw new UnauthorizedError('Failed to retrieve user information from Google');
    }
    
    // Verify and decode the token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId as string
    });
    
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      throw new UnauthorizedError('Invalid Google account information');
    }
    
    const { email, name, sub: googleId } = payload;
    
    // Check if user already exists
    let user = await UserModel.findByEmail(email!);
    
    if (!user) {
      // Create new user if doesn't exist
      // Generate a random secure password for Google users
      const randomPassword = Math.random().toString(36).slice(-12);
      
      user = await UserModel.create(
        name || email!.split('@')[0], // Use name or part of email as username
        email!,
        randomPassword,
        googleId
      );
    } else if (!user.google_id) {
      // Update existing user with Google ID if they don't have one
      user = await UserModel.updateGoogleId(user.id, googleId!);
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
