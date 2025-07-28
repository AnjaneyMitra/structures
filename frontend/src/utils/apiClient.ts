import axios from 'axios';

// HARDCODED HTTPS URL - FOOLPROOF SOLUTION
const PRODUCTION_API_URL = 'https://structures-production.up.railway.app';
const LOCALHOST_API_URL = 'http://localhost:8000';

// Determine the correct API URL with absolute certainty
const getSecureApiUrl = () => {
  console.log('🔍 ApiClient Debug Info:');
  console.log('  - Window hostname:', typeof window !== 'undefined' ? window.location.hostname : 'undefined');
  console.log('  - Window protocol:', typeof window !== 'undefined' ? window.location.protocol : 'undefined');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  
  // Only use localhost HTTP in development
  if (typeof window !== 'undefined' && 
      window.location.hostname === 'localhost' && 
      window.location.protocol === 'http:' &&
      process.env.NODE_ENV === 'development') {
    console.log('🔧 Using localhost for development');
    return LOCALHOST_API_URL;
  }
  
  // ALWAYS use HTTPS for production - no exceptions
  console.log('🔒 Using HTTPS for production');
  return PRODUCTION_API_URL;
};

const finalApiUrl = getSecureApiUrl();
console.log('✅ ApiClient initialized with URL:', finalApiUrl);

// Validate that we're using HTTPS in production
if (typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    !finalApiUrl.startsWith('https://')) {
  console.error('❌ CRITICAL ERROR: Non-HTTPS URL detected in production!');
  throw new Error('Production must use HTTPS');
}

// Create axios instance with secure base URL
const apiClient = axios.create({
  baseURL: finalApiUrl,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for auth and ABSOLUTE HTTPS enforcement
apiClient.interceptors.request.use(
  (config) => {
    // ABSOLUTE HTTPS ENFORCEMENT - NO EXCEPTIONS
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log('🌐 Request Debug Info:');
    console.log('  - Original baseURL:', config.baseURL);
    console.log('  - Original URL:', config.url);
    console.log('  - Is localhost:', isLocalhost);
    console.log('  - Is development:', isDevelopment);
    
    // Only allow HTTP for localhost in development
    if (!isLocalhost || !isDevelopment) {
      // FORCE HTTPS - HARDCODED PRODUCTION URL
      config.baseURL = PRODUCTION_API_URL;
      
      // Double-check individual URL
      if (config.url?.startsWith('http:')) {
        config.url = config.url.replace('http:', 'https:');
        console.warn('🔒 Forced URL to HTTPS:', config.url);
      }
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const finalUrl = (config.baseURL || '') + (config.url || '');
    console.log('🌐 Making request to:', finalUrl);
    
    // FINAL VALIDATION - THROW ERROR IF HTTP DETECTED IN PRODUCTION
    if (!isLocalhost && finalUrl.startsWith('http://')) {
      console.error('❌ CRITICAL: HTTP request blocked in production!', finalUrl);
      throw new Error(`HTTP requests are not allowed in production. Attempted: ${finalUrl}`);
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