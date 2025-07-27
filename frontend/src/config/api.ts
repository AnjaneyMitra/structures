// API Configuration - Simple and foolproof HTTPS enforcement
export const API_BASE_URL = 'https://structures-production.up.railway.app';

// For development override (if needed)
export const getApiBaseUrl = () => {
  // Only use HTTP for localhost in development
  if (typeof window !== 'undefined' && 
      window.location.hostname === 'localhost' && 
      process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // Always use HTTPS for everything else
  return 'https://structures-production.up.railway.app';
};

console.log('API_BASE_URL set to:', API_BASE_URL);