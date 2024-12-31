import { useState, useEffect, useCallback } from 'react';
import { ZaparooService } from '../services/zaparooService';
import { useMisterSettings } from './useMisterSettings';

export function useZaparoo() {
  const [zaparoo, setZaparoo] = useState<ZaparooService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useMisterSettings();

  const connect = useCallback(async () => {
    if (!settings?.ip_address) {
      setError('MiSTer IP address not configured');
      return;
    }

    try {
      const service = new ZaparooService(settings.ip_address);
      await service.connect();
      setZaparoo(service);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to Zaparoo';
      setError(errorMsg);
      console.error('Zaparoo connection error:', err);
    }
  }, [settings?.ip_address]);

  const disconnect = useCallback(() => {
    zaparoo?.disconnect();
    setZaparoo(null);
    setIsConnected(false);
  }, [zaparoo]);

  const launchGame = useCallback(async (path: string) => {
    if (!zaparoo || !isConnected) {
      throw new Error('Zaparoo not connected');
    }

    try {
      await zaparoo.launchGame(path);
    } catch (err) {
      console.error('Failed to launch game:', err);
      throw err;
    }
  }, [zaparoo, isConnected]);

  useEffect(() => {
    if (settings?.ip_address) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [settings?.ip_address, connect, disconnect]);

  return {
    isConnected,
    error,
    launchGame,
    searchGames: zaparoo?.searchGames.bind(zaparoo),
    getActiveSystems: zaparoo?.getActiveSystems.bind(zaparoo),
    getActiveMedia: zaparoo?.getActiveMedia.bind(zaparoo)
  };
}