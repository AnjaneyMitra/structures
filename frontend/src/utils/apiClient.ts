import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

// Get the secure API URL
const secureApiUrl = getApiBaseUrl();
console.log('ApiClient initialized with URL:', secureApiUrl);

// Force HTTPS for production - additional safety check
const finalApiUrl = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  secureApiUrl.startsWith('http:') 
    ? secureApiUrl.replace('http:', 'https:')
    : secureApiUrl;

if (finalApiUrl !== secureApiUrl) {
  console.warn('Forced API URL from HTTP to HTTPS:', finalApiUrl);
}

// Create axios instance with secure base URL
const apiClient = axios.create({
  baseURL: finalApiUrl,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for auth and final HTTPS check
apiClient.interceptors.request.use(
  (config) => {
    // Final safety check - force HTTPS if not on localhost
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost';
      const isHttpProtocol = window.location.protocol === 'http:';
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Only allow HTTP for localhost with http protocol in development
      const allowHttp = isLocalhost && isHttpProtocol && isDevelopment;
      
      if (!allowHttp) {
        // Force HTTPS for baseURL
        if (config.baseURL?.startsWith('http:')) {
          config.baseURL = config.baseURL.replace('http:', 'https:');
          console.warn('🔒 Forced HTTP to HTTPS for baseURL:', config.baseURL);
        }
        
        // Force HTTPS for individual URL
        if (config.url?.startsWith('http:')) {
          config.url = config.url.replace('http:', 'https:');
          console.warn('🔒 Forced HTTP to HTTPS for URL:', config.url);
        }
        
        // Additional check for full URL construction
        const fullUrl = (config.baseURL || '') + (config.url || '');
        if (fullUrl.includes('http://') && !fullUrl.includes('localhost')) {
          console.error('❌ DETECTED HTTP REQUEST IN PRODUCTION:', fullUrl);
          // Force the baseURL to HTTPS if we detect any HTTP
          config.baseURL = 'https://structures-production.up.railway.app';
          console.warn('🔒 Emergency HTTPS enforcement applied');
        }
      }
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const finalUrl = (config.baseURL || '') + (config.url || '');
    console.log('🌐 Making request to:', finalUrl);
    
    // Final validation
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        finalUrl.startsWith('http://')) {
      console.error('❌ CRITICAL: HTTP request detected in production!', finalUrl);
      throw new Error('HTTP requests are not allowed in production. Please use HTTPS.');
    }
    
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