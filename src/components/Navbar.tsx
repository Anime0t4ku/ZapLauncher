import React from 'react';
import { Settings, ArrowLeft, Zap } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import { useWebSocket } from '../hooks/useWebSocket';

interface NavbarProps {
  onOpenSettings: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Navbar({ onOpenSettings, onBack, showBack }: NavbarProps) {
  const { isConnected } = useWebSocket();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ZapBox
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ConnectionStatus isConnected={isConnected} />
            
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}