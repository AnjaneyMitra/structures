import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeMode } from '../contexts/ThemeContext';

export const TailwindThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/30 relative overflow-hidden group backdrop-blur-sm"
      style={{
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, box-shadow'
      }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent group-hover:left-full"
        style={{
          transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* Icon with smooth transition */}
      <div className="relative z-10 flex items-center justify-center">
        {isDarkMode ? (
          <SunIcon 
            className="h-4 w-4 text-primary"
            style={{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isDarkMode ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
          />
        ) : (
          <MoonIcon 
            className="h-4 w-4 text-primary"
            style={{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        )}
      </div>
    </button>
  );
};

export default TailwindThemeToggle;
