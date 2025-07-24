import React from 'react';
import { Box, Typography, Tooltip, LinearProgress } from '@mui/material';
import { Achievement } from '../types/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showProgress = false,
  onClick
}) => {
  const sizeConfig = {
    small: { iconSize: 24, badgeSize: 48, fontSize: '0.75rem' },
    medium: { iconSize: 32, badgeSize: 64, fontSize: '0.875rem' },
    large: { iconSize: 48, badgeSize: 96, fontSize: '1rem' }
  };

  const config = sizeConfig[size];
  const progress = achievement.progress || 0;
  const total = achievement.total || 1;
  const progressPercentage = Math.min((progress / total) * 100, 100);

  const badgeContent = (
    <Box
      onClick={onClick}
      sx={{
        width: config.badgeSize,
        height: config.badgeSize,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        background: achievement.earned
          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
          : 'var(--color-muted)',
        border: achievement.earned
          ? '3px solid #FFD700'
          : '2px solid var(--color-border)',
        opacity: achievement.earned ? 1 : 0.6,
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
          boxShadow: achievement.earned
            ? '0 8px 25px rgba(255, 215, 0, 0.4)'
            : '0 4px 15px rgba(0, 0, 0, 0.2)'
        } : {},
        ...(achievement.earned && {
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
            zIndex: -1,
            animation: achievement.earned ? 'shimmer 2s ease-in-out infinite' : 'none'
          }
        })
      }}
    >
      <Typography
        sx={{
          fontSize: config.iconSize,
          lineHeight: 1,
          mb: size === 'large' ? 0.5 : 0
        }}
      >
        {achievement.icon}
      </Typography>
      
      {size === 'large' && (
        <Typography
          variant="caption"
          sx={{
            fontSize: config.fontSize,
            fontWeight: 600,
            color: achievement.earned ? '#8B4513' : 'var(--color-muted-foreground)',
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          {achievement.name}
        </Typography>
      )}

      {showProgress && !achievement.earned && progress > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            bgcolor: 'var(--color-background)',
            borderRadius: 1,
            p: 0.5
          }}
        >
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: 'var(--color-muted)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'var(--color-primary)'
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.625rem',
              color: 'var(--color-muted-foreground)',
              display: 'block',
              textAlign: 'center',
              mt: 0.25
            }}
          >
            {progress}/{total}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const tooltipContent = (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        {achievement.name}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {achievement.description}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: '#FFD700' }}>
          +{achievement.xp_reward} XP
        </Typography>
        {achievement.earned ? (
          <Typography variant="caption" sx={{ color: '#4CAF50' }}>
            ✓ Earned
          </Typography>
        ) : (
          <Typography variant="caption">
            {progress}/{total}
          </Typography>
        )}
      </Box>
      {achievement.earned_at && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
          Earned: {new Date(achievement.earned_at).toLocaleDateString()}
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      {badgeContent}
    </Tooltip>
  );
};

// Add keyframes for shimmer animation
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the keyframes into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

export default AchievementBadge;