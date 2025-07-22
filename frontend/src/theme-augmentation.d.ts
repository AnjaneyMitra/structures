import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
      secondary: string;
      tertiary: string;
    };
    border: {
      main: string;
      secondary: string;
    };
    code?: {
      background: string;
      border: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      main: string;
      secondary: string;
      tertiary: string;
    };
    border?: {
      main: string;
      secondary: string;
    };
    code?: {
      background: string;
      border: string;
    };
  }
}