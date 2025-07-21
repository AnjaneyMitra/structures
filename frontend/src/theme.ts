import { createTheme, ThemeOptions } from '@mui/material/styles';

// Clean, Notion-inspired theme matching the reference
const createNotionTheme = (mode: 'light' | 'dark' = 'light') => {
  const isLight = mode === 'light';

  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#00D084', // Notion-style green from reference
        light: '#26D0CE',
        dark: '#00A86B',
        contrastText: '#fff',
      },
      secondary: {
        main: '#6B73FF', // Soft blue accent
        light: '#9CA3FF',
        dark: '#4C52CC',
      },
      background: {
        default: isLight ? '#FFFFFF' : '#191919',
        paper: isLight ? '#FFFFFF' : '#2F2F2F',
      },
      text: {
        primary: isLight ? '#37352F' : '#FFFFFF',
        secondary: isLight ? '#787774' : '#9B9A97',
      },
      success: {
        main: '#00D084',
        light: '#26D0CE',
        dark: '#00A86B',
      },
      error: {
        main: '#E03E3E',
        light: '#FF6B6B',
        dark: '#C92A2A',
      },
      warning: {
        main: '#FFAB00',
        light: '#FFD93D',
        dark: '#FF8F00',
      },
      info: {
        main: '#6B73FF',
        light: '#9CA3FF',
        dark: '#4C52CC',
      },
      grey: {
        50: '#FBFBFA',
        100: '#F7F6F3',
        200: '#EBEAE6',
        300: '#D3D1CB',
        400: '#B8B5B2',
        500: '#9B9A97',
        600: '#787774',
        700: '#5E5C58',
        800: '#37352F',
        900: '#2F2E2A',
      },
      divider: isLight ? '#EBEAE6' : '#37352F',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ].join(','),
      h1: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      h2: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      h3: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      h4: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        letterSpacing: '-0.005em',
        lineHeight: 1.5,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      h5: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        lineHeight: 1.6,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      h6: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        lineHeight: 1.6,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      body1: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        lineHeight: 1.6,
        color: isLight ? '#2C3E50' : '#FFFFFF',
      },
      body2: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        lineHeight: 1.5,
        color: isLight ? '#7F8C8D' : '#BDC3C7',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 20px',
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isLight
                ? '0 4px 12px rgba(0, 208, 132, 0.15)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
            },
          },
          contained: {
            background: isLight
              ? 'linear-gradient(135deg, #00D084 0%, #26D0CE 100%)'
              : 'linear-gradient(135deg, #00D084 0%, #26D0CE 100%)',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 208, 132, 0.2)',
            '&:hover': {
              background: isLight
                ? 'linear-gradient(135deg, #00A86B 0%, #1FBAB8 100%)'
                : 'linear-gradient(135deg, #00A86B 0%, #1FBAB8 100%)',
              boxShadow: '0 6px 20px rgba(0, 208, 132, 0.3)',
            },
          },
          outlined: {
            borderColor: isLight ? '#EBEAE6' : '#37352F',
            color: isLight ? '#37352F' : '#FFFFFF',
            borderWidth: '1.5px',
            '&:hover': {
              borderColor: '#00D084',
              backgroundColor: isLight ? 'rgba(0, 208, 132, 0.05)' : 'rgba(0, 208, 132, 0.1)',
              borderWidth: '1.5px',
            },
          },
          text: {
            color: isLight ? '#787774' : '#9B9A97',
            '&:hover': {
              backgroundColor: isLight ? 'rgba(0, 208, 132, 0.05)' : 'rgba(0, 208, 132, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(47, 47, 47, 0.95)',
            border: isLight ? '1px solid rgba(235, 234, 230, 0.6)' : '1px solid rgba(55, 53, 47, 0.6)',
            boxShadow: 'none',
            backdropFilter: 'blur(12px)',
          },
          elevation1: {
            boxShadow: isLight
              ? '0 2px 8px rgba(55, 53, 47, 0.08), 0 1px 2px rgba(55, 53, 47, 0.06)'
              : '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
          },
          elevation2: {
            boxShadow: isLight
              ? '0 4px 16px rgba(55, 53, 47, 0.1), 0 2px 4px rgba(55, 53, 47, 0.06)'
              : '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
          },
          elevation3: {
            boxShadow: isLight
              ? '0 8px 24px rgba(55, 53, 47, 0.12), 0 4px 8px rgba(55, 53, 47, 0.08)'
              : '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(47, 47, 47, 0.9)',
            border: isLight ? '1px solid rgba(235, 234, 230, 0.5)' : '1px solid rgba(55, 53, 47, 0.5)',
            boxShadow: 'none',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: isLight
                ? '0 8px 32px rgba(0, 208, 132, 0.1), 0 2px 8px rgba(55, 53, 47, 0.08)'
                : '0 8px 32px rgba(0, 208, 132, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(-4px)',
              borderColor: isLight ? 'rgba(0, 208, 132, 0.2)' : 'rgba(0, 208, 132, 0.3)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isLight ? 'rgba(247, 246, 243, 0.8)' : 'rgba(55, 53, 47, 0.8)',
              border: isLight ? '1px solid rgba(235, 234, 230, 0.6)' : '1px solid rgba(94, 92, 88, 0.6)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: isLight ? 'rgba(235, 234, 230, 0.8)' : 'rgba(94, 92, 88, 0.8)',
                borderColor: isLight ? 'rgba(0, 208, 132, 0.3)' : 'rgba(0, 208, 132, 0.4)',
              },
              '&.Mui-focused': {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(47, 47, 47, 0.95)',
                borderColor: '#00D084',
                boxShadow: '0 0 0 3px rgba(0, 208, 132, 0.15)',
              },
              '& fieldset': {
                border: 'none',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.75rem',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
          colorSuccess: {
            background: 'linear-gradient(135deg, #00D084 0%, #26D0CE 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 208, 132, 0.3)',
          },
          colorWarning: {
            background: 'linear-gradient(135deg, #FFAB00 0%, #FFD93D 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(255, 171, 0, 0.3)',
          },
          colorError: {
            background: 'linear-gradient(135deg, #E03E3E 0%, #FF6B6B 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(224, 62, 62, 0.3)',
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

const theme = createNotionTheme('light');
export const darkTheme = createNotionTheme('dark');
export default theme;