import React from 'react';
import { Grid, List, Search } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSearchClick: () => void;
}

export default function BottomNav({ viewMode, setViewMode, onSearchClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 z-50">
      <div className="flex justify-around items-center">
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Search</span>
        </button>
        
        <button
          onClick={() => setViewMode('grid')}
          className={`flex flex-col items-center p-2 ${
            viewMode === 'grid' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          } transition-colors`}
        >
          <Grid className="w-6 h-6" />
          <span className="text-xs mt-1">Grid</span>
        </button>
        
        <button
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center p-2 ${
            viewMode === 'list' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          } transition-colors`}
        >
          <List className="w-6 h-6" />
          <span className="text-xs mt-1">List</span>
        </button>
      </div>
    </nav>
  );
}