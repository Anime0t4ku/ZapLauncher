import React from 'react';
import { System } from '../../types/system';
import { Gamepad2, Cpu, Sword, Joystick } from 'lucide-react';

const iconMap = {
  Gamepad2,
  Cpu,
  Sword,
  Joystick
};

interface SystemCardProps {
  system: System;
  onSelect: (systemId: string) => void;
}

export default function SystemCard({ system, onSelect }: SystemCardProps) {
  if (system.component) {
    return <>{system.component}</>;
  }

  const IconComponent = system.icon ? iconMap[system.icon as keyof typeof iconMap] : Gamepad2;

  return (
    <button
      onClick={() => onSelect(system.id)}
      className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient || 'from-gray-500 to-gray-600'} opacity-90 group-hover:opacity-100 transition-opacity`} />
      
      <div className="absolute inset-0 p-6 flex flex-col">
        <div className="flex items-start justify-between">
          <IconComponent className="w-8 h-8 text-white/90" />
          {system.year && (
            <span className="text-sm font-medium text-white/80">{system.year}</span>
          )}
        </div>
        
        <div className="mt-auto">
          <h3 className="text-xl font-bold text-white mb-1">
            {system.shortName || system.name}
          </h3>
          {system.manufacturer && (
            <p className="text-sm text-white/80">
              {system.manufacturer}
            </p>
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </button>
  );
}