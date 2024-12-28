import React from 'react';
import { System } from '../../types/system';
import { Gamepad2, Cpu, Sword, Joystick } from 'lucide-react';

const iconMap = {
  Gamepad2,
  Cpu,
  Sword,
  Joystick,
};

interface SystemCardProps {
  system: System;
  onSelect: (systemId: string) => void;
  background?: string;
}

export default function SystemCard({ system, onSelect, background }: SystemCardProps) {
  if (system.component) {
    return <>{system.component}</>;
  }

  const IconComponent = system.icon ? iconMap[system.icon as keyof typeof iconMap] : Gamepad2;

  // Mock backgrounds for demo
  const mockBackgrounds: Record<string, string> = {
    nes: 'https://images.unsplash.com/photo-1599933310642-8f07bdaa6dc7?w=800',
    snes: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
    genesis: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
    arcade: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800'
  };

  const backgroundImage = background || mockBackgrounds[system.id];

  return (
    <button
      onClick={() => onSelect(system.id)}
      className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt={system.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient || 'from-gray-500 to-gray-600'} opacity-90 group-hover:opacity-100 transition-opacity`} />
      )}

      <div className="absolute inset-0 p-6 flex flex-col">
        <div className="flex items-start justify-between">
          <IconComponent className="w-10 h-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
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