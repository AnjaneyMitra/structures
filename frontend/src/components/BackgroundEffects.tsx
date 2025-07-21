import React from 'react';
import { Box } from '@mui/material';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'waves' | 'geometric';
  opacity?: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'gradient', 
  opacity = 0.1 
}) => {
  const gradientBackground = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: `
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, ${opacity * 0.8}) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, ${opacity * 0.6}) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(59, 130, 246, ${opacity * 0.4}) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(1deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
      }}
    />
  );

  const particlesBackground = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(2px 2px at 20px 30px, rgba(99, 102, 241, ${opacity}), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(236, 72, 153, ${opacity}), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(59, 130, 246, ${opacity}), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(16, 185, 129, ${opacity}), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(245, 158, 11, ${opacity}), transparent)
          `,
          backgroundSize: '200px 100px',
          animation: 'sparkle 15s linear infinite',
        },
        '@keyframes sparkle': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' },
        },
      }}
    />
  );

  const wavesBackground = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: `
          linear-gradient(45deg, rgba(99, 102, 241, ${opacity * 0.1}) 0%, transparent 70%),
          linear-gradient(-45deg, rgba(236, 72, 153, ${opacity * 0.1}) 0%, transparent 70%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
          height: '200%',
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(99, 102, 241, ${opacity * 0.05}) 2px,
              rgba(99, 102, 241, ${opacity * 0.05}) 4px
            )
          `,
          animation: 'wave 20s linear infinite',
        },
        '@keyframes wave': {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(-50px) translateY(-50px)' },
        },
      }}
    />
  );

  const geometricBackground = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: `
            polygon(
              0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%
            )
          `,
          background: `linear-gradient(135deg, rgba(99, 102, 241, ${opacity * 0.1}) 0%, rgba(236, 72, 153, ${opacity * 0.1}) 100%)`,
          animation: 'geometric 25s ease-in-out infinite',
        },
        '@keyframes geometric': {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
        },
      }}
    />
  );

  const backgrounds = {
    gradient: gradientBackground,
    particles: particlesBackground,
    waves: wavesBackground,
    geometric: geometricBackground,
  };

  return backgrounds[variant];
};

export const GlassMorphismBox: React.FC<{ children: React.ReactNode; sx?: any }> = ({ 
  children, 
  sx = {} 
}) => (
  <Box
    sx={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 3,
      padding: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      ...sx,
    }}
  >
    {children}
  </Box>
);