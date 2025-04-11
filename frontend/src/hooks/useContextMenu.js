import { useState, useCallback, useEffect } from 'react';

export default function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    setIsOpen(true);
    setPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClick = () => {
      if (isOpen) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeContextMenu]);

  return {
    isOpen,
    position,
    handleContextMenu,
    closeContextMenu,
  };
}
