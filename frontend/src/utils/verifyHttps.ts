// Simple verification that our API client uses HTTPS
import apiClient from './apiClient';

export const verifyHttpsConfiguration = () => {
  const baseURL = apiClient.defaults.baseURL;
  console.log('=== HTTPS Verification ===');
  console.log('API Client Base URL:', baseURL);
  console.log('Uses HTTPS:', baseURL?.startsWith('https:'));
  console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
  console.log('Current protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !baseURL?.startsWith('https:')) {
    console.error('❌ CRITICAL: API client is not using HTTPS in production!');
    return false;
  }
  
  console.log('✅ API client HTTPS configuration verified');
  return true;
};

// Auto-verify in browser
if (typeof window !== 'undefined') {
  verifyHttpsConfiguration();
}