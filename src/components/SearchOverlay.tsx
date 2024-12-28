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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search Games</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <SearchBar
            value=""
            onChange={onSearch}
            placeholder="Search by title, genre, or developer..."
            className="mb-4"
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