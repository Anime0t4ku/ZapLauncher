import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 w-full p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-5 h-5" />
          <span className="text-sm">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-5 h-5" />
          <span className="text-sm">Dark Mode</span>
        </>
      )}
    </button>
  );
}