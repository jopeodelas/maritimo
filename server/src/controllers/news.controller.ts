import { Request, Response } from 'express';
import { newsService } from '../services/newsService';

export const getNews = async (req: Request, res: Response) => {
  try {
    console.log('📰 NEWS API: Getting news...');
    let news = await newsService.getNews();
    console.log(`📰 NEWS API: Found ${news.length} news items in cache`);
    
    // SERVERLESS FIX: If no news in cache, fetch immediately
    if (news.length === 0) {
      console.log('📰 NEWS API: No news in cache - fetching fresh news for serverless...');
      const { realNewsService } = require('../services/realNewsService');
      news = await realNewsService.fetchAllMaritimoNews();
      console.log(`📰 NEWS API: Fetched ${news.length} fresh news items`);
    }
    
    // Log first few items for debugging
    if (news.length > 0) {
      console.log('📰 NEWS API: First news item:', {
        title: news[0].title,
        source: news[0].source,
        publishedAt: news[0].publishedAt
      });
    }
    
    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('❌ NEWS API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: 'Unable to retrieve news at this time',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const refreshNews = async (req: Request, res: Response) => {
  try {
    console.log('🔄 NEWS API: Refreshing news...');
    const news = await newsService.refreshNews();
    console.log(`🔄 NEWS API: Refreshed ${news.length} news items`);
    
    res.json({
      success: true,
      message: 'News refreshed successfully',
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('❌ NEWS REFRESH Error:', error);
    res.status(500).json({ 
      error: 'Failed to refresh news',
      message: 'Unable to update news at this time',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Debug endpoint to test news service directly
export const testNews = async (req: Request, res: Response) => {
  try {
    console.log('🧪 NEWS TEST: Testing news service directly...');
    
    // Import realNewsService directly for testing
    const { realNewsService } = require('../services/realNewsService');
    const testNews = await realNewsService.fetchAllMaritimoNews();
    
    console.log(`🧪 NEWS TEST: Got ${testNews.length} items from realNewsService`);
    
    res.json({
      success: true,
      message: 'Direct news service test',
      count: testNews.length,
      data: testNews.slice(0, 10), // Return first 10 for inspection
      totalFound: testNews.length
    });
  } catch (error) {
    console.error('❌ NEWS TEST Error:', error);
    res.status(500).json({ 
      error: 'Failed to test news service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 