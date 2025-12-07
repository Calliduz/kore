import axios from 'axios';
import { type ApiResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired)
    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
        // Prevent infinite loop if the refresh endpoint itself fails
        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/me')) {
            return Promise.reject(error);
        }

      originalRequest._retry = true;

      try {
        // Attempt to refresh token - NOTE: Use axios instance WITHOUT interceptors if possible to avoid loops, 
        // but here we just ensure we don't recurse on failure.
        await api.post('/auth/refresh');
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login or handle session expiry
        console.error('Session expired', refreshError);
        // Optional: Trigger logout action here or via event bus
        window.location.href = '/login'; // Simple redirect for now
        return Promise.reject(refreshError);
      }
    }

    // Standardize error format if possible
    const apiError = error.response?.data as ApiResponse;
    if (apiError?.error) {
        return Promise.reject(new Error(apiError.error.message));
    }

    return Promise.reject(error);
  }
);
