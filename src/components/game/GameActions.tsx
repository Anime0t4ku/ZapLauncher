import React from 'react';
import { Plus } from 'lucide-react';

interface GameActionsProps {
  onAddGame: () => void;
}

export default function GameActions({ onAddGame }: GameActionsProps) {
  return (
    <div className="fixed bottom-24 right-6 z-40">
      <button
        onClick={onAddGame}
        className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Add game"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}