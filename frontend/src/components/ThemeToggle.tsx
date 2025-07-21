import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          color: 'white',
          width: 48,
          height: 48,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1) rotate(180deg)',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            transition: 'transform 0.3s ease',
            transform: isDarkMode ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </Box>
      </IconButton>
    </Tooltip>
  );
};