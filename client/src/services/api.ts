import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

// Production configuration - use deployed server
const apiBaseUrl = 'https://api.maritimofans.pt/api';
console.log('🚀 Production API URL (Updated):', apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Request interceptor para adicionar headers dinâmicos
api.interceptors.request.use(
  (config) => {
    // Adicionar timestamp para evitar cache
    if (config.method === 'get') {
      const separator = config.url?.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}_t=${Date.now()}`;
    }
    
    // Adicionar headers CORS necessários
    config.headers.set('Origin', window.location.origin);
    config.headers.set('X-Requested-With', 'XMLHttpRequest');
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor com retry lógico
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
    
    console.error('❌ API Error:', {
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });

    // Retry lógico para erros de rede
    if (
      originalRequest &&
      !originalRequest._retry &&
      (
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout') ||
        !error.response // Erro de rede sem resposta
      )
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        console.log(`🔄 Retrying request (${originalRequest._retryCount}/3): ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
        
        // Delay exponencial antes do retry
        const delay = Math.pow(2, originalRequest._retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      }
    }

    // Log específico para erros CORS
    if (error.message?.includes('CORS') || error.message?.includes('Access-Control')) {
      console.error('🚫 CORS Error detected:', {
        origin: window.location.origin,
        targetURL: originalRequest?.url,
        fullError: error.message
      });
    }

    // Log para erro 401 (authentication)
    if (error.response && error.response.status === 401) {
      console.log('🔐 Authentication required for this request');
    }

    return Promise.reject(error);
  }
);

export default api;