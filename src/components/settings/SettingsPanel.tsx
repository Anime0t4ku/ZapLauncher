import React from 'react';
import { Settings } from 'lucide-react';
import IPAddressInput from './IPAddressInput';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function SettingsPanel() {
  const [ipAddress, setIpAddress] = useLocalStorage('mister-ip', '');

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
      <div className="flex items-center space-x-2 px-4 mb-3">
        <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Settings
        </h3>
      </div>
      <div className="px-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          MiSTer IP Address
        </label>
        <IPAddressInput
          value={ipAddress}
          onChange={setIpAddress}
        />
      </div>
    </div>
  );
}