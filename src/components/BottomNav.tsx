import React from 'react';
import { LayoutGrid, Search, Menu, ChevronDown } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSearchClick: () => void;
  onMenuClick: () => void;
}

export default function BottomNav({ viewMode, setViewMode, onSearchClick, onMenuClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 z-40 select-none">
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
        
        <div className="relative group">
          <button
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
            <div className="relative">
              <LayoutGrid className="w-6 h-6" />
              <ChevronDown className="w-3 h-3 absolute -right-1 -bottom-1" />
            </div>
            <span className="text-xs mt-1">View</span>
          </button>
          
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
            <div className="py-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-full px-4 py-2 text-sm flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-full px-4 py-2 text-sm flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}