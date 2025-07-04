// Simple in-memory cache to reduce database calls
// Use this for frequently accessed data like player rankings, active polls, etc.

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new SimpleCache();

// Helper function to wrap database queries with caching
export function withCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cache.get<T>(key);
      if (cached !== null) {
        console.log(`📦 Cache hit for key: ${key}`);
        return resolve(cached);
      }

      // Not in cache, execute query
      console.log(`🔄 Cache miss for key: ${key}, executing query...`);
      const result = await queryFn();
      
      // Store in cache
      cache.set(key, result, ttlSeconds);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// Cache invalidation helpers
export const cacheKeys = {
  PLAYER_RANKINGS: 'player_rankings',
  DISCUSSION_FEED: 'discussion_feed',
  TRANSFER_RUMORS: 'transfer_rumors',
  ACTIVE_POLLS: 'active_polls',
  MARITODLE_DAILY: (date: string) => `maritodle_daily_${date}`,
  USER_VOTES: (userId: number) => `user_votes_${userId}`,
  PLAYER_RATINGS: (matchId: number) => `player_ratings_${matchId}`,
  MATCH_VOTING: 'active_match_voting',
  FOOTBALL_CACHE: 'football_latest_matches'
};

// Auto-cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
  console.log(`🧹 Cache cleanup completed. Current size: ${cache.getStats().size}`);
}, 5 * 60 * 1000);

export default cache; 