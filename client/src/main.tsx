import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import { onCLS, onFID, onLCP } from 'web-vitals';
import App from './App.tsx';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './styles/mobile-responsive.css';
import { GA_CONFIG } from './config/analytics';

// Inicializar Google Analytics com logs detalhados
console.log('🚀 Starting GA4 initialization...');

const gaEnabled = GA_CONFIG.isEnabled();
const measurementId = GA_CONFIG.measurementId;
const clientId = GA_CONFIG.getClientId();

console.log('🔍 GA4 Pre-init check:', {
  enabled: gaEnabled,
  measurementId: measurementId,
  clientId: clientId,
  environment: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  windowAvailable: typeof window !== 'undefined'
});

if (gaEnabled) {
  try {
    const options = GA_CONFIG.getOptions();
    console.log('⚙️ GA4 Options:', options);
    
    ReactGA.initialize(measurementId!, options);
    console.log('✅ ReactGA.initialize completed');
    
    // Verificar se gtag foi carregado
    setTimeout(() => {
      const hasGtag = typeof window !== 'undefined' && 'gtag' in window;
      console.log('🔍 Post-init gtag check:', {
        hasGtag,
        gtagType: hasGtag ? typeof (window as any).gtag : 'undefined'
      });
    }, 1000);
    
    // Enviar page view inicial
    const initialPageData = {
      hitType: 'pageview' as const,
      page: window.location.pathname + window.location.search,
      title: document.title || 'CS Marítimo Fans',
      client_id: clientId
    };
    
    console.log('📊 Sending initial page view:', initialPageData);
    ReactGA.send(initialPageData);
    
    // Enviar evento de sessão
    const sessionEvent = {
      action: 'session_start',
      category: 'engagement',
      label: `unique_visitor_${clientId.substr(-8)}`,
      value: 1
    };
    
    console.log('📊 Sending session start event:', sessionEvent);
    ReactGA.event(sessionEvent);
    
    console.log('✅ GA4 initialization and initial tracking completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing Google Analytics:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} else {
  console.log('🔧 Google Analytics 4 NOT initialized');
  console.log('🔍 Reason:', {
    measurementId: measurementId || 'MISSING',
    isValidFormat: measurementId ? measurementId.startsWith('G-') : false,
    environment: import.meta.env.MODE
  });
}

// Web Vitals Monitoring
const reportWebVitals = (metric: any) => {
  if (gaEnabled) {
    ReactGA.event({
      action: metric.name,
      category: 'Web Vitals',
      label: metric.id,
      value: Math.round(metric.value),
      nonInteraction: true
    });
  } else {
    console.log(`[WebVitals] ${metric.name}:`, metric.value);
  }
};

onCLS(reportWebVitals);
onFID(reportWebVitals);
onLCP(reportWebVitals);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
