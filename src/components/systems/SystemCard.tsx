import React from 'react';
import { System } from '../../types/system';
import { Gamepad2, Cpu, Sword, Joystick } from 'lucide-react';
import BackgroundUpload from './BackgroundUpload';

const iconMap = {
  Gamepad2,
  Cpu,
  Sword,
  Joystick,
};

interface SystemCardProps {
  system: System;
  onSelect: (systemId: string) => void;
  background?: string | null;
  onBackgroundUpdate?: (url: string) => void;
  canEdit?: boolean;
}

export default function SystemCard({ 
  system, 
  onSelect, 
  background,
  onBackgroundUpdate,
  canEdit = false 
}: SystemCardProps) {
  if (system.component) {
    return <>{system.component}</>;
  }

  const IconComponent = system.icon ? iconMap[system.icon as keyof typeof iconMap] : Gamepad2;

  const handleBackgroundUpdate = (url: string) => {
    onBackgroundUpdate?.(url);
  };

  return (
    <button
      onClick={() => onSelect(system.id)}
      className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br"
    >
      {background ? (
        <>
          <img
            src={background}
            alt={system.name}
            className="absolute inset-0 w-full h-full object-cover object-center bg-gray-200 dark:bg-gray-700"
            crossOrigin="anonymous"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              console.error(`Failed to load image for ${system.name}:`, target.src);
              
              // Remove the broken image and show gradient background
              target.style.display = 'none';
              
              // Update overlay to use gradient
              const overlay = target.nextElementSibling;
              if (overlay) {
                overlay.className = `absolute inset-0 bg-gradient-to-br ${system.gradient || 'from-gray-500 to-gray-600'} opacity-90 group-hover:opacity-100 transition-opacity`;
              }
            }}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors backdrop-blur-[2px]" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient || 'from-gray-500 to-gray-600'} opacity-90 group-hover:opacity-100 transition-opacity`} />
      )}

      <div className="absolute inset-0 p-6 flex flex-col">
        <div className="flex items-start justify-between">
          <IconComponent className="w-10 h-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
          {canEdit && (
            <div className="relative z-10">
              <BackgroundUpload
                systemId={system.id}
                onUploadComplete={handleBackgroundUpdate}
              />
            </div>
          )}
        </div>
        <div className="mt-auto">
          <h3 className="text-white text-xl font-bold text-left">{system.name}</h3>
          {system.manufacturer && (
            <p className="text-white/80 text-sm">{system.manufacturer}</p>
          )}
        </div>
      </div>
    </button>
  );
}