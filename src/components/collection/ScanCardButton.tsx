import React, { useState } from 'react';
import { Scan, Loader2 } from 'lucide-react';

interface ScanCardButtonProps {
  onScan: (nfcId: string) => Promise<boolean>;
}

export default function ScanCardButton({ onScan }: ScanCardButtonProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setError(null);

    try {
      if (!('NDEFReader' in window)) {
        throw new Error('NFC scanning is not supported on this device');
      }

      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', async ({ message }: any) => {
        const nfcId = message.records[0].data;
        const success = await onScan(nfcId);
        
        if (!success) {
          setError('Invalid or unknown card');
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan card');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleScan}
        disabled={scanning}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanning ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Scan className="w-5 h-5" />
        )}
        {scanning ? 'Scanning...' : 'Scan Card'}
      </button>

      {error && (
        <div className="absolute top-full mt-2 w-48 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}