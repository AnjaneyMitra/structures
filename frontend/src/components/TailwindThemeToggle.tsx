import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeMode } from '../contexts/ThemeContext';

export const TailwindThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-500 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 relative overflow-hidden group"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-full" />
      
      {isDarkMode ? (
        <SunIcon className="h-4 w-4 mx-auto" />
      ) : (
        <MoonIcon className="h-4 w-4 mx-auto" />
      )}
    </button>
  );
};

export default TailwindThemeToggle;
