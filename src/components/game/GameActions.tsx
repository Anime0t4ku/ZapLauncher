import React from 'react';
import { Plus } from 'lucide-react';
import Tooltip from '../Tooltip';

interface GameActionsProps {
  onAddGame: () => void;
}

export default function GameActions({ onAddGame }: GameActionsProps) {
  return (
    <div className="fixed bottom-24 right-6 z-40">
      <Tooltip content="Add a new game" position="left">
      <button
        onClick={onAddGame}
        className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Add game"
      >
        <Plus className="w-6 h-6" />
      </button>
      </Tooltip>
    </div>
  );
}