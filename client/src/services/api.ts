import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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