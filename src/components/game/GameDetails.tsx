import React from 'react';
import { Star, Calendar, User, Tag, Play, ArrowLeft } from 'lucide-react';
import { useZaparoo } from '../../hooks/useZaparoo';
import { Game } from '../../types';

interface GameDetailsProps {
  game: Game;
  onBack: () => void;
}

export default function GameDetails({ game, onBack }: GameDetailsProps) {
  const { launchGame, isConnected } = useZaparoo();

  const handleLaunch = async () => {
    if (!game.path) {
      console.error('Game path not available:', game.title);
      return;
    }
    try {
      await launchGame(game.path);
    } catch (error) {
      console.error('Failed to launch game:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Games</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cover Art */}
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
          <img
            src={game.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          {game.favorite && (
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-500/90 p-2 rounded-lg">
                <Star className="w-5 h-5 text-white fill-white" />
              </span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {game.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {game.description || 'No description available.'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Calendar className="w-5 h-5" />
              <span>{game.releaseYear || 'Release year unknown'}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <User className="w-5 h-5" />
              <span>{game.developer || 'Developer unknown'}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Tag className="w-5 h-5" />
              <span>{game.genre || 'Genre unknown'}</span>
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={!isConnected}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>{isConnected ? 'Launch Game' : 'Not Connected'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}