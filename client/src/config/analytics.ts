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
      windowGtag: typeof window !== 'undefined' ? 'gtag' in window : 'server'
    });
    
    return isValid && typeof window !== 'undefined';
  },
  
  // Configurações do GA4
  options: {
    testMode: false,
    gtagOptions: {
      debug_mode: import.meta.env.DEV,
      send_page_view: false,
      anonymize_ip: true, // GDPR compliance
      cookie_expires: 60 * 60 * 24 * 7, // 7 days
      custom_map: {
        custom_parameter: 'maritimo_fans'
      }
    }
  }
};

// Debug info
console.log('📊 GA4 CONFIG LOADED:', {
  measurementId: GA_CONFIG.measurementId,
  isEnabled: GA_CONFIG.isEnabled(),
  environment: import.meta.env.MODE,
  viteEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
}); 