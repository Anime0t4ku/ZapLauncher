import React from 'react';
import { Wifi, WifiOff, Gamepad2 } from 'lucide-react';
import { useZaparoo } from '../hooks/useZaparoo';

export default function ConnectionStatus() {
  const { isConnected, error } = useZaparoo();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
      isConnected 
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    }`}>
      {isConnected ? (
        <>
          <Gamepad2 className="w-4 h-4" />
          <span>Zaparoo Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" title={error || 'Disconnected'} />
          <span>Zaparoo Disconnected</span>
        </>
      )}
    </div>
  );
}