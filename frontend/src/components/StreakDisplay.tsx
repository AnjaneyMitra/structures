import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { LocalFireDepartment, Whatshot } from '@mui/icons-material';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakActive: boolean;
  size?: 'small' | 'medium' | 'large';
  showLongest?: boolean;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  streakActive,
  size = 'medium',
  showLongest = true
}) => {
  const getFireIcon = () => {
    if (currentStreak === 0) {
      return <Whatshot sx={{ color: 'text.disabled', fontSize: getIconSize() }} />;
    }
    
    return (
      <LocalFireDepartment 
        sx={{ 
          color: getFireColor(),
          fontSize: getIconSize(),
          animation: streakActive && currentStreak > 0 ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
          }
        }} 
      />
    );
  };

  const getFireColor = () => {
    if (currentStreak === 0) return 'text.disabled';
    if (currentStreak >= 30) return '#FF4500'; // Red-orange for very high streaks
    if (currentStreak >= 14) return '#FF6B35'; // Orange for high streaks
    if (currentStreak >= 7) return '#FF8C42';  // Light orange for week streaks
    if (currentStreak >= 3) return '#FFA500';  // Orange for 3+ days
    return '#FFD700'; // Gold for starting streaks
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return '1.2rem';
      case 'large': return '2rem';
      default: return '1.5rem';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return '0.875rem';
      case 'large': return '1.25rem';
      default: return '1rem';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip 
        title={
          currentStreak > 0 
            ? `${currentStreak} day${currentStreak !== 1 ? 's' : ''} streak${streakActive ? ' (active)' : ' (broken)'}` 
            : 'No current streak'
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getFireIcon()}
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: getFontSize(),
              color: currentStreak > 0 ? 'text.primary' : 'text.disabled'
            }}
          >
            {currentStreak}
          </Typography>
        </Box>
      </Tooltip>
      
      {showLongest && longestStreak > 0 && (
        <Tooltip title={`Personal best: ${longestStreak} day${longestStreak !== 1 ? 's' : ''}`}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: size === 'small' ? '0.75rem' : '0.875rem'
            }}
          >
            (Best: {longestStreak})
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default StreakDisplay;