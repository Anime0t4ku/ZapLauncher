import React from 'react';
import { System } from '../types/system';
import { X, Star, Clock, Gamepad2, Cpu, Sword, Joystick, Zap, PanelLeftClose } from 'lucide-react';
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[300px] max-w-[85%] bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold dark:text-white">MiSTer FPGA</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <PanelLeftClose className="w-5 h-5 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
            <button 
              onClick={() => onCoreSelect(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-[0.98]
                ${!selectedCore 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">All Games</span>
            </button>

            <button
              onClick={() => onCoreSelect(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98] font-medium"
            >
              <Clock className="w-5 h-5" />
              <span>Recent</span>
            </button>

            <div className="mt-8">
              <h3 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Systems
              </h3>
              {systems?.map((system) => {
                const IconComponent = iconMap[system.icon as keyof typeof iconMap];
                return (
                  <button
                    key={system.id}
                    onClick={() => onCoreSelect(system.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-[0.98]
                      ${selectedCore === system.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{system.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          
          <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}