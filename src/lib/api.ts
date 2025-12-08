import axios from 'axios';

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
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loop if the refresh endpoint itself fails
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/me')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await api.post('/auth/refresh');
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        console.error('Session expired', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Standardize error format from backend
    const responseData = error.response?.data;
    
    if (responseData) {
      // Handle validation errors array
      if (responseData.errors && Array.isArray(responseData.errors)) {
        const errorMessages = responseData.errors.map((e: { message: string }) => e.message).join(', ');
        return Promise.reject(new Error(errorMessages));
      }
      
      // Handle single error message
      if (responseData.message) {
        return Promise.reject(new Error(responseData.message));
      }
    }

    return Promise.reject(error);
  }
);

