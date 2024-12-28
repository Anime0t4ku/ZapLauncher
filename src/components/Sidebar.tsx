import React from 'react';
import { System } from '../types/system';
import { X, Star, Clock, Gamepad2, Cpu, Sword, Joystick } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './settings/SettingsPanel';

const iconMap = {
  Gamepad2,
  Cpu,
  Sword,
  Joystick
};

interface SidebarProps {
  systems: System[];
  isOpen: boolean;
  onClose: () => void;
  selectedCore: string | null;
  onCoreSelect: (coreId: string | null) => void;
}

export default function Sidebar({ 
  systems, 
  isOpen, 
  onClose,
  selectedCore,
  onCoreSelect 
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85%] bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-30 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">MiSTer FPGA</h2>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-full lg:hidden"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => onCoreSelect(null)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                ${!selectedCore ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}
            >
              <Star className="w-5 h-5" />
              <span>Favorites</span>
            </button>

            <button
              onClick={() => onCoreSelect(null)}
              className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <Clock className="w-5 h-5" />
              <span>Recent</span>
            </button>

            <div className="pt-4">
              <h3 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Systems
              </h3>
              {systems?.map((system) => {
                const IconComponent = iconMap[system.icon as keyof typeof iconMap];
                return (
                  <button
                    key={system.id}
                    onClick={() => onCoreSelect(system.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                      ${selectedCore === system.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{system.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto">
            <SettingsPanel />
          </div>
        </div>
      </aside>
    </>
  );
}