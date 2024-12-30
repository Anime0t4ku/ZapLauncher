import React, { useState } from 'react';
import { Network, Save } from 'lucide-react';
import ConnectionStatus from '../ConnectionStatus';
import { useEffect } from 'react';

interface IPAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  isConnected: boolean;
}

export default function IPAddressInput({ value, onChange, isConnected }: IPAddressInputProps) {
  const [error, setError] = useState<string>('');
  const [localValue, setLocalValue] = useState(value);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalValue(value);
    setIsDirty(false);
  }, [value]);

  const validateIP = (ip: string): boolean => {
    if (!ip) return true; // Allow empty for initial state
    // Allow IP with optional protocol and port
    const pattern = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
    if (!pattern.test(ip)) return false;
    
    // Extract IP part without protocol
    const ipPart = ip.replace(/^https?:\/\//, '').split(':')[0];
    const parts = ipPart.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(true);
    if (validateIP(newValue)) {
      setError('');
    } else {
      setError('Please enter a valid IP address (e.g., 192.168.1.1)');
    }
  };

  const handleSave = () => {
    if (validateIP(localValue)) {
      onChange(localValue);
      setIsDirty(false);
      setError('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && isDirty) {
      handleSave();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          MiSTer IP Address (e.g., 192.168.1.100)
        </label>
        <ConnectionStatus isConnected={isConnected} />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Network className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter MiSTer IP address"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:text-white transition-colors text-base"
            aria-label="MiSTer IP Address"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || !!error}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Save</span>
        </button>
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}