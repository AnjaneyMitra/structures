// API Configuration
const API_BASE_URL = (() => {
  // Check if we're in development (localhost)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // Check for explicit environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to production HTTPS URL
  return 'https://structures-production.up.railway.app';
})();

console.log('API_BASE_URL:', API_BASE_URL); // Debug log

export { API_BASE_URL };