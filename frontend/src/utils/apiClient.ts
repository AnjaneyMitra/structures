import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Ensure HTTPS in production
const getSecureApiUrl = () => {
  let apiUrl = API_BASE_URL;
  
  // If we're on HTTPS and the API URL is HTTP, force HTTPS
  if (typeof window !== 'undefined' && 
      window.location.protocol === 'https:' && 
      apiUrl.startsWith('http:')) {
    apiUrl = apiUrl.replace('http:', 'https:');
  }
  
  console.log('Using API URL:', apiUrl);
  return apiUrl;
};

// Create axios instance with secure base URL
const apiClient = axios.create({
  baseURL: getSecureApiUrl(),
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to ensure HTTPS
apiClient.interceptors.request.use(
  (config) => {
    // Double-check that we're using HTTPS in production
    if (typeof window !== 'undefined' && 
        window.location.protocol === 'https:' && 
        config.baseURL?.startsWith('http:')) {
      config.baseURL = config.baseURL.replace('http:', 'https:');
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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