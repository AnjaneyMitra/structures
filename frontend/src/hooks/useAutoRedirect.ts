import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle automatic redirects based on authentication status
 * 
 * @param options Configuration options
 * @returns void
 */
export const useAutoRedirect = (options: {
  redirectAuthenticatedFrom?: string[];
  redirectUnauthenticatedFrom?: string[];
  authenticatedRedirectTo?: string;
  unauthenticatedRedirectTo?: string;
}) => {
  const { 
    redirectAuthenticatedFrom = ['/login', '/register', '/'],
    redirectUnauthenticatedFrom = [],
    authenticatedRedirectTo = '/dashboard',
    unauthenticatedRedirectTo = '/login'
  } = options;
  
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Don't redirect while still checking authentication status
    if (isLoading) return;
    
    // Handle redirects for authenticated users
    if (isAuthenticated && redirectAuthenticatedFrom.includes(location.pathname)) {
      navigate(authenticatedRedirectTo, { replace: true });
    }
    
    // Handle redirects for unauthenticated users
    if (!isAuthenticated && redirectUnauthenticatedFrom.includes(location.pathname)) {
      navigate(unauthenticatedRedirectTo, { replace: true });
    }
  }, [
    isAuthenticated, 
    isLoading, 
    location.pathname, 
    navigate, 
    redirectAuthenticatedFrom, 
    redirectUnauthenticatedFrom,
    authenticatedRedirectTo,
    unauthenticatedRedirectTo
  ]);
};