/**
 * Axios API client configuration
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': import.meta.env.VITE_USER_ID || 'dev-admin-123',
  },
  timeout: 30000, // 30s timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login (when implemented)
      console.error('Unauthorized - implement auth redirect');
    }

    if (error.response?.status === 500) {
      // Server error - show toast (when implemented)
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
export { api }; // Named export for analyticsApi

