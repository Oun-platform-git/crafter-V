import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="md:hidden">
          <Logo size="small" />
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              U
            </div>
            <span className="text-gray-300 hidden md:inline">User</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
