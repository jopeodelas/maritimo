import { Router } from 'express';
import { getNews, refreshNews } from '../controllers/news.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Get all news - public access
router.get('/', getNews);

// Refresh news - requires auth
router.post('/refresh', auth, refreshNews);

export default router; 