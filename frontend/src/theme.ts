import { createTheme, ThemeOptions } from '@mui/material/styles';

// Enhanced color palette with more sophisticated gradients and modern colors
const createEnhancedTheme = (mode: 'light' | 'dark' = 'light') => {
  const isLight = mode === 'light';

  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#6366F1', // Modern indigo
        light: '#818CF8',
        dark: '#4F46E5',
        contrastText: '#fff',
      },
      secondary: {
        main: '#EC4899', // Vibrant pink
        light: '#F472B6',
        dark: '#DB2777',
      },
      background: {
        default: isLight ? '#FAFBFC' : '#0F0F23',
        paper: isLight ? '#FFFFFF' : '#1A1A2E',
      },
      text: {
        primary: isLight ? '#1E293B' : '#F1F5F9',
        secondary: isLight ? '#64748B' : '#94A3B8',
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
      },
      grey: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'Space Grotesk',
        'IBM Plex Sans',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontFamily: 'Space Grotesk, Inter, sans-serif',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        lineHeight: 1.1,
        background: isLight
          ? 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
          : 'linear-gradient(135deg, #818CF8 0%, #F472B6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
      h2: {
        fontFamily: 'Space Grotesk, Inter, sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h3: {
        fontFamily: 'Space Grotesk, Inter, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
      },
      h4: {
        fontFamily: 'Inter, Roboto, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      },
      h5: {
        fontFamily: 'Inter, Roboto, sans-serif',
        fontWeight: 500,
        letterSpacing: '-0.005em',
        lineHeight: 1.5,
      },
      h6: {
        fontFamily: 'Inter, Roboto, sans-serif',
        fontWeight: 500,
        lineHeight: 1.6,
      },
      body1: {
        fontFamily: 'Inter, Roboto, sans-serif',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontFamily: 'Inter, Roboto, sans-serif',
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            fontSize: '1rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isLight
                ? '0 8px 25px rgba(99, 102, 241, 0.25)'
                : '0 8px 25px rgba(129, 140, 248, 0.25)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            },
          },
          outlined: {
            borderWidth: '2px',
            borderColor: isLight ? '#6366F1' : '#818CF8',
            '&:hover': {
              borderWidth: '2px',
              backgroundColor: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(129, 140, 248, 0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            background: isLight
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(26, 26, 46, 0.95)',
            border: isLight
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.1)',
          },
          elevation1: {
            boxShadow: isLight
              ? '0 4px 20px rgba(99, 102, 241, 0.08)'
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
          },
          elevation2: {
            boxShadow: isLight
              ? '0 8px 30px rgba(99, 102, 241, 0.12)'
              : '0 8px 30px rgba(0, 0, 0, 0.4)',
          },
          elevation3: {
            boxShadow: isLight
              ? '0 12px 40px rgba(99, 102, 241, 0.15)'
              : '0 12px 40px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            background: isLight
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(26, 26, 46, 0.95)',
            border: isLight
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isLight
                ? '0 20px 60px rgba(99, 102, 241, 0.15)'
                : '0 20px 60px rgba(0, 0, 0, 0.6)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isLight ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: isLight ? 'rgba(248, 250, 252, 1)' : 'rgba(30, 41, 59, 1)',
              },
              '&.Mui-focused': {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 1)' : 'rgba(26, 26, 46, 1)',
                boxShadow: isLight
                  ? '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  : '0 0 0 3px rgba(129, 140, 248, 0.1)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
          },
          colorSuccess: {
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            color: 'white',
          },
          colorWarning: {
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            color: 'white',
          },
          colorError: {
            background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
            color: 'white',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            background: isLight
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(15, 15, 35, 0.95)',
            borderBottom: isLight
              ? '1px solid rgba(99, 102, 241, 0.1)'
              : '1px solid rgba(129, 140, 248, 0.1)',
          },
        },
      },
    },
  };

  return createTheme(baseTheme);
};

const theme = createEnhancedTheme('light');
export const darkTheme = createEnhancedTheme('dark');
export default theme; 