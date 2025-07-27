import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

// Get the secure API URL
const secureApiUrl = getApiBaseUrl();
console.log('ApiClient initialized with URL:', secureApiUrl);

// Create axios instance with secure base URL
const apiClient = axios.create({
  baseURL: secureApiUrl,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for auth and final HTTPS check
apiClient.interceptors.request.use(
  (config) => {
    // Final safety check - force HTTPS if not on localhost
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      if (config.baseURL?.startsWith('http:')) {
        config.baseURL = config.baseURL.replace('http:', 'https:');
        console.warn('Forced HTTP to HTTPS for baseURL:', config.baseURL);
      }
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Making request to:', (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;