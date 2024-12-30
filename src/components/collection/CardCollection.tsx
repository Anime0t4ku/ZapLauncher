import React from 'react';
import { useCardCollection } from '../../hooks/useCardCollection';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import CardGrid from './CardGrid';
import ScanCardButton from './ScanCardButton';

export default function CardCollection() {
  const { cards, loading, error, addCard } = useCardCollection();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="flex justify-center">
          <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No Cards Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          Start your collection by scanning Zaparoo NFC cards for your games.
        </p>
        <div className="pt-4">
          <ScanCardButton onScan={addCard} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Collection
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} collected
          </p>
        </div>
        <ScanCardButton onScan={addCard} />
      </div>
      <CardGrid cards={cards} />
    </div>
  );
}