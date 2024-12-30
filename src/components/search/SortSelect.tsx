import React from 'react';
import { SortAsc } from 'lucide-react';

export type SortOption = 'title' | 'lastPlayed' | 'releaseYear';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative">
      <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:text-white backdrop-blur-sm transition-all appearance-none"
      >
        <option value="title">Title (A-Z)</option>
        <option value="lastPlayed">Recently Played</option>
        <option value="releaseYear">Release Year</option>
      </select>
    </div>
  );
}