// 🚨 EMERGENCY HOTFIX - Override API URL
(window as any).VITE_API_URL_OVERRIDE = 'http://13.60.228.50/api';
console.log('🔥 EMERGENCY: API URL overridden to:', (window as any).VITE_API_URL_OVERRIDE);

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
