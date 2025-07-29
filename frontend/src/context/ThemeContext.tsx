import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useAuth } from './AuthContext';
import apiClient from '../utils/apiClient';

type ThemeMode = 'light' | 'dark' | 'soft-pop' | 'blue' | 'green' | 'neo-brutalism';
type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface ThemeContextType {
  themeMode: ThemeMode;
  fontSize: FontSize;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  updatePreferences: (theme?: ThemeMode, font?: FontSize) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Font size mappings
const fontSizeMap = {
  small: '0.875rem',
  medium: '1rem', 
  large: '1.125rem',
  'extra-large': '1.25rem'
};

// Create theme variants
const createAdvancedTheme = (mode: 'light' | 'dark', primaryColor: string) => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: primaryColor },
      background: {
        default: isDark ? '#0f172a' : '#ffffff',
        paper: isDark ? '#1e293b' : '#f8fafc',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
    },
  });
};

const themes = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#4f46e5' },
      background: {
        default: '#ffffff',
        paper: '#f8fafc',
      },
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#6366f1' },
      background: {
        default: '#0f172a',
        paper: '#1e293b',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#94a3b8',
      },
    },
  }),
  'soft-pop': createTheme({
    palette: {
      mode: 'light',
      primary: { main: 'hsl(243.3962, 75.3555%, 58.6275%)' },
      secondary: { main: 'hsl(173.4146, 80.3922%, 40%)' },
      background: {
        default: 'hsl(80.0000, 33.3333%, 96.4706%)',
        paper: 'hsl(0, 0%, 100%)',
      },
      text: {
        primary: 'hsl(0, 0%, 0%)',
        secondary: 'hsl(0, 0%, 20%)',
      },
      error: { main: 'hsl(0, 84.2365%, 60.1961%)' },
      success: { main: 'hsl(142.0859, 70.5628%, 45.2941%)' },
      warning: { main: 'hsl(37.6923, 92.1260%, 50.1961%)' },
      info: { main: 'hsl(243.3962, 75.3555%, 58.6275%)' },
    },
  }),
  'neo-brutalism': createTheme({
    palette: {
      mode: 'dark',
      primary: { main: 'hsl(0, 100%, 70%)' },
      secondary: { main: 'hsl(60, 100%, 60%)' },
      background: {
        default: 'hsl(0, 0%, 0%)',
        paper: 'hsl(0, 0%, 20%)',
      },
      text: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(0, 0%, 80%)',
      },
      error: { main: 'hsl(0, 0%, 100%)' },
      success: { main: 'hsl(120, 60%, 50%)' },
      warning: { main: 'hsl(60, 100%, 60%)' },
      info: { main: 'hsl(210, 100%, 60%)' },
    },
  }),
  blue: createAdvancedTheme('dark', '#2563eb'),
  green: createAdvancedTheme('dark', '#059669'),
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const { isAuthenticated } = useAuth();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    const savedFontSize = localStorage.getItem('fontSize') as FontSize;
    
    if (savedTheme && themes[savedTheme]) {
      setThemeModeState(savedTheme);
    }
    if (savedFontSize && fontSizeMap[savedFontSize]) {
      setFontSizeState(savedFontSize);
    }
  }, []);

  // Load preferences from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserPreferences();
    }
  }, [isAuthenticated]);

  // Apply font size to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[fontSize]);
  }, [fontSize]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    
    // Update CSS custom properties for Tailwind
    const theme = themes[themeMode];
    const root = document.documentElement;
    
    if (theme.palette.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const loadUserPreferences = async () => {
    try {
      const response = await apiClient.get('/api/profile/');
      
      const { theme_preference, font_size } = response.data;
      if (theme_preference && themes[theme_preference as ThemeMode]) {
        setThemeModeState(theme_preference as ThemeMode);
        localStorage.setItem('theme', theme_preference);
      } else {
        // Set default if backend returns null/undefined
        setThemeModeState('light');
        localStorage.setItem('theme', 'light');
      }
      if (font_size && fontSizeMap[font_size as FontSize]) {
        setFontSizeState(font_size as FontSize);
        localStorage.setItem('fontSize', font_size);
      } else {
        // Set default if backend returns null/undefined
        setFontSizeState('medium');
        localStorage.setItem('fontSize', 'medium');
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const updatePreferences = async (theme?: ThemeMode, font?: FontSize) => {
    if (!isAuthenticated) return;

    try {
      const updateData: any = {};
      if (theme) updateData.theme_preference = theme;
      if (font) updateData.font_size = font;

      await apiClient.put('/api/profile/preferences', updateData);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme', mode);
    await updatePreferences(mode, undefined);
  };

  const setFontSize = async (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size);
    await updatePreferences(undefined, size);
  };

  const currentTheme = themes[themeMode];

  return (
    <ThemeContext.Provider value={{
      themeMode,
      fontSize,
      setThemeMode,
      setFontSize,
      updatePreferences
    }}>
      <MuiThemeProvider theme={currentTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};