import React from 'react';
import { Clock } from 'lucide-react';
import { Game } from '../../types';

interface RecentGamesProps {
  games: Game[];
  onGameSelect: (game: Game) => void;
}

export default function RecentGames({ games, onGameSelect }: RecentGamesProps) {
  const recentGames = games
    .filter(game => game.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())
    .slice(0, 4);

  if (recentGames.length === 0) return null;

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Games</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {recentGames.map((game) => (
          <div
            key={game.id}
            className="relative cursor-pointer group"
            onClick={() => onGameSelect(game)}
          >
            <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md">
              <img
                src={game.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 p-3 w-full">
                  <h3 className="text-white font-semibold truncate">{game.title}</h3>
                  <p className="text-gray-300 text-sm">{game.core}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}