import axios from 'axios';
import { API_BASE_URL } from './endpoints';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor to attach Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pmb_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling and unauthorized redirection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('pmb_token');
        localStorage.removeItem('pmb_user');
        window.location.href = '/login';
      }
    }
    const errorMsg = error.response?.data?.message || error.message || 'Terjadi kesalahan pada server';
    return Promise.reject(new Error(errorMsg));
  }
);
