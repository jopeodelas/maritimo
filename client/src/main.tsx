import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App.tsx';
import './index.css';
import './styles/mobile-responsive.css';

// Configurar Google Analytics 4
// NOTA: Substitua 'G-XXXXXXXXXX' pelo seu real GA4 Measurement ID
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Inicializar Google Analytics apenas em produção
if (import.meta.env.PROD && GA4_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
  ReactGA.initialize(GA4_MEASUREMENT_ID, {
    testMode: false, // Set to true for testing
    gtagOptions: {
      debug_mode: false,
      send_page_view: false // Vamos controlar manualmente os page views
    }
  });
  
  console.log('✅ Google Analytics 4 initialized with ID:', GA4_MEASUREMENT_ID);
} else {
  console.log('🔧 Google Analytics 4 disabled (development mode or missing ID)');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
