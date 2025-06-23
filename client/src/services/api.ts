import axios from 'axios';

// EMERGENCY HOTFIX - Check for window override first
const emergencyURL = (window as any).VITE_API_URL_OVERRIDE;
const apiBaseUrl = emergencyURL || 'http://13.60.228.50/api';
console.log('🔥 API BASE URL:', apiBaseUrl);
console.log('🔥 Emergency override exists:', !!emergencyURL);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling common error cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Optionally redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;