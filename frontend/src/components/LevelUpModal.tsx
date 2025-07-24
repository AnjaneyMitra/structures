import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Box, Typography, Button } from '@mui/material';
import { LevelUpInfo, LEVEL_COLORS, LEVEL_ICONS } from '../types/levels';
import LevelBadge from './LevelBadge';

interface LevelUpModalProps {
  levelUpInfo: LevelUpInfo | null;
  open: boolean;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  levelUpInfo,
  open,
  onClose
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open && levelUpInfo) {
      // Trigger animation after modal opens
      const timer = setTimeout(() => setShowAnimation(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [open, levelUpInfo]);

  if (!levelUpInfo) return null;

  const newLevelColors = LEVEL_COLORS[levelUpInfo.new_level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS[1];
  const newLevelIcon = LEVEL_ICONS[levelUpInfo.new_level as keyof typeof LEVEL_ICONS] || LEVEL_ICONS[1];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-muted) 100%)',
          border: '2px solid var(--color-primary)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ 
          textAlign: 'center', 
          p: 4,
          position: 'relative',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
          color: 'white'
        }}>
          {/* Animated Background Elements */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            animation: showAnimation ? 'pulse 2s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.7 },
              '50%': { opacity: 1 }
            }
          }} />
          
          {/* Celebration Icon */}
          <Box sx={{ 
            fontSize: '4rem', 
            mb: 2,
            transform: showAnimation ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.5s ease-out',
            position: 'relative',
            zIndex: 1
          }}>
            🎉
          </Box>
          
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            Level Up!
          </Typography>
          
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            position: 'relative',
            zIndex: 1
          }}>
            Congratulations on your progress!
          </Typography>
        </Box>

        <Box sx={{ p: 4, textAlign: 'center' }}>
          {/* Level Transition */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: 3
          }}>
            {/* Old Level */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mb: 1, 
                color: 'var(--color-muted-foreground)',
                fontWeight: 'medium'
              }}>
                Previous
              </Typography>
              <LevelBadge 
                level={levelUpInfo.old_level} 
                title={levelUpInfo.old_title}
                size="medium"
              />
            </Box>

            {/* Arrow */}
            <Box sx={{ 
              fontSize: '2rem',
              color: 'var(--color-primary)',
              transform: showAnimation ? 'translateX(10px)' : 'translateX(0)',
              transition: 'transform 0.5s ease-out'
            }}>
              →
            </Box>

            {/* New Level */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mb: 1, 
                color: 'var(--color-muted-foreground)',
                fontWeight: 'medium'
              }}>
                New Level
              </Typography>
              <Box sx={{
                transform: showAnimation ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.5s ease-out'
              }}>
                <LevelBadge 
                  level={levelUpInfo.new_level} 
                  title={levelUpInfo.new_title}
                  size="large"
                />
              </Box>
            </Box>
          </Box>

          {/* Achievement Message */}
          <Box sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'var(--color-muted)',
            border: '1px solid var(--color-border)',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ 
              mb: 1, 
              color: 'var(--color-foreground)',
              fontWeight: 'bold'
            }}>
              You are now a {levelUpInfo.new_title}!
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'var(--color-muted-foreground)',
              lineHeight: 1.6
            }}>
              Your dedication to solving problems has paid off. Keep up the excellent work and continue your journey to mastery!
            </Typography>
          </Box>

          {/* Action Button */}
          <Button
            onClick={onClose}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Continue Coding! 🚀
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;