import { Request, Response } from 'express';
import { newsService } from '../services/newsService';

// PERFORMANCE: Simple in-memory cache for serverless optimization
interface CacheEntry {
  data: any[];
  timestamp: number;
}

let newsCache: CacheEntry = { data: [], timestamp: 0 };
const CACHE_DURATION = 60_000; // 60 seconds

export const getNews = async (req: Request, res: Response) => {
  try {
    console.log('📰 NEWS API: Getting news...');
    const now = Date.now();
    
    // PERFORMANCE: Check cache first
    if (newsCache.data.length > 0 && (now - newsCache.timestamp) < CACHE_DURATION) {
      // Filter out fallback news from cache before serving
      const realNewsFromCache = newsCache.data.filter((item: any) => item.source !== "Sistema");
      
      console.log(`📰 PERFORMANCE: Serving from cache (${realNewsFromCache.length} real items, ${newsCache.data.length} total)`);
      
      // Set cache headers for CDN optimization
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
      res.setHeader('X-Cache-Status', 'HIT');
      
      res.json({
        success: true,
        count: realNewsFromCache.length,
        data: realNewsFromCache
      });
      return;
    }

    console.log('📰 PERFORMANCE: Cache miss - fetching fresh news...');
    let news = await newsService.getNews();
    console.log(`📰 NEWS API: Found ${news.length} news items in service cache`);
    
    // SERVERLESS FIX: If no news in service cache, fetch immediately
    if (news.length === 0) {
      console.log('📰 NEWS API: No news in service cache - fetching fresh news for serverless...');
      const { realNewsService } = require('../services/realNewsService');
      news = await realNewsService.fetchAllMaritimoNews();
      console.log(`📰 NEWS API: Fetched ${news.length} fresh news items`);
    }
    
    // Filter out fallback news before caching and serving
    const realNews = news.filter((item: any) => item.source !== "Sistema");
    
    // Update cache
    newsCache = { data: realNews, timestamp: now };
    console.log(`📰 PERFORMANCE: Cache updated with ${realNews.length} real items (${news.length} total from service)`);
    
    // Log first few items for debugging
    if (realNews.length > 0) {
      console.log('📰 NEWS API: First news item:', {
        title: realNews[0].title,
        source: realNews[0].source,
        publishedAt: realNews[0].publishedAt
      });
    }
    
    // Set cache headers for CDN optimization
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.setHeader('X-Cache-Status', 'MISS');
    
    res.json({
      success: true,
      count: realNews.length,
      data: realNews
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
    
    // Force refresh by clearing cache
    newsCache = { data: [], timestamp: 0 };
    
    const news = await newsService.refreshNews();
    console.log(`🔄 NEWS API: Refreshed ${news.length} news items`);
    
    // Filter out fallback news before caching and serving
    const realNews = news.filter((item: any) => item.source !== "Sistema");
    
    // Update cache with fresh data
    newsCache = { data: realNews, timestamp: Date.now() };
    
    res.json({
      success: true,
      message: 'News refreshed successfully',
      count: realNews.length,
      data: realNews
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