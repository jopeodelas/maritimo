import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 🚨 EMERGENCY HOTFIX - global axios defaults and override
const API_BASE = 'http://13.60.228.50';
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;
(window as any).VITE_API_URL_OVERRIDE = API_BASE + '/api';
console.log('🔥 GLOBAL axios baseURL:', axios.defaults.baseURL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
