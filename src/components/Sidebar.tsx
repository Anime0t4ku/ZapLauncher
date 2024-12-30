import React, { useEffect, useRef } from 'react';
import { System } from '../types/system';
import { Star, Trophy, Gamepad2, Cpu, Sword, Joystick, ChevronRight } from 'lucide-react';
import Tooltip from './Tooltip';
import ThemeToggle from './ThemeToggle';

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
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in touch-none"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-[280px] max-w-[85%] bg-gray-50 dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Dashboards
            </h2>

            <nav className="space-y-1">
              <button 
                onClick={() => onCoreSelect(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm
                  ${!selectedCore 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Tooltip content="View all your games and systems">
                  <div className="flex items-center gap-3">
                  <Star className="w-4 h-4" />
                  <span>Overview</span>
                  </div>
                </Tooltip>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
              </button>

              <button
                onClick={() => onCoreSelect('leaderboard')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                <Tooltip content="Check global rankings and achievements">
                  <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4" />
                  <span>Leaderboard</span>
                  </div>
                </Tooltip>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
              </button>
            </nav>
          </div>

          <div className="px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Systems
            </h2>
            <nav className="space-y-1">
              {systems?.map((system) => {
                const IconComponent = iconMap[system.icon as keyof typeof iconMap];
                return (
                  <button
                    key={system.id}
                    onClick={() => onCoreSelect(system.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm group
                      ${selectedCore === system.id 
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4" />
                      <span>{system.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}