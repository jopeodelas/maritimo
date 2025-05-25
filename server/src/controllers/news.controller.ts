import { Request, Response } from 'express';
import { newsService } from '../services/newsService';

export const getNews = async (req: Request, res: Response) => {
  try {
    const news = await newsService.getNews();
    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: 'Unable to retrieve news at this time'
    });
  }
};

export const refreshNews = async (req: Request, res: Response) => {
  try {
    const news = await newsService.refreshNews();
    res.json({
      success: true,
      message: 'News refreshed successfully',
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    res.status(500).json({ 
      error: 'Failed to refresh news',
      message: 'Unable to update news at this time'
    });
  }
}; 