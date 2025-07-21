import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 60,
  fullScreen = false 
}) => {
  const containerSx = fullScreen 
    ? { 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
      }
    : {
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };

  return (
    <Box sx={containerSx}>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: '#6366F1',
              animationDuration: '550ms',
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress
              variant="determinate"
              value={25}
              size={size - 8}
              thickness={4}
              sx={{
                color: '#EC4899',
                transform: 'rotate(90deg)',
                opacity: 0.3,
              }}
            />
          </Box>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};