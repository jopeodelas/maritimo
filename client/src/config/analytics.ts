// Gerar Client ID único para cada utilizador
const getClientId = (): string => {
  const storageKey = 'ga4_client_id';
  let clientId = localStorage.getItem(storageKey);
  
  if (!clientId) {
    // Gerar ID único baseado em múltiplos fatores
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substr(2, 10);
    const random2 = Math.random().toString(36).substr(2, 10);
    const userAgentHash = navigator.userAgent.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const screenFingerprint = window.screen.width * window.screen.height + window.screen.colorDepth;
    
    clientId = `${timestamp}.${random1}${random2}.${Math.abs(userAgentHash)}.${screenFingerprint}`;
    localStorage.setItem(storageKey, clientId);
    
    console.log('🆕 New GA4 Client ID created:', clientId);
  }
  
  return clientId;
};

// Configuração centralizada do Google Analytics
export const GA_CONFIG = {
  // ID do Google Analytics 4
  measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID,
  
  // Verificar se deve ser inicializado
  isEnabled: () => {
    const id = GA_CONFIG.measurementId;
    const isValid = id && 
                   id !== 'G-XXXXXXXXXX' && 
                   id.startsWith('G-') && 
                   id.length > 10;
    
    console.log('🔍 GA4 CONFIG CHECK:', {
      measurementId: id,
      isValid,
      env: import.meta.env.MODE,
      clientId: getClientId(),
      windowGtag: typeof window !== 'undefined' ? 'gtag' in window : 'server'
    });
    
    return isValid && typeof window !== 'undefined';
  },
  
  // Obter Client ID único
  getClientId,
  
  // Configurações do GA4 com client_id único
  getOptions: () => ({
    testMode: false,
    gtagOptions: {
      debug_mode: import.meta.env.DEV,
      send_page_view: false,
      anonymize_ip: false, // Desativado para permitir geolocalização precisa
      client_id: getClientId(), // ID único para cada utilizador
      cookie_expires: 60 * 60 * 24 * 30, // 30 days para melhor tracking
      allow_google_signals: true, // Para demographics e geolocalização
      allow_ad_personalization_signals: true, // Para dados demográficos
      transport_type: 'beacon', // Melhor entrega de dados
      custom_map: {
        custom_parameter: 'maritimo_fans'
      }
    }
  })
};

// Debug info
console.log('📊 GA4 CONFIG LOADED:', {
  measurementId: GA_CONFIG.measurementId,
  isEnabled: GA_CONFIG.isEnabled(),
  environment: import.meta.env.MODE,
  viteEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
}); 