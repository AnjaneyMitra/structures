// SECURE API CLIENT - AXIOS-BASED WITH ABSOLUTE HTTPS ENFORCEMENT
// This client uses axios but with hardcoded HTTPS URLs to prevent Mixed Content errors

import axios, { AxiosInstance } from 'axios';

// HARDCODED HTTPS URL - NO VARIABLES, NO FUNCTIONS, NO LOGIC
const SECURE_API_BASE = 'https://structures-production.up.railway.app';

class SecureApiClient {
  private client: AxiosInstance;

  constructor() {
    console.log('🔒 SecureApiClient initialized with:', SECURE_API_BASE);
    
    // Create axios instance with HARDCODED HTTPS URL
    this.client = axios.create({
      baseURL: SECURE_API_BASE,
      timeout: 10000,
    });

    // Add request interceptor with ABSOLUTE HTTPS enforcement
    this.client.interceptors.request.use(
      (config) => {
        // FORCE HTTPS - NO EXCEPTIONS
        config.baseURL = SECURE_API_BASE;
        
        // CRITICAL CHECK - THROW ERROR IF NOT HTTPS
        const fullUrl = (config.baseURL || '') + (config.url || '');
        if (!fullUrl.startsWith('https://')) {
          console.error('❌ CRITICAL: Non-HTTPS URL detected:', fullUrl);
          throw new Error(`Only HTTPS URLs are allowed. Attempted: ${fullUrl}`);
        }

        // Add auth token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log('🔒 SecureApiClient making request to:', fullUrl);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // GET request
  async get(endpoint: string): Promise<any> {
    const response = await this.client.get(endpoint);
    return response.data;
  }

  // POST request
  async post(endpoint: string, data?: any): Promise<any> {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  // PUT request
  async put(endpoint: string, data?: any): Promise<any> {
    const response = await this.client.put(endpoint, data);
    return response.data;
  }

  // DELETE request
  async delete(endpoint: string): Promise<any> {
    const response = await this.client.delete(endpoint);
    return response.data;
  }
}

// Export a singleton instance
const secureApiClient = new SecureApiClient();
export default secureApiClient;