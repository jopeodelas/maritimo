import { Pool } from 'pg';
import db from '../config/db';

interface AnalyticsEvent {
  eventName: string;
  eventCategory?: string;
  eventData?: any;
  userId?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  screenResolution?: string;
  country?: string;
  city?: string;
}

interface UserSession {
  sessionId: string;
  userId?: number;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
}

interface PagePerformance {
  pageUrl: string;
  pageTitle?: string;
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  loadTime?: number;
  sessionId?: string;
  userId?: number;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

class AnalyticsService {
  
  // Criar ou atualizar sessão do usuário
  async createOrUpdateSession(sessionData: UserSession): Promise<void> {
    try {
      const query = `
        INSERT INTO user_sessions (
          session_id, user_id, user_agent, ip_address, device_type, 
          browser, os, country, city, start_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (session_id) 
        DO UPDATE SET 
          end_time = NOW(),
          duration = EXTRACT(EPOCH FROM (NOW() - user_sessions.start_time))::INTEGER
      `;
      
      await db.query(query, [
        sessionData.sessionId,
        sessionData.userId || null,
        sessionData.userAgent,
        sessionData.ipAddress,
        sessionData.deviceType,
        sessionData.browser,
        sessionData.os,
        sessionData.country,
        sessionData.city
      ]);
    } catch (error) {
      console.error('Error creating/updating session:', error);
    }
  }

  // Incrementar contadores da sessão
  async incrementSessionCounters(sessionId: string, eventType: 'page_view' | 'event'): Promise<void> {
    try {
      const query = eventType === 'page_view' 
        ? 'UPDATE user_sessions SET page_views = page_views + 1 WHERE session_id = $1'
        : 'UPDATE user_sessions SET total_events = total_events + 1 WHERE session_id = $1';
      
      await db.query(query, [sessionId]);
    } catch (error) {
      console.error('Error incrementing session counters:', error);
    }
  }

  // Registrar evento de analytics
  async trackEvent(eventData: AnalyticsEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO analytics_events (
          event_name, event_category, event_data, user_id, user_agent, 
          ip_address, session_id, page_url, page_title, referrer,
          device_type, browser, os, screen_resolution, country, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;
      
      await db.query(query, [
        eventData.eventName,
        eventData.eventCategory || null,
        eventData.eventData ? JSON.stringify(eventData.eventData) : null,
        eventData.userId || null,
        eventData.userAgent,
        eventData.ipAddress,
        eventData.sessionId,
        eventData.pageUrl,
        eventData.pageTitle,
        eventData.referrer,
        eventData.deviceType,
        eventData.browser,
        eventData.os,
        eventData.screenResolution,
        eventData.country,
        eventData.city
      ]);

      // Incrementar contador de eventos da sessão
      if (eventData.sessionId) {
        await this.incrementSessionCounters(eventData.sessionId, 'event');
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Registrar métricas de performance
  async trackPagePerformance(performanceData: PagePerformance): Promise<void> {
    try {
      const query = `
        INSERT INTO page_performance (
          page_url, page_title, lcp, fid, cls, ttfb, fcp, load_time,
          session_id, user_id, device_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await db.query(query, [
        performanceData.pageUrl,
        performanceData.pageTitle,
        performanceData.lcp,
        performanceData.fid,
        performanceData.cls,
        performanceData.ttfb,
        performanceData.fcp,
        performanceData.loadTime,
        performanceData.sessionId,
        performanceData.userId || null,
        performanceData.deviceType
      ]);
    } catch (error) {
      console.error('Error tracking page performance:', error);
    }
  }

  // Marcar sessão como bounce se necessário
  async checkAndMarkBounce(sessionId: string): Promise<void> {
    try {
      const query = `
        UPDATE user_sessions 
        SET bounce = TRUE 
        WHERE session_id = $1 
        AND page_views <= 1 
        AND duration > 0 
        AND duration < 30
      `;
      
      await db.query(query, [sessionId]);
    } catch (error) {
      console.error('Error checking bounce:', error);
    }
  }

  // Obter estatísticas gerais
  async getAnalyticsSummary(days: number = 30): Promise<any> {
    try {
      const queries = {
        totalEvents: `
          SELECT COUNT(*) as total_events
          FROM analytics_events 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
        `,
        uniqueVisitors: `
          SELECT COUNT(DISTINCT session_id) as unique_visitors
          FROM user_sessions 
          WHERE start_time >= NOW() - INTERVAL '${days} days'
        `,
        totalPageViews: `
          SELECT SUM(page_views) as total_page_views
          FROM user_sessions 
          WHERE start_time >= NOW() - INTERVAL '${days} days'
        `,
        bounceRate: `
          SELECT 
            COUNT(CASE WHEN bounce = true THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100 as bounce_rate
          FROM user_sessions 
          WHERE start_time >= NOW() - INTERVAL '${days} days'
        `,
        topPages: `
          SELECT page_url, COUNT(*) as views
          FROM analytics_events 
          WHERE event_name = 'page_view' 
          AND created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY page_url 
          ORDER BY views DESC 
          LIMIT 10
        `,
        topEvents: `
          SELECT event_name, event_category, COUNT(*) as count
          FROM analytics_events 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
          AND event_name != 'page_view'
          GROUP BY event_name, event_category 
          ORDER BY count DESC 
          LIMIT 20
        `,
        deviceStats: `
          SELECT device_type, COUNT(*) as count
          FROM user_sessions 
          WHERE start_time >= NOW() - INTERVAL '${days} days'
          GROUP BY device_type
        `,
        dailyStats: `
          SELECT 
            DATE(created_at) as date,
            COUNT(DISTINCT session_id) as unique_visitors,
            COUNT(*) as total_events
          FROM analytics_events 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE(created_at) 
          ORDER BY date DESC
        `
      };

      const results: any = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const result = await db.query(query);
        results[key] = result.rows;
      }

      return results;
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }

  // Obter eventos de um usuário específico
  async getUserEvents(userId: number, limit: number = 100): Promise<any[]> {
    try {
      const query = `
        SELECT event_name, event_category, event_data, page_url, created_at
        FROM analytics_events 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      
      const result = await db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user events:', error);
      return [];
    }
  }

  // Obter performance médias das páginas
  async getPagePerformanceStats(days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          page_url,
          COUNT(*) as samples,
          AVG(lcp) as avg_lcp,
          AVG(fid) as avg_fid,
          AVG(cls) as avg_cls,
          AVG(load_time) as avg_load_time
        FROM page_performance 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY page_url 
        HAVING COUNT(*) >= 5
        ORDER BY avg_load_time DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting page performance stats:', error);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService(); 