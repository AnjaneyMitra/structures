import { createTheme, ThemeOptions } from '@mui/material/styles';

// Advanced Design System Theme following the comprehensive design guide
const createAdvancedTheme = (mode: 'light' | 'dark' = 'light') => {
  const isLight = mode === 'light';

  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#4F46E5', // Modern indigo for trust and professionalism
        light: '#818CF8',
        dark: '#3730A3',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#EC4899', // Vibrant pink for energy and creativity
        light: '#F472B6',
        dark: '#DB2777',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? '#FAFBFC' : '#0A0A0F',
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
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF',
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
      divider: isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.8)',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'sans-serif',
      ].join(','),
      // Major Third Scale (1.25x) for harmonious typography
      h1: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 800,
        fontSize: '3.05rem', // 49px
        letterSpacing: '-0.025em',
        lineHeight: 1.1,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      h2: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: '2.44rem', // 39px
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      h3: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: '1.95rem', // 31px
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      h4: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: '1.56rem', // 25px
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      h5: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '1.25rem', // 20px
        letterSpacing: '-0.005em',
        lineHeight: 1.5,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      h6: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '1rem', // 16px
        lineHeight: 1.6,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      body1: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: '1rem', // 16px
        lineHeight: 1.6,
        color: isLight ? '#1E293B' : '#F1F5F9',
      },
      body2: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: '0.875rem', // 14px
        lineHeight: 1.5,
        color: isLight ? '#64748B' : '#94A3B8',
      },
      caption: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: '0.75rem', // 12px
        lineHeight: 1.4,
        color: isLight ? '#64748B' : '#94A3B8',
      },
    },
    shape: {
      borderRadius: 16,
    },
    spacing: 8, // 8-point grid system
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '12px 24px',
            minHeight: 44, // Touch-friendly minimum
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            '&:hover::before': {
              left: '100%',
            },
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            background: isLight 
              ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
              : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
            '&:hover': {
              background: isLight 
                ? 'linear-gradient(135deg, #3730A3 0%, #6D28D9 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              boxShadow: '0 8px 25px rgba(79, 70, 229, 0.35)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            },
          },
          outlined: {
            borderColor: isLight ? 'rgba(79, 70, 229, 0.3)' : 'rgba(99, 102, 241, 0.4)',
            color: isLight ? '#4F46E5' : '#818CF8',
            borderWidth: '2px',
            background: isLight ? 'rgba(79, 70, 229, 0.02)' : 'rgba(99, 102, 241, 0.05)',
            '&:hover': {
              borderColor: isLight ? '#4F46E5' : '#818CF8',
              backgroundColor: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.12)',
              borderWidth: '2px',
            },
          },
          text: {
            color: isLight ? '#64748B' : '#94A3B8',
            '&:hover': {
              backgroundColor: isLight ? 'rgba(79, 70, 229, 0.05)' : 'rgba(99, 102, 241, 0.08)',
            },
          },
          sizeSmall: {
            padding: '8px 16px',
            fontSize: '0.75rem',
            minHeight: 36,
          },
          sizeLarge: {
            padding: '16px 32px',
            fontSize: '1rem',
            minHeight: 52,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 46, 0.9)',
            border: isLight 
              ? '1px solid rgba(226, 232, 240, 0.5)' 
              : '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: 'none',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          },
          elevation1: {
            boxShadow: isLight
              ? '0 1px 3px rgba(30, 41, 59, 0.1), 0 1px 2px rgba(30, 41, 59, 0.06)'
              : '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
          },
          elevation2: {
            boxShadow: isLight
              ? '0 4px 6px rgba(30, 41, 59, 0.1), 0 2px 4px rgba(30, 41, 59, 0.06)'
              : '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
          },
          elevation3: {
            boxShadow: isLight
              ? '0 10px 15px rgba(30, 41, 59, 0.1), 0 4px 6px rgba(30, 41, 59, 0.05)'
              : '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.4)',
          },
          elevation4: {
            boxShadow: isLight
              ? '0 20px 25px rgba(30, 41, 59, 0.15), 0 10px 10px rgba(30, 41, 59, 0.04)'
              : '0 20px 25px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)',
            border: isLight 
              ? '1px solid rgba(226, 232, 240, 0.4)' 
              : '1px solid rgba(71, 85, 105, 0.4)',
            boxShadow: 'none',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: isLight 
                ? 'linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.3), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.5), transparent)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover': {
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.95)',
              borderColor: isLight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(129, 140, 248, 0.4)',
              boxShadow: isLight
                ? '0 20px 40px rgba(79, 70, 229, 0.1), 0 8px 16px rgba(30, 41, 59, 0.08)'
                : '0 20px 40px rgba(79, 70, 229, 0.3), 0 8px 16px rgba(0, 0, 0, 0.4)',
              transform: 'translateY(-8px) scale(1.02)',
              '&::before': {
                opacity: 1,
              },
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              backgroundColor: isLight ? 'rgba(248, 250, 252, 0.6)' : 'rgba(51, 65, 85, 0.6)',
              border: isLight 
                ? '1px solid rgba(226, 232, 240, 0.5)' 
                : '1px solid rgba(71, 85, 105, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              minHeight: 44,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: isLight ? '#1E293B' : '#F1F5F9',
              '&:hover': {
                backgroundColor: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(71, 85, 105, 0.8)',
                borderColor: isLight ? 'rgba(79, 70, 229, 0.3)' : 'rgba(129, 140, 248, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-focused': {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                borderColor: isLight ? '#4F46E5' : '#818CF8',
                boxShadow: isLight 
                  ? '0 0 0 3px rgba(79, 70, 229, 0.15)'
                  : '0 0 0 3px rgba(129, 140, 248, 0.2)',
                transform: 'translateY(-2px)',
              },
              '& fieldset': {
                border: 'none',
              },
              '& input': {
                color: isLight ? '#1E293B' : '#F1F5F9',
              },
              '& input::placeholder': {
                color: isLight ? '#64748B' : '#94A3B8',
                opacity: 1,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '0.75rem',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              transform: 'scale(1.05) translateY(-1px)',
            },
          },
          colorSuccess: {
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          },
          colorWarning: {
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          },
          colorError: {
            background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          },
          colorPrimary: {
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
          },
          colorSecondary: {
            background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#FFFFFF' : '#1F1F1F',
            borderBottom: isLight ? '1px solid #F0F0F0' : '1px solid #2C2C2C',
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#FAFAFA' : '#191919',
            borderRight: isLight ? '1px solid #F0F0F0' : '1px solid #2C2C2C',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: '2px 8px',
            '&:hover': {
              backgroundColor: isLight ? '#F5F5F5' : '#2C2C2C',
            },
            '&.Mui-selected': {
              backgroundColor: isLight ? '#E8F5E8' : '#1A3A1A',
              color: '#2ECC71',
              '&:hover': {
                backgroundColor: isLight ? '#E8F5E8' : '#1A3A1A',
              },
            },
          },
        },
      },
    },
  };

  return createTheme(baseTheme);
};

const theme = createAdvancedTheme('light');
export const darkTheme = createAdvancedTheme('dark');
export default theme;