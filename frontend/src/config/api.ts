// API Configuration - Always use HTTPS for production
export const API_BASE_URL = 'https://structures-production.up.railway.app';

// For development override (if needed)
export const getApiBaseUrl = () => {
  // Only use HTTP for localhost in development AND when explicitly on localhost
  if (typeof window !== 'undefined' && 
      window.location.hostname === 'localhost' && 
      window.location.protocol === 'http:' &&
      process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Using HTTP for localhost');
    return 'http://localhost:8000';
  }
  
  // Always use HTTPS for everything else (production, vercel, etc.)
  console.log('🔒 Production mode: Enforcing HTTPS');
  return 'https://structures-production.up.railway.app';
};

const currentUrl = getApiBaseUrl();
console.log('🌐 API_BASE_URL set to:', currentUrl);
console.log('🏠 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server');
console.log('🔗 Current protocol:', typeof window !== 'undefined' ? window.location.protocol : 'server');
console.log('⚙️ NODE_ENV:', process.env.NODE_ENV);

// Additional validation
if (typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    currentUrl.startsWith('http://')) {
  console.error('❌ CRITICAL ERROR: HTTP URL detected in production environment!');
  console.error('This will cause Mixed Content errors. Please check your configuration.');
}