import React from 'react';
import { Game } from '../types';
import GameCard from './game/GameCard';
import { groupGamesByLetter } from '../utils/gameUtils';

interface GameGridProps {
  games: Game[];
  onGameSelect: (game: Game) => void;
}

export default function GameGrid({ games, onGameSelect }: GameGridProps) {
  const groupedGames = groupGamesByLetter(games);

  return (
    <div className="p-4 space-y-8">
      {Object.entries(groupedGames).map(([letter, letterGames]) => (
        <div key={letter} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white px-2">
            {letter}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {letterGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onGameSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}