import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import ConnectionStatus from '../ConnectionStatus';

interface IPAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  isConnected: boolean;
}

export default function IPAddressInput({ value, onChange, isConnected }: IPAddressInputProps) {
  const [error, setError] = useState<string>('');

  const validateIP = (ip: string): boolean => {
    if (!ip) return true; // Allow empty for initial state
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!pattern.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (validateIP(newValue)) {
      setError('');
      onChange(newValue);
    } else {
      setError('Please enter a valid IP address (e.g., 192.168.1.1)');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          MiSTer IP Address
        </label>
        <ConnectionStatus isConnected={isConnected} />
      </div>
      <div className="relative">
        <Network className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="192.168.1.100"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:text-white transition-colors"
          aria-label="MiSTer IP Address"
        />
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}