import { useEffect, useRef, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Gerar ID único para sessão
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Obter informações do dispositivo
const getDeviceInfo = () => {
  const screen = window.screen;
  return {
    screenResolution: `${screen.width}x${screen.height}`,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    pageUrl: window.location.href,
    pageTitle: document.title
  };
};

// Detectar performance da página
const getPagePerformance = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime;
  const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime;
  
  return {
    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
    ttfb: navigation?.responseStart - navigation?.requestStart,
    fcp: fcp,
    lcp: lcp,
    // Note: CLS e FID requerem APIs mais específicas que serão capturadas pelo Vercel Speed Insights
  };
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const eventsCountRef = useRef<number>(0);

  // Obter ou criar session ID
  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }
    return sessionIdRef.current;
  }, []);

  // Enviar evento para PostgreSQL
  const sendToPostgreSQL = useCallback(async (eventData: any) => {
    try {
      await api.post('/analytics/track/event', {
        ...eventData,
        sessionId: getSessionId(),
        ...getDeviceInfo()
      });
    } catch (error) {
      console.warn('Failed to send analytics to PostgreSQL:', error);
    }
  }, [getSessionId]);

  // Enviar sessão para PostgreSQL
  const sendSessionToPostgreSQL = useCallback(async () => {
    try {
      await api.post('/analytics/track/session', {
        sessionId: getSessionId(),
        ...getDeviceInfo()
      });
    } catch (error) {
      console.warn('Failed to send session to PostgreSQL:', error);
    }
  }, [getSessionId]);

  // Enviar performance para PostgreSQL
  const sendPerformanceToPostgreSQL = useCallback(async () => {
    try {
      const performance = getPagePerformance();
      await api.post('/analytics/track/performance', {
        sessionId: getSessionId(),
        ...getDeviceInfo(),
        ...performance
      });
    } catch (error) {
      console.warn('Failed to send performance to PostgreSQL:', error);
    }
  }, [getSessionId]);

  // Inicializar sessão
  useEffect(() => {
    const sessionId = getSessionId();
    
    // Enviar sessão para PostgreSQL
    sendSessionToPostgreSQL();
    
    // Rastrear page view
    trackPageView();
    
    // Enviar performance após carregamento completo
    if (document.readyState === 'complete') {
      sendPerformanceToPostgreSQL();
    } else {
      window.addEventListener('load', sendPerformanceToPostgreSQL);
    }

    // Cleanup
    return () => {
      window.removeEventListener('load', sendPerformanceToPostgreSQL);
    };
  }, []); // Só executa uma vez por sessão

  // Rastrear page view
  const trackPageView = useCallback((customData?: any) => {
    const eventData = {
      eventName: 'page_view',
      eventCategory: 'navigation',
      eventData: {
        ...customData,
        timestamp: Date.now(),
        sessionDuration: Date.now() - pageLoadTimeRef.current
      }
    };

    // Enviar para Vercel
    track('page_view', eventData.eventData);
    
    // Enviar para PostgreSQL
    sendToPostgreSQL(eventData);
    
    eventsCountRef.current++;
  }, [sendToPostgreSQL]);

  // Rastrear evento personalizado
  const trackEvent = useCallback((eventName: string, eventCategory?: string, eventData?: any) => {
    const fullEventData = {
      eventName,
      eventCategory: eventCategory || 'user_interaction',
      eventData: {
        ...eventData,
        timestamp: Date.now(),
        sessionDuration: Date.now() - pageLoadTimeRef.current,
        eventCount: eventsCountRef.current
      }
    };

    // Enviar para Vercel
    track(eventName, fullEventData.eventData);
    
    // Enviar para PostgreSQL
    sendToPostgreSQL(fullEventData);
    
    eventsCountRef.current++;
  }, [sendToPostgreSQL]);

  // Eventos específicos do CS Marítimo
  const trackVote = useCallback((playerId: number, rating: number, matchId?: number) => {
    trackEvent('player_vote', 'voting', {
      playerId,
      rating,
      matchId,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackPollVote = useCallback((pollId: number, optionId: number) => {
    trackEvent('poll_vote', 'polls', {
      pollId,
      optionId,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackMaritodlePlay = useCallback((success: boolean, attempts: number, playerId?: number) => {
    trackEvent('maritodle_play', 'games', {
      success,
      attempts,
      playerId,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackPlayerView = useCallback((playerId: number, source: string) => {
    trackEvent('player_view', 'content', {
      playerId,
      source, // 'squad', 'ratings', 'search', etc.
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackNewsView = useCallback((newsId: string, title: string) => {
    trackEvent('news_view', 'content', {
      newsId,
      title,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackTransferView = useCallback ((rumorId: number) => {
    trackEvent('transfer_view', 'content', {
      rumorId,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackSearch = useCallback((query: string, results: number) => {
    trackEvent('search', 'interaction', {
      query,
      results,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackAuth = useCallback((action: 'login' | 'logout' | 'register') => {
    trackEvent('auth', 'user', {
      action,
      userId: user?.id
    });
  }, [trackEvent, user]);

  const trackError = useCallback((error: string, context: string) => {
    trackEvent('error', 'system', {
      error,
      context,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackButtonClick = useCallback((buttonName: string, context: string) => {
    trackEvent('button_click', 'interaction', {
      buttonName,
      context,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackSectionView = useCallback((sectionName: string, timeSpent?: number) => {
    trackEvent('section_view', 'content', {
      sectionName,
      timeSpent,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  const trackFormSubmit = useCallback((formName: string, success: boolean, errors?: string[]) => {
    trackEvent('form_submit', 'interaction', {
      formName,
      success,
      errors,
      userAuthenticated: !!user
    });
  }, [trackEvent, user]);

  // Finalizar sessão
  const endSession = useCallback(async () => {
    try {
      await api.post('/analytics/track/end-session', {
        sessionId: getSessionId()
      });
    } catch (error) {
      console.warn('Failed to end session:', error);
    }
  }, [getSessionId]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return {
    // Eventos gerais
    trackPageView,
    trackEvent,
    
    // Eventos específicos do CS Marítimo
    trackVote,
    trackPollVote,
    trackMaritodlePlay,
    trackPlayerView,
    trackNewsView,
    trackTransferView,
    trackSearch,
    trackAuth,
    trackError,
    trackButtonClick,
    trackSectionView,
    trackFormSubmit,
    
    // Informações da sessão
    sessionId: getSessionId(),
    eventsCount: eventsCountRef.current
  };
}; 