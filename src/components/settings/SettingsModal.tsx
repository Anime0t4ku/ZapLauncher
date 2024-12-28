import React, { useState } from 'react';
import { X, Users, Shield, Settings as SettingsIcon } from 'lucide-react';
import IPAddressInput from './IPAddressInput';
import UserManagement from '../admin/UserManagement';
import ParentalControls from '../admin/ParentalControls';
import { useMisterSettings } from '../../hooks/useMisterSettings';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';

type SettingsTab = 'general' | 'users' | 'parental';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useMisterSettings();
  const { user, isAdmin, isParent } = useAuth();
  const { isConnected } = useWebSocket();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

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
        <div className="w-full sm:max-w-4xl mx-auto bg-white dark:bg-gray-800 sm:rounded-2xl shadow-xl animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-5 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            General
          </button>

          {(isAdmin || isParent) && (
            <button
              onClick={() => setActiveTab('parental')}
              className={`flex items-center gap-2 px-6 py-5 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'parental'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Shield className="w-5 h-5" />
              Parental Controls
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-5 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              Users
            </button>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Connection Settings
              </h3>
              <IPAddressInput
                value={settings?.ip_address || ''}
                onChange={handleIpChange}
                isConnected={isConnected}
              />
            </div>
          )}

          {activeTab === 'users' && isAdmin && (
            <UserManagement />
          )}

          {activeTab === 'parental' && (isAdmin || isParent) && (
            <ParentalControls userId={user?.id || ''} />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}