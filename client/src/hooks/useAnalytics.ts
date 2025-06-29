import { useEffect, useRef, useCallback } from 'react';
import ReactGA from 'react-ga4';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { GA_CONFIG } from '../config/analytics';

// Gerar ID único para sessão com maior entropia
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 12);
  const performanceNow = performance.now().toString().replace('.', '');
  const userAgent = navigator.userAgent.length.toString();
  const screenRes = `${window.screen.width}${window.screen.height}`;
  
  return `${timestamp}-${randomPart}-${performanceNow}-${userAgent}${screenRes}`.substr(0, 50);
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
  const configEnabled = GA_CONFIG.isEnabled();
  const hasWindow = typeof window !== 'undefined';
  const hasGtag = hasWindow && 'gtag' in window;
  
  // Log para debug
  console.log('🔍 isGAEnabled check:', {
    configEnabled,
    hasWindow,
    hasGtag,
    measurementId: GA_CONFIG.measurementId,
    final: configEnabled && hasWindow
  });
  
  // Não verificar gtag porque pode não ter carregado ainda
  // O GA4 deve funcionar através do ReactGA mesmo sem gtag global
  return configEnabled && hasWindow;
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

  // Debug Google Analytics status
  useEffect(() => {
    const isEnabled = isGAEnabled();
    const clientId = GA_CONFIG.getClientId();
    const sessionId = getSessionId();
    
    console.log('🔍 useAnalytics GA4 Status:', {
      isEnabled,
      measurementId: GA_CONFIG.measurementId,
      clientId: clientId,
      sessionId: sessionId,
      userId: user?.id,
      windowGtag: typeof window !== 'undefined' ? 'gtag' in window : 'server',
      userAgent: navigator.userAgent.substr(0, 50),
      screenSize: `${window.screen.width}x${window.screen.height}`
    });
    
    // Enviar evento de debug para verificar se está a funcionar
    if (isEnabled) {
      console.log('📊 Sending debug info to GA4...');
    }
  }, [user, getSessionId]);

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
      const pageData = {
        page: window.location.pathname + window.location.search,
        title: document.title,
        client_id: GA_CONFIG.getClientId()
      };
      
      console.log('📊 Sending GA4 page view:', pageData);
      
      ReactGA.send({
        hitType: 'pageview',
        ...pageData
      });
      
      console.log('📊 GA4 page view sent successfully');
    } else {
      console.log('📊 GA4 disabled - not sending page view');
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
      console.log('📊 Sending GA4 event:', eventName, {
        category: eventCategory,
        label: eventData?.label,
        value: eventData?.value,
        clientId: GA_CONFIG.getClientId()
      });
      
      ReactGA.event({
        action: eventName,
        category: eventCategory || 'user_interaction',
        label: eventData?.label || undefined,
        value: eventData?.value || undefined
      });
      
      // Tentar também enviar como gtag direto para garantir client_id único
      try {
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', eventName, {
            event_category: eventCategory || 'user_interaction',
            event_label: eventData?.label || undefined,
            value: eventData?.value || undefined,
            client_id: GA_CONFIG.getClientId(),
            user_id: user?.id ? `user_${user.id}` : undefined,
            custom_parameter_1: 'maritimo_fans'
          });
          console.log('📊 GA4 gtag event sent successfully');
        } else {
          console.log('📊 GA4 gtag not available, using ReactGA only');
        }
      } catch (error) {
        console.warn('📊 GA4 gtag error (using ReactGA only):', error);
      }
    } else {
      console.log('📊 GA4 disabled - not sending event:', eventName);
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