import { useState, useEffect, useCallback } from 'react';
import { WebSocketService } from '../services/websocketService';
import { useMisterSettings } from './useMisterSettings';

export function useWebSocket() {
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings, updateSettings } = useMisterSettings();

  const getWebSocketUrl = useCallback((ipAddress: string) => {
    // Remove protocol and trailing slashes
    const cleanIp = ipAddress.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return cleanIp;
  }, []);

  const connect = useCallback(async () => {
    if (!settings?.ip_address) {
      setError('MiSTer IP address not configured');
      return;
    }

    try {
      const service = new WebSocketService(getWebSocketUrl(settings.ip_address));
      await service.connect();
      setWsService(service);
      setIsConnected(true);
      setError(null);
      await updateSettings(settings.ip_address, true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to MiSTer';
      setError(errorMsg);
      await updateSettings(settings.ip_address, false);
      console.error('WebSocket connection error:', err);
    }
  }, [settings?.ip_address, updateSettings]);

  const disconnect = useCallback(() => {
    wsService?.disconnect();
    setWsService(null);
    setIsConnected(false);
    if (settings?.ip_address) {
      updateSettings(settings.ip_address, false);
    }
  }, [wsService]);

  const launchGame = useCallback((gamePath: string) => {
    if (!wsService || !isConnected) {
      console.error('Cannot launch game: WebSocket not connected');
      return;
    }

    const isProt = settings.ip_address.startsWith('http://') || settings.ip_address.startsWith('https://');
    const prot = isProt ? '' : 'http://';
    const encodedUrl = encodeURIComponent(gamePath).replace(/%2F/g, '/').replace(/%20/g, ' ');
    const launchUrl = `${prot}${getWebSocketUrl(settings.ip_address)}:7497/l/${encodedUrl}`;
    window.location.href = launchUrl;
  }, [wsService, isConnected, settings?.ip_address]);

  useEffect(() => {
    if (settings?.ip_address) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [settings?.ip_address, connect, disconnect]);

  return { isConnected, error, launchGame };
}