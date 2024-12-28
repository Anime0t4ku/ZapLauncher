import React from 'react';
import { Grid, List, Search, Menu } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSearchClick: () => void;
  onMenuClick: () => void;
}

export default function BottomNav({ viewMode, setViewMode, onSearchClick, onMenuClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 z-40">
      <div className="flex justify-around items-center">
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-[0.98]"
        >
          <Menu className="w-6 h-6" />
          <span className="text-xs mt-1">Menu</span>
        </button>
        
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-[0.98]"
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Search</span>
        </button>
        
        <button
          onClick={() => setViewMode('grid')}
          className={`flex flex-col items-center p-2 ${
            viewMode === 'grid' 
              ? 'text-blue-600 dark:text-blue-400 scale-105' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
          } transition-all active:scale-[0.98]`}
        >
          <Grid className="w-6 h-6" />
          <span className="text-xs mt-1">Grid</span>
        </button>
        
        <button
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center p-2 ${
            viewMode === 'list'
              ? 'text-blue-600 dark:text-blue-400 scale-105'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
          } transition-all active:scale-[0.98]`}
        >
          <List className="w-6 h-6" />
          <span className="text-xs mt-1">List</span>
        </button>
      </div>
    </nav>
  );
}