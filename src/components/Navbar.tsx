import React from 'react';
import { ArrowLeft, PanelLeftOpen } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import ProfileMenu from './ProfileMenu';

interface NavbarProps {
  onOpenSettings: () => void;
  onMenuClick: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Navbar({ onOpenSettings, onMenuClick, onBack, showBack }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <button
                onClick={onMenuClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div className="flex items-center">
              <img
                src="https://ifrwkujnkpodngmrtgqf.supabase.co/storage/v1/object/public/zaplogos/ZapLauncher%20-%20Black.png?t=2024-12-31T18%3A40%3A52.370Z"
                alt="ZapLauncher"
                className="h-8 dark:hidden"
              />
              <img
                src="https://ifrwkujnkpodngmrtgqf.supabase.co/storage/v1/object/public/zaplogos/ZapLauncher%20-%20White.png"
                alt="ZapLauncher"
                className="h-8 hidden dark:block"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectionStatus />
            
            <ProfileMenu onOpenSettings={onOpenSettings} />
          </div>
        </div>
      </div>
    </nav>
  );
}