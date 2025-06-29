import { useEffect, useRef, useCallback } from 'react';
import ReactGA from 'react-ga4';
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
    // Note: CLS e FID requerem APIs mais específicas que podem ser capturadas separadamente
  };
};

// Verificar se Google Analytics está ativo
const isGAEnabled = () => {
  return import.meta.env.PROD && typeof window !== 'undefined' && 'gtag' in window;
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
    // Enviar sessão para PostgreSQL
    sendSessionToPostgreSQL();
    
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
  }, [sendSessionToPostgreSQL, sendPerformanceToPostgreSQL]);

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

    // Enviar para Google Analytics
    if (isGAEnabled()) {
      ReactGA.send({
        hitType: 'pageview',
        page: window.location.pathname + window.location.search,
        title: document.title
      });
    }
    
    // Enviar para PostgreSQL
    sendToPostgreSQL(eventData);
    
    eventsCountRef.current++;
  }, [sendToPostgreSQL, user, getSessionId]);

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

    // Enviar para Google Analytics
    if (isGAEnabled()) {
      ReactGA.event({
        action: eventName,
        category: eventCategory || 'user_interaction',
        label: eventData?.label || undefined,
        value: eventData?.value || undefined
      });
    }
    
    // Enviar para PostgreSQL
    sendToPostgreSQL(fullEventData);
    
    eventsCountRef.current++;
  }, [sendToPostgreSQL, user, getSessionId]);

  // Rastrear page view automático quando o hook é inicializado
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Eventos específicos do CS Marítimo
  const trackVote = useCallback((playerId: number, rating: number, matchId?: number) => {
    trackEvent('player_vote', 'voting', {
      playerId,
      rating,
      matchId,
      userAuthenticated: !!user,
      label: `Player ${playerId}`,
      value: rating
    });
  }, [trackEvent, user]);

  const trackPollVote = useCallback((pollId: number, optionId: number) => {
    trackEvent('poll_vote', 'polls', {
      pollId,
      optionId,
      userAuthenticated: !!user,
      label: `Poll ${pollId}`,
      value: optionId
    });
  }, [trackEvent, user]);

  const trackMaritodlePlay = useCallback((success: boolean, attempts: number, playerId?: number) => {
    trackEvent('maritodle_play', 'games', {
      success,
      attempts,
      playerId,
      userAuthenticated: !!user,
      label: success ? 'Success' : 'Failed',
      value: attempts
    });
  }, [trackEvent, user]);

  const trackPlayerView = useCallback((playerId: number, source: string) => {
    trackEvent('player_view', 'content', {
      playerId,
      source, // 'squad', 'ratings', 'search', etc.
      userAuthenticated: !!user,
      label: `Player ${playerId} from ${source}`
    });
  }, [trackEvent, user]);

  const trackNewsView = useCallback((newsId: string, title: string) => {
    trackEvent('news_view', 'content', {
      newsId,
      title,
      userAuthenticated: !!user,
      label: title
    });
  }, [trackEvent, user]);

  const trackTransferView = useCallback ((rumorId: number) => {
    trackEvent('transfer_view', 'content', {
      rumorId,
      userAuthenticated: !!user,
      label: `Transfer Rumor ${rumorId}`
    });
  }, [trackEvent, user]);

  const trackSearch = useCallback((query: string, results: number) => {
    trackEvent('search', 'interaction', {
      query,
      results,
      userAuthenticated: !!user,
      label: query,
      value: results
    });
  }, [trackEvent, user]);

  const trackAuth = useCallback((action: 'login' | 'logout' | 'register') => {
    trackEvent('auth', 'user', {
      action,
      userId: user?.id,
      label: action
    });
  }, [trackEvent, user]);

  const trackError = useCallback((error: string, context: string) => {
    trackEvent('error', 'system', {
      error,
      context,
      userAuthenticated: !!user,
      label: `${context}: ${error}`
    });
  }, [trackEvent, user]);

  const trackButtonClick = useCallback((buttonName: string, context: string) => {
    trackEvent('button_click', 'interaction', {
      buttonName,
      context,
      userAuthenticated: !!user,
      label: `${context}: ${buttonName}`
    });
  }, [trackEvent, user]);

  const trackSectionView = useCallback((sectionName: string, timeSpent?: number) => {
    trackEvent('section_view', 'content', {
      sectionName,
      timeSpent,
      userAuthenticated: !!user,
      label: sectionName,
      value: timeSpent
    });
  }, [trackEvent, user]);

  const trackFormSubmit = useCallback((formName: string, success: boolean, errors?: string[]) => {
    trackEvent('form_submit', 'interaction', {
      formName,
      success,
      errors,
      userAuthenticated: !!user,
      label: `${formName}: ${success ? 'Success' : 'Failed'}`,
      value: success ? 1 : 0
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