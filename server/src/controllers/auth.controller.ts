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
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      signed: true // Adicione esta opção para assinar o cookie
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

    // Check if user is banned
    if (user.is_banned) {
      throw new UnauthorizedError('A sua conta foi banida por um administrador do CS Marítimo for fans. Se acredita que isto foi um erro, entre em contacto connosco.');
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
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      signed: true // Adicione esta opção para assinar o cookie
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
      console.log('Google callback received - Method:', req.method);
      console.log('Query params:', req.query);
      console.log('Body:', req.body);
      
      // Extrair o código tanto da query (GET) quanto do body (POST)
      const code = req.method === 'GET' ? req.query.code as string : req.body.code;
      
      if (!code) {
        console.log('No authorization code found');
        throw new BadRequestError('Authorization code is required');
      }
      
      console.log('Authorization code received, exchanging for tokens...');
      
      // Exchange code for tokens
      try {
        const { tokens } = await googleClient.getToken(code);
        console.log('Tokens received:', tokens ? 'Success' : 'Failed');
        
        const idToken = tokens.id_token;
        
        if (!idToken) {
          console.log('No ID token found in response');
          throw new UnauthorizedError('Failed to retrieve user information from Google');
        }
        
        // Verify and decode the token
        console.log('Verifying ID token...');
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: config.googleClientId as string
        });
        
        const payload = ticket.getPayload();
        console.log('ID token verified, payload:', payload ? 'Success' : 'Failed');
        
        if (!payload || !payload.email) {
          console.log('Invalid payload or missing email');
          throw new UnauthorizedError('Invalid Google account information');
        }
        
        const { email, name, sub: googleId } = payload;
        console.log('User info from Google:', { email, name, googleId: googleId?.substring(0, 5) + '...' });
        
        // Check if user already exists
        let user = await UserModel.findByEmail(email!);
        console.log('User exists in database:', user ? 'Yes' : 'No');
        
        if (!user) {
          // Create new user if doesn't exist
          // Generate a random secure password for Google users
          const randomPassword = Math.random().toString(36).slice(-12);
          console.log('Creating new user...');
          
          user = await UserModel.create(
            name || email!.split('@')[0], // Use name or part of email as username
            email!,
            randomPassword,
            googleId
          );
          console.log('New user created with ID:', user.id);
        } else {
          // Check if existing user is banned
          if (user.is_banned) {
            console.log('User is banned, blocking Google login');
            throw new UnauthorizedError('A sua conta foi banida por um administrador do CS Marítimo for fans. Se acredita que isto foi um erro, entre em contacto connosco.');
          }
          
          if (!user.google_id) {
            // Update existing user with Google ID if they don't have one
            console.log('Updating existing user with Google ID...');
            user = await UserModel.updateGoogleId(user.id, googleId!);
            console.log('User updated with Google ID');
          }
        }
        
        // Create JWT
        console.log('Creating JWT token...');
        const token = jwt.sign(
          { id: user.id },
          config.jwtSecret as string,
          { expiresIn: config.jwtExpiry as string } as jwt.SignOptions
        );
        
        // Set JWT as HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'lax', // Use 'lax' para permitir cookies em redirecionamentos
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            signed: true // Adicione esta opção para assinar o cookie
        });
  
        
        // Para requisições GET, redirecionar para a página principal após autenticação bem-sucedida
        if (req.method === 'GET') {
          console.log('Redirecting to main page...');
          console.log('Config clientUrl:', config.clientUrl);
          
          // Ensure no double slashes in URL
          let baseUrl = config.clientUrl;
          if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
          }
          const redirectUrl = `${baseUrl}/main`;
          
          console.log('Final redirect URL:', redirectUrl);
          return res.redirect(redirectUrl);
        }
        
        // Para requisições POST, enviar a resposta JSON como antes
        console.log('Sending JSON response with user data...');
        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
        
      } catch (tokenError) {
        console.error('Error exchanging code for tokens:', tokenError);
        throw tokenError;
      }
      
    } catch (error) {
      console.error('Google callback error:', error);
      
      // Para requisições GET, redirecionar para a página de login com mensagem de erro
      if (req.method === 'GET') {
        console.log('Redirecting to login page with error...');
        console.log('Config clientUrl:', config.clientUrl);
        
        // Ensure no double slashes in URL
        let baseUrl = config.clientUrl;
        if (baseUrl.endsWith('/')) {
          baseUrl = baseUrl.slice(0, -1);
        }
        const errorRedirectUrl = `${baseUrl}/login?error=google_auth_failed`;
        
        console.log('Final error redirect URL:', errorRedirectUrl);
        return res.redirect(errorRedirectUrl);
      }
      
      next(error);
    }
  };
  

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    signed: true
  });
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
