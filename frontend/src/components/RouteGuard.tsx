import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface RouteGuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  requireAuth = false, 
  redirectTo = requireAuth ? '/login' : '/dashboard'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // If route requires auth and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If route is for non-authenticated users (like login page) and user is authenticated,
  // redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Otherwise, render the protected component
  return <Outlet />;
};