import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useKeyboardShortcuts, formatShortcut } from '../../hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from '../KeyboardShortcutsHelp';

// Mock component to test the hook
const TestComponent: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'r',
        ctrlKey: true,
        description: 'Test Run',
        category: 'Test',
        action: onAction
      }
    ]
  });

  return <div data-testid="test-component">Test Component</div>;
};

describe('Keyboard Shortcuts', () => {
  describe('useKeyboardShortcuts hook', () => {
    it('should trigger action when correct key combination is pressed', () => {
      const mockAction = jest.fn();
      render(<TestComponent onAction={mockAction} />);

      // Simulate Ctrl+R
      fireEvent.keyDown(document, {
        key: 'r',
        ctrlKey: true
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should not trigger action when wrong key combination is pressed', () => {
      const mockAction = jest.fn();
      render(<TestComponent onAction={mockAction} />);

      // Simulate just 'r' without Ctrl
      fireEvent.keyDown(document, {
        key: 'r',
        ctrlKey: false
      });

      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should not trigger action when typing in input field', () => {
      const mockAction = jest.fn();
      render(
        <div>
          <TestComponent onAction={mockAction} />
          <input data-testid="test-input" />
        </div>
      );

      const input = screen.getByTestId('test-input');
      input.focus();

      // Simulate Ctrl+R while focused on input
      fireEvent.keyDown(input, {
        key: 'r',
        ctrlKey: true
      });

      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe('formatShortcut function', () => {
    it('should format simple key correctly', () => {
      const shortcut = {
        key: 'r',
        description: 'Test',
        action: () => {}
      };

      expect(formatShortcut(shortcut)).toBe('R');
    });

    it('should format key with modifiers correctly', () => {
      const shortcut = {
        key: 'r',
        ctrlKey: true,
        shiftKey: true,
        description: 'Test',
        action: () => {}
      };

      expect(formatShortcut(shortcut)).toBe('Ctrl + Shift + R');
    });
  });

  describe('KeyboardShortcutsHelp component', () => {
    const mockShortcuts = [
      {
        key: 'r',
        ctrlKey: true,
        description: 'Run code',
        category: 'Code Actions',
        action: () => {}
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Submit code',
        category: 'Code Actions',
        action: () => {}
      },
      {
        key: '?',
        description: 'Show help',
        category: 'General',
        action: () => {}
      }
    ];

    it('should render help modal when open', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onClose={() => {}}
          shortcuts={mockShortcuts}
        />
      );

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Run code')).toBeInTheDocument();
      expect(screen.getByText('Submit code')).toBeInTheDocument();
    });

    it('should group shortcuts by category', () => {
      render(
        <KeyboardShortcutsHelp
          open={true}
          onClose={() => {}}
          shortcuts={mockShortcuts}
        />
      );

      expect(screen.getByText('Code Actions')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(
        <KeyboardShortcutsHelp
          open={true}
          onClose={mockOnClose}
          shortcuts={mockShortcuts}
        />
      );

      const closeButton = screen.getByRole('button', { name: /got it/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});