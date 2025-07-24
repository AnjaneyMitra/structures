import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { NewlyEarnedAchievement } from '../types/achievements';

interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  achievements: NewlyEarnedAchievement[];
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  open,
  onClose,
  achievements
}) => {
  if (!achievements.length) return null;

  const totalXP = achievements.reduce((sum, achievement) => sum + achievement.xp_reward, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
          border: '1px solid var(--color-border)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
            animation: 'shimmer 2s ease-in-out infinite'
          }
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#8B4513',
            p: 3,
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#8B4513',
              '&:hover': { bgcolor: 'rgba(139, 69, 19, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>

          <EmojiEventsIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Achievement{achievements.length > 1 ? 's' : ''} Unlocked!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8 }}>
            +{totalXP} XP Earned
          </Typography>
        </Box>

        {/* Achievements List */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {achievements.map((achievement, index) => (
              <Box
                key={achievement.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 2,
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Achievement Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    border: '3px solid #FFD700',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    mr: 2,
                    flexShrink: 0
                  }}
                >
                  <Typography sx={{ fontSize: 32 }}>
                    {achievement.icon}
                  </Typography>
                </Box>

                {/* Achievement Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: 'var(--color-foreground)', mb: 0.5 }}
                  >
                    {achievement.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-muted-foreground)', mb: 1 }}
                  >
                    {achievement.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid #FFD700',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ color: '#FFD700' }}
                    >
                      +{achievement.xp_reward} XP
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            pt: 0,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
              fontWeight: 600,
              px: 4
            }}
          >
            Awesome!
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Add keyframes for animations
const animationKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject the keyframes into the document head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('achievement-modal-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'achievement-modal-styles';
    style.textContent = animationKeyframes;
    document.head.appendChild(style);
  }
}

export default AchievementModal;