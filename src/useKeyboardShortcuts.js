import { useEffect } from 'react';

export const useKeyboardShortcuts = (callbacks = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' && e.target.type === 'text' && !e.ctrlKey && !e.metaKey) {
        return;
      }

      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + N: New Task
      if (modKey && e.key === 'n') {
        e.preventDefault();
        callbacks.newTask?.();
      }

      // Ctrl/Cmd + S: Sync
      if (modKey && e.key === 's') {
        e.preventDefault();
        callbacks.sync?.();
      }

      // Ctrl/Cmd + K: Focus search/command
      if (modKey && e.key === 'k') {
        e.preventDefault();
        callbacks.focusSearch?.();
      }

      // Ctrl/Cmd + L: New List
      if (modKey && e.key === 'l') {
        e.preventDefault();
        callbacks.newList?.();
      }

      // Ctrl/Cmd + T: Toggle Theme
      if (modKey && e.key === 't') {
        e.preventDefault();
        callbacks.toggleTheme?.();
      }

      // Ctrl/Cmd + Shift + A: Analytics
      if (modKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        callbacks.goAnalytics?.();
      }

      // Ctrl/Cmd + /: Show Help
      if ((modKey && e.key === '/') || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        callbacks.showHelp?.();
      }

      // Alt + V: Voice command
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        callbacks.voiceCommand?.();
      }

      // Escape: Close modals/overlays
      if (e.key === 'Escape') {
        callbacks.closeModal?.();
      }

      // Enter in search/input: Submit
      if (e.key === 'Enter' && e.target.className?.includes('task-input')) {
        e.preventDefault();
        callbacks.submitTask?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

// Keyboard shortcuts help text
export const keyboardShortcuts = [
  { key: 'Ctrl + N', description: 'Create new task' },
  { key: 'Ctrl + S', description: 'Sync data' },
  { key: 'Ctrl + K', description: 'Focus search' },
  { key: 'Ctrl + L', description: 'Create new list' },
  { key: 'Ctrl + T', description: 'Toggle theme' },
  { key: 'Ctrl + Shift + A', description: 'Go to analytics' },
  { key: 'Ctrl + /', description: 'Show help' },
  { key: 'Alt + V', description: 'Voice commands' },
  { key: 'Escape', description: 'Close modal' },
  { key: 'Enter', description: 'Submit task (in input)' }
];
