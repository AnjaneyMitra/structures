// GLOBAL HTTPS ENFORCER - ULTIMATE SAFETY NET
// This will intercept ALL HTTP requests and force them to HTTPS

// HARDCODED PRODUCTION URL
const PRODUCTION_HTTPS_URL = 'https://structures-production.up.railway.app';

// Override the global fetch function
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string;
  
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = String(input);
  }
  
  // Force HTTPS for production URLs
  if (url.includes('structures-production.up.railway.app') && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
    console.warn('🔒 GLOBAL ENFORCER: Forced HTTP to HTTPS:', url);
    
    if (typeof input === 'string') {
      input = url;
    } else if (input instanceof URL) {
      input = new URL(url);
    } else if (input instanceof Request) {
      input = new Request(url, input);
    }
  }
  
  return originalFetch.call(this, input, init);
};

// Override axios defaults if axios is available
if (typeof window !== 'undefined' && (window as any).axios) {
  const axios = (window as any).axios;
  
  // Add a global request interceptor to axios
  axios.interceptors.request.use((config: any) => {
    if (config.url && config.url.includes('structures-production.up.railway.app')) {
      if (config.url.startsWith('http://')) {
        config.url = config.url.replace('http://', 'https://');
        console.warn('🔒 GLOBAL AXIOS ENFORCER: Forced HTTP to HTTPS:', config.url);
      }
      
      if (config.baseURL && config.baseURL.startsWith('http://')) {
        config.baseURL = config.baseURL.replace('http://', 'https://');
        console.warn('🔒 GLOBAL AXIOS ENFORCER: Forced baseURL HTTP to HTTPS:', config.baseURL);
      }
    }
    
    return config;
  });
}

// Log that the global enforcer is active
console.log('🛡️ GLOBAL HTTPS ENFORCER: Active and monitoring all requests');

export {};