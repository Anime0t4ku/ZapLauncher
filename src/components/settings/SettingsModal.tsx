import React from 'react';
import { X, Settings as SettingsIcon, Network } from 'lucide-react';
import IPAddressInput from './IPAddressInput';
import { useMisterSettings } from '../../hooks/useMisterSettings';
import { useWebSocket } from '../../hooks/useWebSocket';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useMisterSettings();
  const { isConnected } = useWebSocket();

  const handleIpChange = async (newIp: string) => {
    try {
      await updateSettings(newIp, isConnected);
    } catch (error) {
      console.error('Failed to update MiSTer settings:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen sm:flex sm:items-center sm:p-4">
        <div className="w-full sm:max-w-2xl mx-auto bg-white dark:bg-gray-800 sm:rounded-2xl shadow-xl animate-fade-in">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
                  <Network className="w-5 h-5" />
                  Connection Settings
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <IPAddressInput
                    value={settings?.ip_address || ''}
                    onChange={handleIpChange}
                    isConnected={isConnected}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}