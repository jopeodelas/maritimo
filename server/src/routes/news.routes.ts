import { Router } from 'express';
import { getNews, refreshNews } from '../controllers/news.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Get all news
router.get('/', auth, getNews);

// Refresh news
router.post('/refresh', auth, refreshNews);

export default router; 