import React from 'react';
import { Star } from 'lucide-react';

interface FavoritesCardProps {
  favoriteCount: number;
  onClick: () => void;
}

export default function FavoritesCard({ favoriteCount, onClick }: FavoritesCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-90 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute inset-0 p-6 flex flex-col">
        <Star className="w-8 h-8 text-white/90 fill-white/90" />
        
        <div className="mt-auto">
          <h3 className="text-xl font-bold text-white mb-1">
            Favorites
          </h3>
          <p className="text-sm text-white/80">
            {favoriteCount} games
          </p>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </button>
  );
}