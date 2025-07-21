import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        size="small"
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
          border: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(129, 140, 248, 0.2)'
            : '1px solid rgba(79, 70, 229, 0.2)',
          color: (theme) => theme.palette.mode === 'dark' ? '#818CF8' : '#4F46E5',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(129, 140, 248, 0.3)'
              : '0 4px 12px rgba(79, 70, 229, 0.3)',
            '&::before': {
              left: '100%',
            },
          },
        }}
      >
        <Box
          sx={{
            transition: 'transform 0.3s ease',
            transform: isDarkMode ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
        </Box>
      </IconButton>
    </Tooltip>
  );
};