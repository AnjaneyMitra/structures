import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeMode } from '../contexts/ThemeContext';

export const TailwindThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden group backdrop-blur-sm"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent transition-all duration-500 group-hover:left-full" />
      
      {/* Icon with smooth transition */}
      <div className="relative z-10 flex items-center justify-center">
        {isDarkMode ? (
          <SunIcon className="h-4 w-4 text-primary transition-all duration-300" />
        ) : (
          <MoonIcon className="h-4 w-4 text-primary transition-all duration-300" />
        )}
      </div>
    </button>
  );
};

export default TailwindThemeToggle;
