// SECURE API CLIENT - COMPLETELY ISOLATED FROM EXISTING SYSTEM
// This client is specifically designed to prevent Mixed Content errors

// HARDCODED HTTPS URL - NO VARIABLES, NO FUNCTIONS, NO LOGIC
const SECURE_API_BASE = 'https://structures-production.up.railway.app';

// Create a completely new fetch-based client (not axios)
class SecureApiClient {
  private baseURL: string;

  constructor() {
    // HARDCODE THE URL - NO DYNAMIC LOGIC
    this.baseURL = SECURE_API_BASE;
    console.log('🔒 SecureApiClient initialized with:', this.baseURL);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // FORCE HTTPS - ABSOLUTE GUARANTEE
    const url = this.baseURL + endpoint;
    
    // CRITICAL CHECK - THROW ERROR IF NOT HTTPS
    if (!url.startsWith('https://')) {
      console.error('❌ CRITICAL: Non-HTTPS URL detected:', url);
      throw new Error(`Only HTTPS URLs are allowed. Attempted: ${url}`);
    }

    // Get auth token
    const token = localStorage.getItem('token');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('🔒 SecureApiClient making request to:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Handle unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('🔒 SecureApiClient request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint: string): Promise<any> {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete(endpoint: string): Promise<any> {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }
}

// Export a singleton instance
const secureApiClient = new SecureApiClient();
export default secureApiClient;