import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF', // Soft purple
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF6584', // Vibrant pink
    },
    background: {
      default: '#F4F6FB',
      paper: '#fff',
    },
    text: {
      primary: '#22223B',
      secondary: '#4A4E69',
    },
    success: {
      main: '#43AA8B',
    },
    error: {
      main: '#FF4B5C',
    },
    warning: {
      main: '#FFD166',
    },
    info: {
      main: '#3A86FF',
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
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: 'Space Grotesk, Inter, sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Space Grotesk, Inter, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Inter, Roboto, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Inter, Roboto, sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'Inter, Roboto, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'Inter, Roboto, sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: 'Inter, Roboto, sans-serif',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme; 