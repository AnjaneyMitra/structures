import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShortcutConfig, useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from '../components/KeyboardShortcutsHelp';
import { useThemeMode } from './ThemeContext';

interface KeyboardShortcutsContextType {
  showHelp: () => void;
  hideHelp: () => void;
  registerShortcuts: (shortcuts: ShortcutConfig[]) => void;
  unregisterShortcuts: () => void;
  allShortcuts: ShortcutConfig[];
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const useKeyboardShortcutsContext = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({ children }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [pageShortcuts, setPageShortcuts] = useState<ShortcutConfig[]>([]);
  const navigate = useNavigate();
  const { toggleTheme } = useThemeMode();

  const showHelp = useCallback(() => setHelpOpen(true), []);
  const hideHelp = useCallback(() => setHelpOpen(false), []);

  const registerShortcuts = useCallback((shortcuts: ShortcutConfig[]) => {
    setPageShortcuts(shortcuts);
  }, []);

  const unregisterShortcuts = useCallback(() => {
    setPageShortcuts([]);
  }, []);

  // Global shortcuts that are always available
  const globalShortcuts: ShortcutConfig[] = [
    {
      key: '?',
      description: 'Show keyboard shortcuts help',
      category: 'General',
      action: showHelp
    },
    {
      key: 'Escape',
      description: 'Close modal or go back',
      category: 'General',
      action: () => {
        if (helpOpen) {
          hideHelp();
        }
      }
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Go to Dashboard',
      category: 'Navigation',
      action: () => navigate('/dashboard')
    },
    {
      key: 'p',
      ctrlKey: true,
      description: 'Go to Problems',
      category: 'Navigation',
      action: () => navigate('/problems')
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Go to Rooms',
      category: 'Navigation',
      action: () => navigate('/rooms')
    },
    {
      key: 'u',
      ctrlKey: true,
      description: 'Go to Profile',
      category: 'Navigation',
      action: () => navigate('/profile')
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Go to Friends',
      category: 'Navigation',
      action: () => navigate('/friends')
    },
    {
      key: 't',
      ctrlKey: true,
      description: 'Toggle Theme',
      category: 'Appearance',
      action: toggleTheme
    }
  ];

  // Combine global and page-specific shortcuts
  const allShortcuts = [...globalShortcuts, ...pageShortcuts];

  // Use the keyboard shortcuts hook
  useKeyboardShortcuts({
    shortcuts: allShortcuts,
    enabled: true,
    preventDefault: true
  });

  const contextValue: KeyboardShortcutsContextType = {
    showHelp,
    hideHelp,
    registerShortcuts,
    unregisterShortcuts,
    allShortcuts
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcutsHelp
        open={helpOpen}
        onClose={hideHelp}
        shortcuts={allShortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
};