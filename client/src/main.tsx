import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App.tsx';
import './index.css';
import './styles/mobile-responsive.css';
import { GA_CONFIG } from './config/analytics';

// Inicializar Google Analytics
if (GA_CONFIG.isEnabled()) {
  try {
    const options = GA_CONFIG.getOptions();
    ReactGA.initialize(GA_CONFIG.measurementId!, options);
    
    console.log('✅ Google Analytics 4 SUCCESSFULLY initialized:', {
      measurementId: GA_CONFIG.measurementId,
      clientId: GA_CONFIG.getClientId(),
      options: options
    });
    
    // Enviar page view inicial com informações únicas do utilizador
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname + window.location.search,
      title: document.title || 'CS Marítimo Fans',
      client_id: GA_CONFIG.getClientId()
    });
    
    // Enviar evento personalizado para garantir que o utilizador é único
    ReactGA.event({
      action: 'session_start',
      category: 'engagement',
      label: `unique_visitor_${GA_CONFIG.getClientId().substr(-8)}`,
      value: 1
    });
    
    console.log('📊 Initial tracking sent to GA4 with unique client ID');
  } catch (error) {
    console.error('❌ Error initializing Google Analytics:', error);
  }
} else {
  console.log('🔧 Google Analytics 4 NOT initialized - check configuration');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
