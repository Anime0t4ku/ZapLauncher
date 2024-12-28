import { Settings, ArrowLeft, Zap, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ConnectionStatus from './ConnectionStatus';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onOpenSettings: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Navbar({ onOpenSettings, onBack, showBack }: NavbarProps) {
  const { isConnected } = useWebSocket();
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-50">
      <div className="flex items-center justify-between">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <ConnectionStatus isConnected={isConnected} />
          <ThemeToggle />
          <button
            onClick={signOut}
            className="p-2 rounded-lg transition-colors dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg transition-colors dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}