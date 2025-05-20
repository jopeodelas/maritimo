// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getCurrentUser);

export default router;
