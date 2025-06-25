import axios from 'axios';

// Production configuration - use deployed server
const apiBaseUrl = 'https://api.maritimofans.pt/api';
console.log('🚀 Production API URL (Updated):', apiBaseUrl);

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
    // Log the error for debugging but don't auto-redirect
    if (error.response && error.response.status === 401) {
      console.log('Authentication required for this request');
    }
    return Promise.reject(error);
  }
);

export default api;