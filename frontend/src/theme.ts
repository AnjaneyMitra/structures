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
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: 'none',
              transform: 'none',
            },
          },
          contained: {
            backgroundColor: '#00D084',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#00A86B',
            },
          },
          outlined: {
            borderColor: isLight ? '#EBEAE6' : '#37352F',
            color: isLight ? '#37352F' : '#FFFFFF',
            '&:hover': {
              borderColor: isLight ? '#D3D1CB' : '#5E5C58',
              backgroundColor: isLight ? '#F7F6F3' : '#37352F',
            },
          },
          text: {
            color: isLight ? '#787774' : '#9B9A97',
            '&:hover': {
              backgroundColor: isLight ? '#F7F6F3' : '#37352F',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isLight ? '#FFFFFF' : '#2F2F2F',
            border: isLight ? '1px solid #EBEAE6' : '1px solid #37352F',
            boxShadow: 'none',
          },
          elevation1: {
            boxShadow: isLight
              ? '0 1px 3px rgba(55, 53, 47, 0.1)'
              : '0 1px 3px rgba(0, 0, 0, 0.3)',
          },
          elevation2: {
            boxShadow: isLight
              ? '0 2px 8px rgba(55, 53, 47, 0.1)'
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
          },
          elevation3: {
            boxShadow: isLight
              ? '0 4px 12px rgba(55, 53, 47, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isLight ? '#FFFFFF' : '#2F2F2F',
            border: isLight ? '1px solid #EBEAE6' : '1px solid #37352F',
            boxShadow: 'none',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: isLight
                ? '0 2px 8px rgba(55, 53, 47, 0.1)'
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              backgroundColor: isLight ? '#F7F6F3' : '#37352F',
              border: isLight ? '1px solid #EBEAE6' : '1px solid #5E5C58',
              '&:hover': {
                backgroundColor: isLight ? '#EBEAE6' : '#5E5C58',
              },
              '&.Mui-focused': {
                backgroundColor: isLight ? '#FFFFFF' : '#2F2F2F',
                borderColor: '#00D084',
                boxShadow: '0 0 0 2px rgba(0, 208, 132, 0.2)',
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
            borderRadius: 4,
            fontWeight: 500,
            fontSize: '0.75rem',
          },
          colorSuccess: {
            backgroundColor: '#00D084',
            color: 'white',
          },
          colorWarning: {
            backgroundColor: '#FFAB00',
            color: 'white',
          },
          colorError: {
            backgroundColor: '#E03E3E',
            color: 'white',
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