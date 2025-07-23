/**
 * Utility functions for authentication
 */

/**
 * Validates a JWT token format and checks if it's expired
 * @param token JWT token to validate
 * @returns boolean indicating if token is valid
 */
export const validateToken = (token: string): boolean => {
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('Token is expired');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Token validation failed:', e);
    return false;
  }
};

/**
 * Checks if the user is authenticated based on local storage token
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token && validateToken(token);
};

/**
 * Gets the current user's username from local storage
 * @returns string username or null if not found
 */
export const getCurrentUsername = (): string | null => {
  return localStorage.getItem('username');
};