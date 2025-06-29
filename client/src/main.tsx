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
    ReactGA.initialize(GA_CONFIG.measurementId!, GA_CONFIG.options);
    
    console.log('✅ Google Analytics 4 SUCCESSFULLY initialized with ID:', GA_CONFIG.measurementId);
    
    // Enviar page view inicial
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname + window.location.search,
      title: document.title || 'CS Marítimo Fans'
    });
    
    console.log('📊 Initial page view sent to GA4');
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
