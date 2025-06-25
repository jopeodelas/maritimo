import { Request, Response, NextFunction } from 'express';

interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate?: number;
  noCache?: boolean;
  mustRevalidate?: boolean;
}

const routeCacheConfig: Record<string, CacheConfig> = {
  // Static content - long cache
  '/images/*': { maxAge: 86400, staleWhileRevalidate: 172800 }, // 1 day, stale 2 days
  
  // API endpoints - shorter cache with stale-while-revalidate
  '/api/players': { maxAge: 20, staleWhileRevalidate: 40 },
  '/api/news': { maxAge: 30, staleWhileRevalidate: 60 },
  '/api/votes/user': { maxAge: 10, staleWhileRevalidate: 20 },
  '/api/votes/counts': { maxAge: 15, staleWhileRevalidate: 30 },
  '/api/player-ratings/*': { maxAge: 30, staleWhileRevalidate: 60 },
  '/api/transfer/*': { maxAge: 60, staleWhileRevalidate: 120 },
  '/api/maritodle*': { maxAge: 300, staleWhileRevalidate: 600 }, // 5 min, stale 10 min
  
  // Auth endpoints - no cache
  '/api/auth/*': { maxAge: 0, noCache: true },
  
  // Admin endpoints - no cache
  '/api/admin/*': { maxAge: 0, noCache: true, mustRevalidate: true }
};

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  
  // Find matching cache config
  let config: CacheConfig | null = null;
  
  for (const [pattern, cacheConfig] of Object.entries(routeCacheConfig)) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    if (regex.test(path)) {
      config = cacheConfig;
      break;
    }
  }
  
  if (config) {
    let cacheControl = '';
    
    if (config.noCache) {
      cacheControl = 'no-cache, no-store';
      if (config.mustRevalidate) {
        cacheControl += ', must-revalidate';
      }
    } else {
      // Build cache control header
      const parts = [`s-maxage=${config.maxAge}`];
      
      if (config.staleWhileRevalidate) {
        parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
      }
      
      cacheControl = parts.join(', ');
    }
    
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('X-Cache-Applied', 'middleware');
    
    // Log cache application for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 CACHE: ${req.method} ${path} -> ${cacheControl}`);
    }
  }
  
  next();
};

export default cacheMiddleware; 