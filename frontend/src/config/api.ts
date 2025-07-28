// HARDCODED API Configuration - FOOLPROOF HTTPS ENFORCEMENT
// This eliminates any possibility of HTTP URLs in production

// PRODUCTION URL - ALWAYS HTTPS
const PRODUCTION_API_URL = 'https://structures-production.up.railway.app';

// DEVELOPMENT URL - ONLY FOR LOCALHOST
const DEVELOPMENT_API_URL = 'http://localhost:8000';

// HARDCODED EXPORT - NO DYNAMIC LOGIC
export const API_BASE_URL = PRODUCTION_API_URL;

// Simple, foolproof function
export const getApiBaseUrl = () => {
  // ONLY use HTTP for localhost in development
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const isHttpProtocol = typeof window !== 'undefined' && window.location.protocol === 'http:';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.log('🔍 API URL Debug Info:');
  console.log('  - Window hostname:', typeof window !== 'undefined' ? window.location.hostname : 'undefined');
  console.log('  - Window protocol:', typeof window !== 'undefined' ? window.location.protocol : 'undefined');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - Is localhost:', isLocalhost);
  console.log('  - Is HTTP protocol:', isHttpProtocol);
  console.log('  - Is development:', isDevelopment);
  
  if (isLocalhost && isHttpProtocol && isDevelopment) {
    console.log('🔧 LOCALHOST DEVELOPMENT: Using HTTP');
    return DEVELOPMENT_API_URL;
  }
  
  // EVERYTHING ELSE USES HTTPS - NO EXCEPTIONS
  console.log('🔒 PRODUCTION: Using HTTPS');
  return PRODUCTION_API_URL;
};

// Log the configuration
const selectedUrl = getApiBaseUrl();
console.log('✅ Final API URL:', selectedUrl);

// CRITICAL VALIDATION - FAIL FAST IF HTTP IN PRODUCTION
if (typeof window !== 'undefined') {
  const isProduction = window.location.hostname !== 'localhost';
  const usingHttp = selectedUrl.startsWith('http://');
  
  if (isProduction && usingHttp) {
    console.error('❌ FATAL ERROR: HTTP URL in production will cause Mixed Content errors!');
    console.error('URL:', selectedUrl);
    console.error('Hostname:', window.location.hostname);
    throw new Error('HTTP URLs are not allowed in production');
  }
  
  console.log('✅ HTTPS validation passed');
}