// src/routes/auth.routes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  getGoogleAuthUrl, 
  handleGoogleCallback 
} from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getCurrentUser);

// Google OAuth routes
router.get('/google/url', getGoogleAuthUrl);
router.get('/google/initiate', getGoogleAuthUrl); // Alias para compatibilidade
router.get('/google/callback', handleGoogleCallback); 
router.post('/google/callback', handleGoogleCallback); 

export default router;
