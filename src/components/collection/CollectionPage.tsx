import React from 'react';
import { useCardCollection } from '../../hooks/useCardCollection';
import { Loader2, Trophy } from 'lucide-react';
import Carousel from '../ui/Carousel';
import CarouselItem from '../ui/CarouselItem';

export default function CollectionPage() {
  const { cards, loading } = useCardCollection();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Group cards by rarity
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.rarity]) {
      acc[card.rarity] = [];
    }
    acc[card.rarity].push(card);
    return acc;
  }, {} as Record<string, typeof cards>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Featured Card */}
      {cards.length > 0 && (
        <div className="relative h-[60vh] min-h-[500px] mb-8">
          <img
            src={cards[0].artwork_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}
            alt="Featured Card"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-yellow-400 font-semibold uppercase">
                  {cards[0].rarity}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {cards[0].game_title || 'Collector\'s Item'}
              </h1>
              <p className="text-gray-200 text-lg">
                Collected on {new Date(cards[0].collected_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card Collections by Rarity */}
      {Object.entries(groupedCards).map(([rarity, rarityCards]) => (
        <Carousel key={rarity} title={`${rarity} Cards`}>
          {rarityCards.map((card) => (
            <CarouselItem key={card.nfc_id}>
              <img
                src={card.artwork_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}
                alt={card.game_title || 'Card'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-white font-semibold">
                    {card.game_title || 'Collector\'s Card'}
                  </h3>
                  <p className="text-gray-200 text-sm">
                    {new Date(card.collected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      ))}
    </div>
  );
}