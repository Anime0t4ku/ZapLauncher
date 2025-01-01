import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, CreditCard, Gamepad2, Cpu, Sword, Joystick, X } from 'lucide-react';
import { systems } from '../data/systems';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  Gamepad2,
  Cpu,
  Sword,
  Joystick
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden animate-fade-in" />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-[280px] max-w-[85%] bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Navigation
              </h3>

              <nav className="space-y-1">
                <button
                  onClick={() => handleNavigation('/')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  <Star className="w-4 h-4" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => handleNavigation('/collection')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Collection</span>
                </button>

                <button
                  onClick={() => handleNavigation('/leaderboard')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Leaderboard</span>
                </button>
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Systems
              </h3>
              <nav className="space-y-1">
                {systems.map((system) => {
                  const IconComponent = system.icon ? iconMap[system.icon as keyof typeof iconMap] : Gamepad2;
                  return (
                    <button
                      key={system.id}
                      onClick={() => handleNavigation(`/system/${system.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{system.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}