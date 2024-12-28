import React from 'react';
import { System } from '../../types/system';
import SystemCard from './SystemCard';

interface SystemGridProps {
  systems: System[];
  onSystemSelect: (systemId: string) => void;
}

// Mock backgrounds data
const mockBackgrounds: Record<string, string> = {
  nes: 'https://images.unsplash.com/photo-1599933310642-8f07bdaa6dc7?w=800',
  snes: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
  genesis: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
  arcade: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800'
};

export default function SystemGrid({ systems, onSystemSelect }: SystemGridProps) {
  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Systems
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {systems.map((system) => (
          <SystemCard
            key={system.id}
            system={system}
            onSelect={onSystemSelect}
            background={mockBackgrounds[system.id]}
          />
        ))}
      </div>
    </div>
  );
}