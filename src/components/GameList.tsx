import React from 'react';
import { Game } from '../types';
import { Star, Play } from 'lucide-react';

interface GameListProps {
  games: Game[];
  onGameSelect: (game: Game) => void;
}

export default function GameList({ games, onGameSelect }: GameListProps) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onGameSelect(game)}
          className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-left"
        >
          <div className="flex-shrink-0 w-16 h-16">
            <img
              src={game.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
              alt={game.title}
              className="w-full h-full object-cover rounded-lg shadow-sm"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {game.title}
              </h3>
              {game.favorite && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{game.core}</p>
            {game.lastPlayed && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Last played: {new Date(game.lastPlayed).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Play className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </button>
      ))}
    </div>
  );
}