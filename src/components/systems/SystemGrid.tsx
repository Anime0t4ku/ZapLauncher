import React from 'react';
import { System } from '../../types/system';
import SystemCard from './SystemCard';

interface SystemGridProps {
  systems: System[];
  onSystemSelect: (systemId: string) => void;
}

export default function SystemGrid({ systems, onSystemSelect }: SystemGridProps) {
  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Systems
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {systems.map((system) => (
          <SystemCard
            key={system.id}
            system={system}
            onSelect={onSystemSelect}
          />
        ))}
      </div>
    </div>
  );
}