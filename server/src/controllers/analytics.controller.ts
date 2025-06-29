import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

// Utilitário para detectar device type
const getDeviceType = (userAgent: string): 'desktop' | 'mobile' | 'tablet' => {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

// Utilitário para detectar browser
const getBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Utilitário para detectar OS
const getOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

// Registrar evento de analytics
export const trackEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      eventName,
      eventCategory,
      eventData,
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      screenResolution
    } = req.body;

    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = (req as any).realIp || req.ip || req.connection.remoteAddress || '';
    const userId = (req as any).user?.id;
    
    console.log('📊 Analytics Event IP Info:', {
      realIp: (req as any).realIp,
      expressIp: req.ip,
      finalIp: ipAddress,
      eventName
    });

    const analyticsData = {
      eventName,
      eventCategory,
      eventData,
      userId,
      userAgent,
      ipAddress,
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      deviceType: getDeviceType(userAgent),
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      screenResolution,
      // TODO: Implementar geolocalização por IP se necessário
      country: undefined,
      city: undefined
    };

    await analyticsService.trackEvent(analyticsData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in trackEvent controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Iniciar ou atualizar sessão
export const trackSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = (req as any).realIp || req.ip || req.connection.remoteAddress || '';
    const userId = (req as any).user?.id;
    
    console.log('📊 Analytics Session IP Info:', {
      realIp: (req as any).realIp,
      expressIp: req.ip,
      finalIp: ipAddress,
      sessionId
    });

    const sessionData = {
      sessionId,
      userId,
      userAgent,
      ipAddress,
      deviceType: getDeviceType(userAgent),
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      // TODO: Implementar geolocalização
      country: undefined,
      city: undefined
    };

    await analyticsService.createOrUpdateSession(sessionData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in trackSession controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Registrar métricas de performance
export const trackPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      pageUrl,
      pageTitle,
      lcp,
      fid,
      cls,
      ttfb,
      fcp,
      loadTime,
      sessionId
    } = req.body;

    const userAgent = req.headers['user-agent'] || '';
    const userId = (req as any).user?.id;

    const performanceData = {
      pageUrl,
      pageTitle,
      lcp,
      fid,
      cls,
      ttfb,
      fcp,
      loadTime,
      sessionId,
      userId,
      deviceType: getDeviceType(userAgent)
    };

    await analyticsService.trackPagePerformance(performanceData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in trackPerformance controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter resumo de analytics (apenas para admins)
export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days as string, 10) || 30;

    const summary = await analyticsService.getAnalyticsSummary(daysNumber);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error in getAnalyticsSummary controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter eventos de um usuário específico (apenas para admins)
export const getUserEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const events = await analyticsService.getUserEvents(
      parseInt(userId, 10), 
      parseInt(limit as string, 10) || 100
    );

    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getUserEvents controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter estatísticas de performance das páginas (apenas para admins)
export const getPagePerformanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days as string, 10) || 30;

    const stats = await analyticsService.getPagePerformanceStats(daysNumber);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getPagePerformanceStats controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Marcar fim de sessão e verificar bounce
export const endSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;

    await analyticsService.checkAndMarkBounce(sessionId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in endSession controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 