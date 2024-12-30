import React from 'react';
import { X } from 'lucide-react';
import SearchBar from './search/SearchBar';
import SortSelect, { SortOption } from './search/SortSelect';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onSort?: (option: SortOption) => void;
  sortBy?: SortOption;
}

export default function SearchOverlay({ isOpen, onClose, onSearch, onSort, sortBy = 'title' }: SearchOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose}>
      <div className="max-w-xl mx-auto px-4 pt-20" onClick={e => e.stopPropagation()}>
        <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl p-4 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Search Games</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 dark:text-gray-400" />
            </button>
          </div>
          
          <SearchBar
            value=""
            onChange={onSearch}
            placeholder="Search games..."
          />
          
          {onSort && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort by
              </label>
              <SortSelect value={sortBy} onChange={onSort} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}