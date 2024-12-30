import React from 'react';
import { Star, Play } from 'lucide-react';
import { Game } from '../../types';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <div
      className="group cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity"
      onClick={() => onSelect(game)}
    >
      <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md dark:shadow-gray-800 relative">
        <img
          src={game.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
          alt={game.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity">
          <div className="absolute bottom-0 p-3 w-full">
            <h3 className="text-white font-semibold truncate mb-1">{game.title}</h3>
            <p className="text-gray-300 text-sm">{game.core}</p>
          </div>
          <div className="absolute top-0 right-0 p-2 flex gap-2">
            {game.favorite && (
              <span className="bg-yellow-500/90 p-1.5 rounded-lg">
                <Star className="w-4 h-4 text-white fill-white" />
              </span>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Play className="w-6 h-6 text-white fill-white" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}