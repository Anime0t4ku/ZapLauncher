import React from 'react';
import { System } from '../../types/system';
import SystemCard from './SystemCard';
import { useSystemImages } from '../../hooks/useSystemImages';
import { useAuth } from '../../hooks/useAuth';

interface SystemGridProps {
  systems: System[];
  onSystemSelect: (systemId: string) => void;
}

export default function SystemGrid({ systems, onSystemSelect }: SystemGridProps) {
  const { getImageUrl, refresh } = useSystemImages();
  const { user } = useAuth();

  const handleBackgroundUpdate = async (systemId: string, url: string) => {
    await refresh();
  };

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
            background={getImageUrl(system.id, 'background')}
            onBackgroundUpdate={(url) => handleBackgroundUpdate(system.id, url)}
            canEdit={!!user}
          />
        ))}
      </div>
    </div>
  );
}