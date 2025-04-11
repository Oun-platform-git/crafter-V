import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Get modifiers state
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Check each shortcut
      shortcuts.forEach(({ key, ctrlKey, shiftKey, altKey, action, preventDefault = true }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          Boolean(ctrl) === Boolean(ctrlKey) &&
          Boolean(shift) === Boolean(shiftKey) &&
          Boolean(alt) === Boolean(altKey)
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          action(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
